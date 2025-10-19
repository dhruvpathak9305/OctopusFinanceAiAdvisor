#!/bin/bash
# =====================================================================
# Database Connection Helper Script
# =====================================================================
# This script loads environment variables from .env and provides
# convenient functions for database operations
# =====================================================================

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from config/database.env file
ENV_FILE="$PROJECT_ROOT/config/database.env"
if [ -f "$ENV_FILE" ]; then
    echo "✅ Loading environment variables from config/database.env..."
    export $(cat "$ENV_FILE" | grep -v '^#' | grep -v '^$' | xargs)
    echo "✅ Environment variables loaded successfully"
else
    echo "❌ Error: database.env file not found at $ENV_FILE"
    echo "Please create config/database.env file from config/database.env.example"
    exit 1
fi

# Add PostgreSQL to PATH
export PATH="$PSQL_PATH:$PATH"

# Set PGPASSWORD for non-interactive connections
export PGPASSWORD="$SUPABASE_DB_PASSWORD"

# Display connection info (without showing password)
echo ""
echo "📊 Database Connection Info:"
echo "   Host: $SUPABASE_DB_HOST"
echo "   Port: $SUPABASE_DB_PORT"
echo "   Database: $SUPABASE_DB_NAME"
echo "   User: $SUPABASE_DB_USER"
echo "   Password: ********** (hidden)"
echo ""

# Function to connect to database
db_connect() {
    echo "🔌 Connecting to database..."
    psql -h "$SUPABASE_DB_HOST" \
         -p "$SUPABASE_DB_PORT" \
         -d "$SUPABASE_DB_NAME" \
         -U "$SUPABASE_DB_USER"
}

# Function to run SQL file
db_run_file() {
    if [ -z "$1" ]; then
        echo "❌ Error: No SQL file specified"
        echo "Usage: db_run_file <path-to-sql-file>"
        return 1
    fi
    
    if [ ! -f "$1" ]; then
        echo "❌ Error: File not found: $1"
        return 1
    fi
    
    echo "🚀 Executing SQL file: $1"
    psql -h "$SUPABASE_DB_HOST" \
         -p "$SUPABASE_DB_PORT" \
         -d "$SUPABASE_DB_NAME" \
         -U "$SUPABASE_DB_USER" \
         -f "$1"
}

# Function to run SQL query
db_query() {
    if [ -z "$1" ]; then
        echo "❌ Error: No query specified"
        echo "Usage: db_query '<sql-query>'"
        return 1
    fi
    
    echo "🔍 Executing query..."
    psql -h "$SUPABASE_DB_HOST" \
         -p "$SUPABASE_DB_PORT" \
         -d "$SUPABASE_DB_NAME" \
         -U "$SUPABASE_DB_USER" \
         -c "$1"
}

# If script is run directly (not sourced), show help
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    echo "📚 Available Functions:"
    echo "   db_connect          - Connect to database interactively"
    echo "   db_run_file <file>  - Execute SQL file"
    echo "   db_query '<query>'  - Execute SQL query"
    echo ""
    echo "💡 Usage:"
    echo "   source scripts/db-connect.sh"
    echo "   db_connect"
    echo "   db_run_file scripts/final-verification.sql"
    echo "   db_query 'SELECT COUNT(*) FROM accounts_real;'"
    echo ""
fi

# Export functions so they're available in the shell
export -f db_connect
export -f db_run_file
export -f db_query

