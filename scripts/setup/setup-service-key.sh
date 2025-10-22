#!/bin/bash

# Script to help set up service role key for authenticated scripts
# Run this to configure authentication for balance history population

echo "🔐 Service Role Key Setup"
echo "=" `printf '=%.0s' {1..60}`
echo ""

# Check if database.env exists
if [ ! -f "config/database.env" ]; then
  echo "📝 Creating config/database.env..."
  touch config/database.env
fi

# Check if service key already exists
if grep -q "SUPABASE_SERVICE_ROLE_KEY" config/database.env; then
  echo "✅ Service role key already configured!"
  echo ""
  echo "Current key (first 30 chars): $(grep SUPABASE_SERVICE_ROLE_KEY config/database.env | cut -d'=' -f2 | cut -d'"' -f2 | cut -c1-30)..."
  echo ""
  read -p "Do you want to update it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing key."
    exit 0
  fi
fi

echo "📋 To get your service role key:"
echo ""
echo "1. Open Supabase Dashboard"
echo "   👉 https://supabase.com/dashboard/project/fzzbfgnmbchhmqepwmer/settings/api"
echo ""
echo "2. Find 'service_role' key under 'Project API keys'"
echo ""
echo "3. Click the eye icon to reveal it"
echo ""
echo "4. Copy the entire key (starts with eyJ...)"
echo ""

# Open the Supabase dashboard
read -p "Would you like to open Supabase Dashboard now? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  open "https://supabase.com/dashboard/project/fzzbfgnmbchhmqepwmer/settings/api"
  echo "✅ Opened Supabase Dashboard in browser"
  echo ""
fi

echo "⌨️  Paste your service role key below:"
read -p "Service Role Key: " SERVICE_KEY

# Validate key format (should start with eyJ)
if [[ ! $SERVICE_KEY =~ ^eyJ ]]; then
  echo ""
  echo "❌ Error: Key doesn't look valid (should start with 'eyJ')"
  echo "Please copy the complete service_role key from Supabase"
  exit 1
fi

# Remove any existing service key line
if grep -q "SUPABASE_SERVICE_ROLE_KEY" config/database.env; then
  # macOS compatible sed
  sed -i '' '/SUPABASE_SERVICE_ROLE_KEY/d' config/database.env
fi

# Add the new key
echo "" >> config/database.env
echo "# Supabase Service Role Key (KEEP SECRET! Added $(date +%Y-%m-%d))" >> config/database.env
echo "SUPABASE_SERVICE_ROLE_KEY=\"$SERVICE_KEY\"" >> config/database.env

echo ""
echo "✅ Service role key saved to config/database.env"
echo ""

# Check .gitignore
echo "🔍 Checking .gitignore..."
if grep -q "config/database.env" .gitignore; then
  echo "✅ config/database.env is already in .gitignore"
else
  echo "⚠️  Adding config/database.env to .gitignore..."
  echo "config/database.env" >> .gitignore
  echo "✅ Added to .gitignore"
fi

echo ""
echo "=" `printf '=%.0s' {1..60}`
echo "✅ SETUP COMPLETE!"
echo "=" `printf '=%.0s' {1..60}`
echo ""
echo "🚀 You can now run authenticated scripts:"
echo ""
echo "   node scripts/populate-with-service-key.js"
echo ""
echo "This will populate balance history for your accounts!"
echo ""

