#!/usr/bin/env node
/**
 * Setup Resend Integration
 * VERSION: 2026.01.09
 *
 * This script:
 * 1. Adds mail.callvaultai.com to Resend
 * 2. Gets DNS records from Resend
 * 3. Adds DNS records to Cloudflare
 * 4. Provides SMTP configuration for Listmonk
 *
 * Usage:
 *     node execution/setup-resend-integration.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env file
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
const CLOUDFLARE_BASE_DOMAIN = ENV.CLOUDFLARE_BASE_DOMAIN;
const LISTMONK_URL = ENV.LISTMONK_URL;
const SENDING_DOMAIN = `mail.${CLOUDFLARE_BASE_DOMAIN}`;

// Helper function to make HTTPS requests
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

// Check environment variables
function checkEnvVars() {
    console.log('Checking environment variables...');
    const required = {
        'RESEND_API_KEY': RESEND_API_KEY,
        'CLOUDFLARE_API_TOKEN': CLOUDFLARE_API_TOKEN,
        'CLOUDFLARE_ZONE_ID': CLOUDFLARE_ZONE_ID,
        'CLOUDFLARE_BASE_DOMAIN': CLOUDFLARE_BASE_DOMAIN,
        'LISTMONK_URL': LISTMONK_URL,
    };

    const missing = Object.entries(required).filter(([k, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
        console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file');
        process.exit(1);
    }

    console.log('✅ All environment variables found\n');
}

// Add domain to Resend
async function addDomainToResend() {
    console.log(`📧 Adding ${SENDING_DOMAIN} to Resend...`);

    const options = {
        hostname: 'api.resend.com',
        path: '/domains',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const postData = {
        name: SENDING_DOMAIN,
        region: 'us-east-1'
    };

    try {
        const result = await makeRequest(options, postData);

        if (result.status === 201) {
            console.log(`✅ Domain added successfully! Domain ID: ${result.data.id}`);
            return result.data;
        } else if (result.status === 422 && result.rawData.toLowerCase().includes('already exists')) {
            console.log(`ℹ️  Domain already exists in Resend, fetching details...`);
            return await getExistingDomain();
        } else {
            console.error(`❌ Failed to add domain: ${result.status}`);
            console.error(`Response: ${result.rawData}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error adding domain: ${error.message}`);
        process.exit(1);
    }
}

// Get existing domain from Resend
async function getExistingDomain() {
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
            const domain = domains.find(d => d.name === SENDING_DOMAIN);

            if (domain) {
                console.log(`✅ Found existing domain: ${domain.name}`);
                return domain;
            } else {
                console.error(`❌ Domain ${SENDING_DOMAIN} not found in Resend`);
                process.exit(1);
            }
        } else {
            console.error(`❌ Failed to fetch domains: ${result.status}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error fetching domains: ${error.message}`);
        process.exit(1);
    }
}

// Get DNS records from Resend
async function getDnsRecordsFromResend(domainId) {
    console.log(`\n🔍 Fetching DNS records from Resend...`);

    const options = {
        hostname: 'api.resend.com',
        path: `/domains/${domainId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`
        }
    };

    try {
        const result = await makeRequest(options);

        if (result.status === 200) {
            const records = result.data.records || [];
            console.log(`✅ Found ${records.length} DNS records`);
            return records;
        } else {
            console.error(`❌ Failed to fetch DNS records: ${result.status}`);
            console.error(`Response: ${result.rawData}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error fetching DNS records: ${error.message}`);
        process.exit(1);
    }
}

// Add DNS records to Cloudflare
async function addDnsRecordsToCloudflare(records) {
    console.log(`\n☁️  Adding DNS records to Cloudflare...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
        const recordType = record.record;
        const name = record.name;
        const value = record.value;
        const priority = record.priority;

        // Check if record already exists
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

        try {
            const checkResult = await makeRequest(checkOptions);
            const existing = checkResult.data?.result || [];

            if (existing.length > 0) {
                console.log(`  ⏭️  Skipping ${recordType} record for ${name} (already exists)`);
                skippedCount++;
                continue;
            }

            // Add the record
            const postData = {
                type: recordType,
                name: name,
                content: value,
                ttl: 1,  // Auto
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
                console.log(`  ✅ Added ${recordType} record for ${name}`);
                addedCount++;
            } else {
                console.log(`  ⚠️  Failed to add ${recordType} record for ${name}: ${addResult.status}`);
                console.log(`     Response: ${addResult.rawData}`);
            }
        } catch (error) {
            console.log(`  ⚠️  Error processing ${recordType} record for ${name}: ${error.message}`);
        }
    }

    console.log(`\n✅ DNS Configuration complete:`);
    console.log(`   - Added: ${addedCount} records`);
    console.log(`   - Skipped: ${skippedCount} records (already existed)`);
    console.log(`\n⏰ Note: DNS records may take 5-30 minutes to propagate`);
}

// Check Listmonk connection
async function checkListmonkConnection() {
    console.log(`\n🔗 Checking Listmonk connection at ${LISTMONK_URL}...`);

    const url = new URL(`${LISTMONK_URL}/api/health`);
    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        timeout: 10000
    };

    try {
        const result = await makeRequest(options);

        if (result.status === 200) {
            console.log('✅ Listmonk is accessible');
            return true;
        } else {
            console.log(`⚠️  Listmonk returned status: ${result.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Cannot connect to Listmonk: ${error.message}`);
        console.log('   Make sure Docker containers are running and tunnel is active');
        return false;
    }
}

// Display next steps
function displayNextSteps() {
    console.log('\n' + '='.repeat(70));
    console.log('🎉 RESEND SETUP COMPLETE!');
    console.log('='.repeat(70));

    console.log(`\n📋 DNS records have been added to Cloudflare for ${SENDING_DOMAIN}`);
    console.log('   These may take 5-30 minutes to propagate and verify in Resend.');

    console.log('\n🔧 NEXT STEPS - Configure SMTP in Listmonk:');
    console.log(`\n1. Go to: ${LISTMONK_URL}/admin/settings`);
    console.log(`2. Navigate to: Settings → SMTP`);
    console.log("3. Click 'New SMTP Server'");
    console.log('\n4. Enter these settings:');
    console.log('   ┌─────────────────────────────────────────────┐');
    console.log('   │ Host:           smtp.resend.com             │');
    console.log('   │ Port:           465                         │');
    console.log('   │ Auth protocol:  LOGIN                       │');
    console.log('   │ Username:       resend                      │');
    console.log(`   │ Password:       ${RESEND_API_KEY}           │`);
    console.log('   │ TLS type:       SSL/TLS                     │');
    console.log(`   │ From email:     hello@${SENDING_DOMAIN}     │`);
    console.log('   └─────────────────────────────────────────────┘');
    console.log("\n5. Click 'Test connection' to verify");
    console.log("6. Click 'Save' if test succeeds");

    console.log('\n📧 After SMTP is configured:');
    console.log('   - Create a test subscriber with your email');
    console.log('   - Send a test campaign');
    console.log('   - Check your inbox (and spam folder)');

    console.log('\n💡 Troubleshooting:');
    console.log(`   - Check Resend domain status: https://resend.com/domains`);
    console.log(`   - Check DNS records: https://dash.cloudflare.com`);
    console.log(`   - View logs: docker logs listmonk-app`);

    console.log('\n' + '='.repeat(70));
}

// Main function
async function main() {
    console.log('🚀 Starting Resend Integration Setup');
    console.log('='.repeat(70) + '\n');

    try {
        // Step 1: Check environment
        checkEnvVars();

        // Step 2: Add domain to Resend
        const domainInfo = await addDomainToResend();
        const domainId = domainInfo.id;

        // Step 3: Get DNS records
        const dnsRecords = await getDnsRecordsFromResend(domainId);

        // Step 4: Add DNS records to Cloudflare
        await addDnsRecordsToCloudflare(dnsRecords);

        // Step 5: Check Listmonk connection
        await checkListmonkConnection();

        // Step 6: Display next steps
        displayNextSteps();

        console.log('\n✅ Setup script complete!\n');
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
main();
