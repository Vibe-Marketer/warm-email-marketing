#!/usr/bin/env node
/**
 * Check Resend Domains
 * Shows all domains in your Resend account
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
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

function makeRequest(options) {
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
        req.end();
    });
}

async function checkDomains() {
    console.log('🔍 Checking your Resend domains...\n');

    const options = {
        hostname: 'api.resend.com',
        path: '/domains',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`
        }
    };

    try {
        const result = await makeRequest(options);

        if (result.status === 200) {
            const domains = result.data.data || [];

            if (domains.length === 0) {
                console.log('No domains found in your Resend account.');
                console.log('\n💡 Suggestion: Try using a different subdomain like:');
                console.log('   - email.callvaultai.com');
                console.log('   - send.callvaultai.com');
                console.log('   - updates.callvaultai.com');
                console.log('   - marketing.callvaultai.com');
            } else {
                console.log(`Found ${domains.length} domain(s):\n`);
                domains.forEach((domain, i) => {
                    console.log(`${i + 1}. ${domain.name}`);
                    console.log(`   Status: ${domain.status}`);
                    console.log(`   Region: ${domain.region}`);
                    console.log(`   ID: ${domain.id}`);
                    console.log(`   Created: ${domain.created_at}`);
                    console.log('');
                });
            }
        } else {
            console.error(`❌ Failed to fetch domains: ${result.status}`);
            console.error(`Response: ${result.rawData}`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

checkDomains();
