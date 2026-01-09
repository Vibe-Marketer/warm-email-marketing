#!/usr/bin/env node
/**
 * Setup Listmonk Admin Account
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
const LISTMONK_URL = ENV.LISTMONK_URL;
const LISTMONK_ADMIN_USER = ENV.LISTMONK_ADMIN_USER;
const LISTMONK_ADMIN_PASSWORD = ENV.LISTMONK_ADMIN_PASSWORD;

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData, rawData: data, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, rawData: data, headers: res.headers });
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

async function setupAdmin() {
    console.log('🚀 Setting up Listmonk Admin Account');
    console.log('='.repeat(60) + '\n');

    const url = new URL(LISTMONK_URL);

    // Step 1: Check if setup is needed
    console.log('1. Checking if admin account exists...');
    const checkOptions = {
        hostname: url.hostname,
        path: '/api/health',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const healthCheck = await makeRequest(checkOptions);
        if (healthCheck.status !== 200) {
            console.log('   ⚠️  API not ready yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log('   ✅ API is ready');
        }
    } catch (e) {
        console.log(`   ❌ Cannot reach Listmonk: ${e.message}`);
        process.exit(1);
    }

    // Step 2: Try to login with existing credentials
    console.log('\n2. Testing existing credentials...');
    const auth = Buffer.from(`${LISTMONK_ADMIN_USER}:${LISTMONK_ADMIN_PASSWORD}`).toString('base64');
    const authOptions = {
        hostname: url.hostname,
        path: '/api/settings',
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const authResult = await makeRequest(authOptions);

        if (authResult.status === 200) {
            console.log('   ✅ Admin account already exists and credentials work!');
            console.log(`   Username: ${LISTMONK_ADMIN_USER}`);
            return true;
        } else if (authResult.status === 401) {
            console.log('   ⚠️  Credentials invalid, need to create admin account');
        }
    } catch (e) {
        console.log(`   ⚠️  Could not authenticate: ${e.message}`);
    }

    // Step 3: Create admin account via setup
    console.log('\n3. Creating admin account...');
    const setupData = {
        username: LISTMONK_ADMIN_USER,
        email: `${LISTMONK_ADMIN_USER}@callvaultai.com`,
        password: LISTMONK_ADMIN_PASSWORD
    };

    const setupOptions = {
        hostname: url.hostname,
        path: '/api/admin/setup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const setupResult = await makeRequest(setupOptions, setupData);

        if (setupResult.status === 200 || setupResult.status === 201) {
            console.log('   ✅ Admin account created successfully!');
            console.log(`   Username: ${LISTMONK_ADMIN_USER}`);
            console.log(`   Email: ${setupData.email}`);
            return true;
        } else {
            console.log(`   ⚠️  Setup returned: ${setupResult.status}`);
            console.log(`   Response: ${setupResult.rawData}`);
            return false;
        }
    } catch (e) {
        console.log(`   ❌ Error during setup: ${e.message}`);
        return false;
    }
}

async function main() {
    const success = await setupAdmin();

    console.log('\n' + '='.repeat(60));
    if (success) {
        console.log('✅ Admin setup complete!');
        console.log('\n📋 You can now:');
        console.log(`   - Access admin: ${LISTMONK_URL}/admin`);
        console.log(`   - Username: ${LISTMONK_ADMIN_USER}`);
        console.log('   - Configure SMTP with Resend');
        console.log('   - Send test emails');
    } else {
        console.log('❌ Setup failed');
        console.log('\nPlease try manually:');
        console.log(`   1. Go to ${LISTMONK_URL}/admin`);
        console.log('   2. Complete the setup wizard');
    }
    console.log('='.repeat(60) + '\n');
}

main();
