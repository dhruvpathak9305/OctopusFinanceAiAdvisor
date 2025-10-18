/**
 * Login and Fetch Script
 * 
 * This script logs you in and then fetches all your mapping data
 * 
 * Usage: npx tsx scripts/login-and-fetch.ts your@email.com your-password
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fzzbfgnmbchhmqepwmer.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6emJmZ25tYmNoaG1xZXB3bWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4NDMyMTksImV4cCI6MjA1OTQxOTIxOX0.T47MLWYCH5xIvk9QEAYNpqwOSrm1AiWpBbZjiRmNn0U';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function loginAndFetch() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('❌ Usage: npx tsx scripts/login-and-fetch.ts your@email.com your-password');
    process.exit(1);
  }

  console.log('🔐 Logging in...');
  
  try {
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Logged in successfully!');
    console.log(`📧 User: ${data.user?.email}`);
    console.log(`🆔 UUID: ${data.user?.id}\n`);

    // Now run the fetch script
    console.log('🚀 Fetching your data...\n');
    
    try {
      execSync('npx tsx scripts/fetch-mapping-data.ts', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.error('❌ Error running fetch script:', error);
      process.exit(1);
    }

    // Sign out after fetching
    await supabase.auth.signOut();
    console.log('\n✅ Done! Signed out for security.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

loginAndFetch().catch(console.error);

