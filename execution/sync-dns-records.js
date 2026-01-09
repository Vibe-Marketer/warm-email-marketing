#!/usr/bin/env node
/**
 * Sync DNS Records from Resend to Cloudflare
 * VERSION: 2026.01.09
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
const CLOUDFLARE_API_TOKEN = ENV.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = ENV.CLOUDFLARE_ZONE_ID;
const DOMAIN_ID = 'b51e8098-661b-4e56-8a05-15dc7ac407b7'; // mail.callvaultai.com

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
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function getDnsRecords() {
    console.log('🔍 Fetching DNS records from Resend...\n');

    const options = {
        hostname: 'api.resend.com',
        path: `/domains/${DOMAIN_ID}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`
        }
    };

    const result = await makeRequest(options);

    if (result.status === 200) {
        const records = result.data.records || [];
        console.log(`✅ Found ${records.length} DNS records:\n`);

        records.forEach(r => {
            console.log(`  ${r.record} record: ${r.name}`);
            console.log(`    Value: ${r.value}`);
            if (r.priority) console.log(`    Priority: ${r.priority}`);
            console.log('');
        });

        return records;
    } else {
        console.error(`❌ Failed: ${result.status}`);
        console.error(result.rawData);
        process.exit(1);
    }
}

async function addDnsToCloudflare(records) {
    console.log('☁️  Adding DNS records to Cloudflare...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
        const recordType = record.record;
        const name = record.name;
        const value = record.value;
        const priority = record.priority;

        // Check if exists
        const checkUrl = `/dns_records?name=${encodeURIComponent(name)}&type=${recordType}`;
        const checkOptions = {
            hostname: 'api.cloudflare.com',
            path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}${checkUrl}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const checkResult = await makeRequest(checkOptions);
        const existing = checkResult.data?.result || [];

        if (existing.length > 0) {
            console.log(`  ⏭️  ${recordType} ${name} (already exists)`);
            skippedCount++;
            continue;
        }

        // Add record
        const postData = {
            type: recordType,
            name: name,
            content: value,
            ttl: 1,
            proxied: false
        };

        if (priority !== null && priority !== undefined) {
            postData.priority = priority;
        }

        const addOptions = {
            hostname: 'api.cloudflare.com',
            path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const addResult = await makeRequest(addOptions, postData);

        if (addResult.status === 200) {
            console.log(`  ✅ Added ${recordType} ${name}`);
            addedCount++;
        } else {
            console.log(`  ⚠️  Failed ${recordType} ${name}: ${addResult.status}`);
        }
    }

    console.log(`\n✅ DNS sync complete:`);
    console.log(`   Added: ${addedCount}`);
    console.log(`   Skipped: ${skippedCount} (already existed)`);
}

async function main() {
    console.log('🚀 Syncing DNS Records from Resend to Cloudflare');
    console.log('='.repeat(60) + '\n');

    try {
        const records = await getDnsRecords();
        await addDnsToCloudflare(records);

        console.log('\n✅ All done! Your DNS records are configured.');
        console.log('\nNext: Configure SMTP in Listmonk with these details:');
        console.log('  Host: smtp.resend.com');
        console.log('  Port: 465');
        console.log('  Username: resend');
        console.log(`  Password: ${RESEND_API_KEY}`);
        console.log('  From: hello@mail.callvaultai.com\n');
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
