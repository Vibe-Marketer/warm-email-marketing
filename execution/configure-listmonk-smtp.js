#!/usr/bin/env node
/**
 * Configure Listmonk SMTP with Resend
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

async function getExistingSmtpServers() {
    console.log('🔍 Checking existing SMTP servers in Listmonk...\n');

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
            const settings = result.data.data || result.data;
            const smtp = settings.smtp || settings['smtp'] || [];

            console.log(`Found ${smtp.length} SMTP server(s)`);

            if (smtp.length > 0) {
                smtp.forEach((s, i) => {
                    console.log(`  ${i + 1}. ${s.host}:${s.port} (${s.enabled ? 'enabled' : 'disabled'})`);
                });
            }

            return smtp;
        } else if (result.status === 401) {
            console.error('❌ Authentication failed. Please check your Listmonk credentials.');
            console.error('   Make sure you have completed the admin setup wizard.');
            process.exit(1);
        } else {
            console.error(`⚠️  Could not fetch settings: ${result.status}`);
            console.error(result.rawData);
            return [];
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return [];
    }
}

async function addSmtpServer() {
    console.log('\n📧 Adding Resend SMTP server to Listmonk...\n');

    const url = new URL(LISTMONK_URL);
    const auth = Buffer.from(`${LISTMONK_ADMIN_USER}:${LISTMONK_ADMIN_PASSWORD}`).toString('base64');

    // Get current settings first
    const getOptions = {
        hostname: url.hostname,
        path: '/api/settings',
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    const getResult = await makeRequest(getOptions);

    if (getResult.status !== 200) {
        console.error(`❌ Could not fetch current settings: ${getResult.status}`);
        console.error(getResult.rawData);
        process.exit(1);
    }

    const currentSettings = getResult.data.data || getResult.data;
    const currentSmtp = currentSettings.smtp || [];

    // Check if Resend SMTP already exists
    const resendExists = currentSmtp.some(s => s.host === 'smtp.resend.com');

    if (resendExists) {
        console.log('ℹ️  Resend SMTP server already configured in Listmonk');
        console.log('   You can test it in Settings → SMTP');
        return;
    }

    // Add Resend SMTP to the list
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

    // Update settings
    const updatedSettings = {
        ...currentSettings,
        smtp: currentSmtp
    };

    const putOptions = {
        hostname: url.hostname,
        path: '/api/settings',
        method: 'PUT',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    const putResult = await makeRequest(putOptions, updatedSettings);

    if (putResult.status === 200) {
        console.log('✅ Resend SMTP server added successfully!');
        console.log('\n📧 SMTP Configuration:');
        console.log(`   Host: smtp.resend.com`);
        console.log(`   Port: 465`);
        console.log(`   From: ${FROM_EMAIL}`);
    } else {
        console.error(`❌ Failed to add SMTP server: ${putResult.status}`);
        console.error(putResult.rawData);
    }
}

async function main() {
    console.log('🚀 Configuring Listmonk SMTP with Resend');
    console.log('='.repeat(60) + '\n');

    try {
        // Check existing SMTP servers
        await getExistingSmtpServers();

        // Add Resend SMTP
        await addSmtpServer();

        console.log('\n✅ Configuration complete!');
        console.log('\n📋 Next steps:');
        console.log(`   1. Go to ${LISTMONK_URL}/admin/settings`);
        console.log('   2. Navigate to SMTP section');
        console.log('   3. Test the connection');
        console.log('   4. Create a test subscriber and send a test email\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
