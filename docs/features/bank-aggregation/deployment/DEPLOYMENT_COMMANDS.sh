#!/bin/bash
# =============================================================================
# Setu Integration - Deployment Script
# =============================================================================
# Run this script to deploy all Setu functions and configuration
# Usage: bash DEPLOYMENT_COMMANDS.sh
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting Setu Integration Deployment..."
echo ""

# Change to project directory
cd /Users/d0p0c9t/Desktop/OctopusFinanceAiAdvisor

# Step 1: Deploy Edge Functions
echo "📦 Step 1/4: Deploying Edge Functions..."
echo ""

echo "Deploying setu-create-consent..."
supabase functions deploy setu-create-consent
echo "✅ setu-create-consent deployed"
echo ""

echo "Deploying setu-check-consent..."
supabase functions deploy setu-check-consent
echo "✅ setu-check-consent deployed"
echo ""

echo "Deploying setu-create-session..."
supabase functions deploy setu-create-session
echo "✅ setu-create-session deployed"
echo ""

echo "Deploying setu-get-session..."
supabase functions deploy setu-get-session
echo "✅ setu-get-session deployed"
echo ""

# Step 2: Set Secrets
echo "🔐 Step 2/4: Setting Environment Secrets..."
echo ""

supabase secrets set SETU_CLIENT_ID="d70f2b6c-9791-4e12-b62f-5a7998068525"
echo "✅ SETU_CLIENT_ID set"

supabase secrets set SETU_CLIENT_SECRET="Pl2NlWeXDh0bjxaq7WhLosLFqlKXhffI"
echo "✅ SETU_CLIENT_SECRET set"

supabase secrets set SETU_BASE_URL="https://fiu-uat.setu.co/api"
echo "✅ SETU_BASE_URL set"
echo ""

# Step 3: Run Migration
echo "💾 Step 3/4: Running Database Migration..."
echo ""

supabase db push
echo "✅ Database migration completed"
echo ""

# Step 4: Verify
echo "🔍 Step 4/4: Verifying Deployment..."
echo ""

echo "Deployed Functions:"
supabase functions list
echo ""

echo "Configured Secrets:"
supabase secrets list
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Test a function: supabase functions invoke setu-create-consent"
echo "2. Check the UI integration in your app"
echo "3. Test with Setu sandbox account"

