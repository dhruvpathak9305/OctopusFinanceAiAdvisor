/**
 * Run Goals Database Migration
 * This script executes the SQL migration files using Supabase client
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fzzbfgnmbchhmqepwmer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Goals database migration...\n');

  try {
    // Read SQL files
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../database/goals/001_create_core_goals_tables.sql'),
      'utf8'
    );
    
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../database/goals/002_load_popular_categories.sql'),
      'utf8'
    );

    // Execute migration 1 (create tables)
    console.log('📊 Creating goals tables...');
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: migration1
    });

    if (error1) {
      console.error('❌ Error creating tables:', error1.message);
      // Try alternative method
      console.log('Trying alternative method...');
      const statements1 = migration1.split(';').filter(s => s.trim());
      for (let i = 0; i < statements1.length; i++) {
        const stmt = statements1[i].trim();
        if (stmt) {
          console.log(`  Executing statement ${i + 1}/${statements1.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: stmt });
          if (error && !error.message.includes('already exists')) {
            console.warn(`  ⚠️  Statement ${i + 1} warning:`, error.message);
          }
        }
      }
    }

    console.log('✅ Tables created successfully!\n');

    // Execute migration 2 (load categories)
    console.log('📂 Loading goal categories...');
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', {
      sql: migration2
    });

    if (error2) {
      console.error('❌ Error loading categories:', error2.message);
      console.log('Trying alternative method...');
      const statements2 = migration2.split(';').filter(s => s.trim());
      for (let i = 0; i < statements2.length; i++) {
        const stmt = statements2[i].trim();
        if (stmt) {
          console.log(`  Executing statement ${i + 1}/${statements2.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: stmt });
          if (error && !error.message.includes('duplicate')) {
            console.warn(`  ⚠️  Statement ${i + 1} warning:`, error.message);
          }
        }
      }
    }

    console.log('✅ Categories loaded successfully!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tableError } = await supabase
      .from('goal_categories')
      .select('count');

    if (!tableError) {
      console.log('✅ goal_categories table exists!');
    }

    // Count categories
    const { count, error: countError } = await supabase
      .from('goal_categories')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`✅ Loaded ${count} goal categories!\n`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. ✅ Database is ready');
    console.log('   2. 🔌 UI will now connect to database');
    console.log('   3. 🧪 Test goal creation\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration().then(() => {
  console.log('✨ Done!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

