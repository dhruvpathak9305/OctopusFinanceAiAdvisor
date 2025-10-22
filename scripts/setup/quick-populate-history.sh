#!/bin/bash

# Quick script to populate balance history from transaction data
# This will enable the historical chart on the Accounts card

echo "🔄 Populating Balance History for HDFC, ICICI, IDFC..."
echo ""
echo "This script will:"
echo "  1. Calculate historical balances from your transaction data"
echo "  2. Populate account_balance_history_real table"
echo "  3. Enable the historical chart display"
echo ""

# Check if database credentials exist
if [ ! -f "config/database.env" ]; then
  echo "❌ Error: config/database.env not found"
  echo "Please create it with your Supabase credentials"
  exit 1
fi

# Source database credentials
source config/database.env

# Check if required variables are set
if [ -z "$SUPABASE_DB_URL" ] && [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: Database URL not set"
  echo "Please set SUPABASE_DB_URL or DATABASE_URL in config/database.env"
  exit 1
fi

# Use the appropriate connection string
DB_URL="${SUPABASE_DB_URL:-$DATABASE_URL}"

echo "📊 Executing balance history calculation..."
echo ""

# Execute the SQL script
psql "$DB_URL" -f scripts/calculate-historical-balances.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! Balance history populated"
  echo ""
  echo "📈 What happens next:"
  echo "  • Historical chart will now display on Accounts card"
  echo "  • Shows last 12 months of balance trends"
  echo "  • MoM growth percentage is calculated from real data"
  echo ""
  echo "🔄 Refresh your app to see the changes!"
else
  echo ""
  echo "❌ Error executing SQL script"
  echo "Please check your database connection and try again"
  exit 1
fi

