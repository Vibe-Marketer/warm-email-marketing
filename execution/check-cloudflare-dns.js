#!/usr/bin/env node
/**
 * Check Cloudflare DNS records for mail subdomain
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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
const CLOUDFLARE_API_TOKEN = ENV.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = ENV.CLOUDFLARE_ZONE_ID;

function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, rawData: data });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function checkDNS() {
    console.log('🔍 Checking Cloudflare DNS records for mail.*...\n');

    const options = {
        hostname: 'api.cloudflare.com',
        path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    const result = await makeRequest(options);

    if (result.status === 200) {
        const allRecords = result.data.result || [];
        const mailRecords = allRecords.filter(r =>
            r.name.includes('mail.callvaultai.com') ||
            r.name.includes('send.mail') ||
            r.name.includes('_domainkey')
        );

        console.log(`Found ${mailRecords.length} mail-related DNS records:\n`);

        mailRecords.forEach(r => {
            console.log(`  ${r.type}: ${r.name}`);
            console.log(`    Content: ${r.content}`);
            if (r.priority) console.log(`    Priority: ${r.priority}`);
            console.log(`    ID: ${r.id}`);
            console.log('');
        });

        if (mailRecords.length === 0) {
            console.log('  (No mail-related records found)');
        }
    } else {
        console.error(`❌ Failed: ${result.status}`);
        console.error(result.rawData);
    }
}

checkDNS();
