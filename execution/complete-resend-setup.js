#!/usr/bin/env node
/**
 * Complete Resend Setup in Listmonk
 * This script will:
 * 1. Verify admin login
 * 2. Configure SMTP with Resend
 * 3. Create a test subscriber
 * 4. Send a test email
 *
 * VERSION: 2026.01.09
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    return env;
}

const ENV = loadEnv();
const RESEND_API_KEY = ENV.RESEND_API_KEY;
const LISTMONK_URL = ENV.LISTMONK_URL;
const LISTMONK_ADMIN_USER = ENV.LISTMONK_ADMIN_USER;
const LISTMONK_ADMIN_PASSWORD = ENV.LISTMONK_ADMIN_PASSWORD;
const FROM_EMAIL = 'hello@mail.callvaultai.com';
const SENDING_DOMAIN = 'mail.callvaultai.com';

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, rawData: data });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, rawData: data });
                }
            });
        });

        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function verifyLogin() {
    console.log('🔐 Verifying admin login...');

    const url = new URL(LISTMONK_URL);
    const auth = Buffer.from(`${LISTMONK_ADMIN_USER}:${LISTMONK_ADMIN_PASSWORD}`).toString('base64');

    const options = {
        hostname: url.hostname,
        path: '/api/settings',
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await makeRequest(options);

        if (result.status === 200) {
            console.log('   ✅ Login successful!\n');
            return { success: true, auth, settings: result.data.data || result.data };
        } else if (result.status === 401) {
            console.log('   ❌ Login failed - invalid credentials\n');
            return { success: false };
        } else {
            console.log(`   ⚠️  Unexpected response: ${result.status}\n`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return { success: false };
    }
}

async function configureSmtp(auth, currentSettings) {
    console.log('📧 Configuring SMTP with Resend...');

    const url = new URL(LISTMONK_URL);
    const currentSmtp = currentSettings.smtp || [];

    // Check if Resend already configured
    const resendExists = currentSmtp.find(s => s.host === 'smtp.resend.com');

    if (resendExists) {
        console.log('   ℹ️  Resend SMTP already configured');
        console.log(`   Status: ${resendExists.enabled ? '✅ enabled' : '❌ disabled'}\n`);
        return { success: true, alreadyExists: true };
    }

    // Add Resend SMTP
    const newSmtp = {
        enabled: true,
        host: 'smtp.resend.com',
        port: 465,
        auth_protocol: 'login',
        username: 'resend',
        password: RESEND_API_KEY,
        hello_hostname: '',
        tls_enabled: true,
        tls_skip_verify: false,
        max_conns: 10,
        idle_timeout: '15s',
        wait_timeout: '5s',
        max_msg_retries: 2,
        email_headers: []
    };

    currentSmtp.push(newSmtp);

    const updatedSettings = {
        ...currentSettings,
        smtp: currentSmtp
    };

    const options = {
        hostname: url.hostname,
        path: '/api/settings',
        method: 'PUT',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await makeRequest(options, updatedSettings);

        if (result.status === 200) {
            console.log('   ✅ Resend SMTP configured successfully!');
            console.log(`   Host: smtp.resend.com`);
            console.log(`   Port: 465`);
            console.log(`   From: ${FROM_EMAIL}\n`);
            return { success: true, alreadyExists: false };
        } else {
            console.log(`   ❌ Failed to configure SMTP: ${result.status}`);
            console.log(`   ${result.rawData}\n`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return { success: false };
    }
}

async function createTestList(auth) {
    console.log('📋 Creating test list...');

    const url = new URL(LISTMONK_URL);

    // Check if test list already exists
    const listOptions = {
        hostname: url.hostname,
        path: '/api/lists',
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const listResult = await makeRequest(listOptions);
        const lists = listResult.data.data?.results || [];
        const testList = lists.find(l => l.name === 'Test List');

        if (testList) {
            console.log(`   ℹ️  Test list already exists (ID: ${testList.id})\n`);
            return { success: true, listId: testList.id };
        }
    } catch (e) {
        // Continue to create
    }

    // Create test list
    const createData = {
        name: 'Test List',
        type: 'public',
        optin: 'single',
        tags: ['test']
    };

    const createOptions = {
        hostname: url.hostname,
        path: '/api/lists',
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await makeRequest(createOptions, createData);

        if (result.status === 200) {
            const listId = result.data.data.id;
            console.log(`   ✅ Test list created (ID: ${listId})\n`);
            return { success: true, listId };
        } else {
            console.log(`   ❌ Failed to create list: ${result.status}\n`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return { success: false };
    }
}

async function createTestSubscriber(auth, listId, testEmail) {
    console.log(`📬 Creating test subscriber: ${testEmail}...`);

    const url = new URL(LISTMONK_URL);

    const subData = {
        email: testEmail,
        name: 'Test User',
        status: 'enabled',
        lists: [listId],
        attribs: {}
    };

    const options = {
        hostname: url.hostname,
        path: '/api/subscribers',
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await makeRequest(options, subData);

        if (result.status === 200) {
            console.log(`   ✅ Test subscriber created\n`);
            return { success: true };
        } else if (result.status === 409 || (result.rawData && result.rawData.includes('duplicate'))) {
            console.log(`   ℹ️  Subscriber already exists\n`);
            return { success: true };
        } else {
            console.log(`   ⚠️  Response: ${result.status}`);
            console.log(`   ${result.rawData}\n`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return { success: false };
    }
}

async function sendTestCampaign(auth, listId) {
    console.log('📤 Sending test campaign...');

    const url = new URL(LISTMONK_URL);

    const campaignData = {
        name: `Test Campaign - ${new Date().toISOString()}`,
        subject: 'Test Email from Listmonk + Resend',
        lists: [listId],
        from_email: FROM_EMAIL,
        type: 'regular',
        content_type: 'html',
        body: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333;">🎉 Test Email Successful!</h1>
    <p>If you're reading this, your email system is working perfectly!</p>

    <h2>What's working:</h2>
    <ul>
        <li>✅ Listmonk is running</li>
        <li>✅ Resend is configured</li>
        <li>✅ DNS records are set up</li>
        <li>✅ Emails are landing in inboxes!</li>
    </ul>

    <p><strong>From:</strong> ${FROM_EMAIL}</p>
    <p><strong>Domain:</strong> ${SENDING_DOMAIN}</p>

    <hr style="border: 1px solid #eee; margin: 20px 0;">

    <p style="color: #666; font-size: 14px;">
        This is a test email sent from your Listmonk email marketing system.
    </p>
</body>
</html>
        `,
        send_at: null
    };

    const options = {
        hostname: url.hostname,
        path: '/api/campaigns',
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await makeRequest(options, campaignData);

        if (result.status === 200) {
            const campaignId = result.data.data.id;
            console.log(`   ✅ Test campaign created (ID: ${campaignId})`);

            // Start the campaign
            const startOptions = {
                hostname: url.hostname,
                path: `/api/campaigns/${campaignId}/status`,
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            };

            const startData = { status: 'running' };
            const startResult = await makeRequest(startOptions, startData);

            if (startResult.status === 200) {
                console.log(`   ✅ Campaign sent!\n`);
                return { success: true };
            } else {
                console.log(`   ⚠️  Could not start campaign: ${startResult.status}\n`);
                return { success: false };
            }
        } else {
            console.log(`   ❌ Failed to create campaign: ${result.status}`);
            console.log(`   ${result.rawData}\n`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        return { success: false };
    }
}

async function main() {
    console.log('🚀 Complete Resend Setup for Listmonk');
    console.log('='.repeat(70) + '\n');

    // Ask for test email
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const testEmail = await new Promise(resolve => {
        rl.question('Enter your email address for test: ', answer => {
            rl.close();
            resolve(answer.trim());
        });
    });

    console.log('');

    try {
        // Step 1: Verify login
        const loginResult = await verifyLogin();
        if (!loginResult.success) {
            console.log('\n❌ Cannot proceed without valid login credentials');
            process.exit(1);
        }

        const { auth, settings } = loginResult;

        // Step 2: Configure SMTP
        const smtpResult = await configureSmtp(auth, settings);
        if (!smtpResult.success) {
            console.log('\n❌ SMTP configuration failed');
            process.exit(1);
        }

        // Step 3: Create test list
        const listResult = await createTestList(auth);
        if (!listResult.success) {
            console.log('\n❌ Could not create test list');
            process.exit(1);
        }

        // Step 4: Create test subscriber
        const subResult = await createTestSubscriber(auth, listResult.listId, testEmail);
        if (!subResult.success) {
            console.log('\n⚠️  Could not create test subscriber, but continuing...');
        }

        // Step 5: Send test campaign
        const campaignResult = await sendTestCampaign(auth, listResult.listId);

        console.log('='.repeat(70));
        if (campaignResult.success) {
            console.log('✅ SETUP COMPLETE!');
            console.log('\n📧 Test email sent to:', testEmail);
            console.log('\n📋 Next steps:');
            console.log('   1. Check your inbox (and spam folder)');
            console.log('   2. If email arrives: ✅ Everything is working!');
            console.log('   3. If not in spam: ✅ Great deliverability!');
            console.log(`   4. View campaign stats: ${LISTMONK_URL}/admin/campaigns`);
        } else {
            console.log('⚠️  SMTP configured but test email failed');
            console.log('\n📋 Manual steps:');
            console.log(`   1. Go to: ${LISTMONK_URL}/admin/campaigns`);
            console.log('   2. Create a new campaign');
            console.log('   3. Send to your test list');
            console.log('   4. Check delivery');
        }
        console.log('='.repeat(70) + '\n');

    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
