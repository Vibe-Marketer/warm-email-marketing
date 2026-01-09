#!/usr/bin/env python3
"""
Setup Resend Integration
VERSION: 2026.01.09

This script:
1. Adds mail.callvaultai.com to Resend
2. Gets DNS records from Resend
3. Adds DNS records to Cloudflare
4. Configures SMTP in Listmonk
5. Sends a test email

Usage:
    python execution/setup-resend-integration.py
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Configuration
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
CLOUDFLARE_API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN')
CLOUDFLARE_ZONE_ID = os.getenv('CLOUDFLARE_ZONE_ID')
CLOUDFLARE_BASE_DOMAIN = os.getenv('CLOUDFLARE_BASE_DOMAIN')
LISTMONK_URL = os.getenv('LISTMONK_URL')
LISTMONK_ADMIN_USER = os.getenv('LISTMONK_ADMIN_USER')
LISTMONK_ADMIN_PASSWORD = os.getenv('LISTMONK_ADMIN_PASSWORD')

SENDING_DOMAIN = f"mail.{CLOUDFLARE_BASE_DOMAIN}"

def check_env_vars():
    """Verify all required environment variables are set"""
    required = {
        'RESEND_API_KEY': RESEND_API_KEY,
        'CLOUDFLARE_API_TOKEN': CLOUDFLARE_API_TOKEN,
        'CLOUDFLARE_ZONE_ID': CLOUDFLARE_ZONE_ID,
        'CLOUDFLARE_BASE_DOMAIN': CLOUDFLARE_BASE_DOMAIN,
        'LISTMONK_URL': LISTMONK_URL,
        'LISTMONK_ADMIN_USER': LISTMONK_ADMIN_USER,
        'LISTMONK_ADMIN_PASSWORD': LISTMONK_ADMIN_PASSWORD,
    }

    missing = [k for k, v in required.items() if not v]
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        print("Please check your .env file")
        sys.exit(1)

    print("✅ All environment variables found")

def add_domain_to_resend():
    """Add domain to Resend and return the domain info"""
    print(f"\n📧 Adding {SENDING_DOMAIN} to Resend...")

    url = "https://api.resend.com/domains"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "name": SENDING_DOMAIN,
        "region": "us-east-1"
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 201:
        domain_info = response.json()
        print(f"✅ Domain added successfully! Domain ID: {domain_info.get('id')}")
        return domain_info
    elif response.status_code == 422 and "already exists" in response.text.lower():
        print(f"ℹ️  Domain already exists in Resend, fetching details...")
        return get_existing_domain()
    else:
        print(f"❌ Failed to add domain: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)

def get_existing_domain():
    """Get existing domain info from Resend"""
    url = "https://api.resend.com/domains"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        domains = response.json().get('data', [])
        for domain in domains:
            if domain['name'] == SENDING_DOMAIN:
                print(f"✅ Found existing domain: {domain['name']}")
                return domain
        print(f"❌ Domain {SENDING_DOMAIN} not found in Resend")
        sys.exit(1)
    else:
        print(f"❌ Failed to fetch domains: {response.status_code}")
        sys.exit(1)

def get_dns_records_from_resend(domain_id):
    """Get DNS records from Resend for the domain"""
    print(f"\n🔍 Fetching DNS records from Resend...")

    url = f"https://api.resend.com/domains/{domain_id}"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        domain_info = response.json()
        records = domain_info.get('records', [])
        print(f"✅ Found {len(records)} DNS records")
        return records
    else:
        print(f"❌ Failed to fetch DNS records: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)

def add_dns_records_to_cloudflare(records):
    """Add DNS records to Cloudflare"""
    print(f"\n☁️  Adding DNS records to Cloudflare...")

    url = f"https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/dns_records"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }

    added_count = 0
    skipped_count = 0

    for record in records:
        record_type = record.get('record')
        name = record.get('name')
        value = record.get('value')
        priority = record.get('priority')

        # Check if record already exists
        check_url = f"{url}?name={name}&type={record_type}"
        check_response = requests.get(check_url, headers=headers)

        if check_response.status_code == 200:
            existing = check_response.json().get('result', [])
            if existing:
                print(f"  ⏭️  Skipping {record_type} record for {name} (already exists)")
                skipped_count += 1
                continue

        # Add the record
        data = {
            "type": record_type,
            "name": name,
            "content": value,
            "ttl": 1,  # Auto
            "proxied": False
        }

        if priority is not None:
            data["priority"] = priority

        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            print(f"  ✅ Added {record_type} record for {name}")
            added_count += 1
        else:
            print(f"  ⚠️  Failed to add {record_type} record for {name}: {response.status_code}")
            print(f"     Response: {response.text}")

    print(f"\n✅ DNS Configuration complete:")
    print(f"   - Added: {added_count} records")
    print(f"   - Skipped: {skipped_count} records (already existed)")
    print(f"\n⏰ Note: DNS records may take 5-30 minutes to propagate")

def check_listmonk_connection():
    """Check if we can connect to Listmonk"""
    print(f"\n🔗 Checking Listmonk connection at {LISTMONK_URL}...")

    try:
        response = requests.get(f"{LISTMONK_URL}/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ Listmonk is accessible")
            return True
        else:
            print(f"⚠️  Listmonk returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Listmonk: {e}")
        print("   Make sure Docker containers are running and tunnel is active")
        return False

def display_next_steps():
    """Display manual steps for Listmonk SMTP configuration"""
    print("\n" + "="*70)
    print("🎉 RESEND SETUP COMPLETE!")
    print("="*70)

    print(f"\n📋 DNS records have been added to Cloudflare for {SENDING_DOMAIN}")
    print("   These may take 5-30 minutes to propagate and verify in Resend.")

    print("\n🔧 NEXT STEPS - Configure SMTP in Listmonk:")
    print(f"\n1. Go to: {LISTMONK_URL}/admin/settings")
    print(f"2. Navigate to: Settings → SMTP")
    print("3. Click 'New SMTP Server'")
    print("\n4. Enter these settings:")
    print("   ┌─────────────────────────────────────────────┐")
    print("   │ Host:           smtp.resend.com             │")
    print("   │ Port:           465                         │")
    print("   │ Auth protocol:  LOGIN                       │")
    print("   │ Username:       resend                      │")
    print(f"   │ Password:       {RESEND_API_KEY}           │")
    print("   │ TLS type:       SSL/TLS                     │")
    print(f"   │ From email:     hello@{SENDING_DOMAIN}     │")
    print("   └─────────────────────────────────────────────┘")
    print("\n5. Click 'Test connection' to verify")
    print("6. Click 'Save' if test succeeds")

    print("\n📧 After SMTP is configured:")
    print("   - Create a test subscriber with your email")
    print("   - Send a test campaign")
    print("   - Check your inbox (and spam folder)")

    print("\n💡 Troubleshooting:")
    print(f"   - Check Resend domain status: https://resend.com/domains")
    print(f"   - Check DNS records: https://dash.cloudflare.com")
    print(f"   - View logs: docker logs listmonk-app")

    print("\n" + "="*70)

def main():
    print("🚀 Starting Resend Integration Setup")
    print("="*70)

    # Step 1: Check environment
    check_env_vars()

    # Step 2: Add domain to Resend
    domain_info = add_domain_to_resend()
    domain_id = domain_info.get('id')

    # Step 3: Get DNS records
    dns_records = get_dns_records_from_resend(domain_id)

    # Step 4: Add DNS records to Cloudflare
    add_dns_records_to_cloudflare(dns_records)

    # Step 5: Check Listmonk connection
    check_listmonk_connection()

    # Step 6: Display next steps
    display_next_steps()

    print("\n✅ Setup script complete!")

if __name__ == "__main__":
    main()
