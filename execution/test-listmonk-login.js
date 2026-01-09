#!/usr/bin/env node
/**
 * Test Listmonk Login
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

async function testLogin() {
    console.log('🔐 Testing Listmonk login...\n');

    const url = new URL(LISTMONK_URL);
    const auth = Buffer.from(`${LISTMONK_ADMIN_USER}:${LISTMONK_ADMIN_PASSWORD}`).toString('base64');

    // Test API health endpoint
    console.log('1. Testing API health...');
    const healthOptions = {
        hostname: url.hostname,
        path: '/api/health',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const healthResult = await makeRequest(healthOptions);
        if (healthResult.status === 200) {
            console.log('   ✅ API is healthy\n');
        } else {
            console.log(`   ⚠️  API returned: ${healthResult.status}\n`);
        }
    } catch (e) {
        console.log(`   ❌ Cannot reach API: ${e.message}\n`);
    }

    // Test authentication
    console.log('2. Testing authentication...');
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
            console.log('   ✅ Login successful!');
            console.log(`   Username: ${LISTMONK_ADMIN_USER}`);

            // Check SMTP settings
            const settings = authResult.data.data || authResult.data;
            const smtp = settings.smtp || [];

            console.log(`\n3. SMTP Configuration:`);
            if (smtp.length === 0) {
                console.log('   ⚠️  No SMTP servers configured yet');
                return { authenticated: true, smtpConfigured: false };
            } else {
                console.log(`   Found ${smtp.length} SMTP server(s):`);
                smtp.forEach((s, i) => {
                    console.log(`   ${i + 1}. ${s.host}:${s.port} (${s.enabled ? '✅ enabled' : '❌ disabled'})`);
                    if (s.host === 'smtp.resend.com') {
                        console.log('      ✅ Resend is configured!');
                    }
                });
                return { authenticated: true, smtpConfigured: true, smtp };
            }
        } else if (authResult.status === 401) {
            console.log('   ❌ Authentication failed');
            console.log('   Check username and password in .env file');
            return { authenticated: false };
        } else {
            console.log(`   ⚠️  Unexpected response: ${authResult.status}`);
            console.log(`   ${authResult.rawData}`);
            return { authenticated: false };
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return { authenticated: false };
    }
}

async function main() {
    console.log('🚀 Listmonk Login Test');
    console.log('='.repeat(60) + '\n');

    const result = await testLogin();

    console.log('\n' + '='.repeat(60));
    if (result.authenticated) {
        console.log('✅ Authentication working!');
        if (!result.smtpConfigured) {
            console.log('\n📧 Next step: Configure SMTP with Resend');
        } else {
            console.log('\n✅ SMTP already configured!');
            console.log('📧 Next step: Send a test email');
        }
    } else {
        console.log('❌ Authentication failed');
        console.log('Please check credentials in .env file');
    }
    console.log('='.repeat(60) + '\n');
}

main();
