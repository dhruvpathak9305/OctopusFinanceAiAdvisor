#!/bin/bash
# =====================================================================
# Quick Database Connection Script
# =====================================================================
# Simplified script to quickly connect to Supabase database
# =====================================================================

# Load database configuration
source "$(dirname "$0")/db-connect.sh"

# If arguments provided, run that command
if [ "$1" == "connect" ]; then
    db_connect
elif [ "$1" == "verify" ]; then
    db_run_file "$PROJECT_ROOT/scripts/final-verification.sql"
elif [ "$1" == "upload" ] && [ -n "$2" ]; then
    db_run_file "$2"
elif [ "$1" == "query" ] && [ -n "$2" ]; then
    db_query "$2"
else
    echo "📚 Quick Database Commands:"
    echo ""
    echo "   ./scripts/quick-connect.sh connect"
    echo "      → Connect to database interactively"
    echo ""
    echo "   ./scripts/quick-connect.sh verify"
    echo "      → Run final verification script"
    echo ""
    echo "   ./scripts/quick-connect.sh upload <sql-file>"
    echo "      → Upload data from SQL file"
    echo ""
    echo "   ./scripts/quick-connect.sh query '<sql>'"
    echo "      → Run a SQL query"
    echo ""
    echo "Examples:"
    echo "   ./scripts/quick-connect.sh verify"
    echo "   ./scripts/quick-connect.sh upload scripts/upload-transactions-october.sql"
    echo "   ./scripts/quick-connect.sh query 'SELECT COUNT(*) FROM accounts_real;'"
    echo ""
fi

