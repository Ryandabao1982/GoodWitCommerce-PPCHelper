/**
 * Database Connection Test
 * This script tests the Supabase connection and basic database operations
 * 
 * Usage: node --loader tsx services/testConnection.ts
 * Or import and run from the browser console
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { api } from './databaseService';

/**
 * Test Supabase connection and configuration
 */
export async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // 1. Check if Supabase is configured
  console.log('1. Checking Supabase configuration...');
  const isConfigured = isSupabaseConfigured();
  console.log(`   ✓ Supabase configured: ${isConfigured}`);
  
  if (!isConfigured) {
    console.error('   ❌ Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    return false;
  }

  try {
    // 2. Test database connection
    console.log('\n2. Testing database connection...');
    const { data, error } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('   ❌ Database connection failed:', error.message);
      return false;
    }
    console.log('   ✓ Database connection successful');

    // 3. Test authentication status
    console.log('\n3. Checking authentication status...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log(`   ✓ User authenticated: ${user.email}`);
    } else {
      console.log('   ℹ No user currently authenticated');
    }

    // 4. Test API methods (without authentication, just checking they're available)
    console.log('\n4. Verifying API methods...');
    console.log('   ✓ BrandAPI:', typeof api.brands === 'object' ? 'Available' : 'Not available');
    console.log('   ✓ KeywordAPI:', typeof api.keywords === 'object' ? 'Available' : 'Not available');
    console.log('   ✓ CampaignAPI:', typeof api.campaigns === 'object' ? 'Available' : 'Not available');
    console.log('   ✓ AdGroupAPI:', typeof api.adGroups === 'object' ? 'Available' : 'Not available');

    console.log('\n✅ All tests passed! Database is ready to use.');
    return true;

  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    return false;
  }
}

/**
 * Run tests if this file is executed directly
 */
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Database test utilities loaded. Run testConnection() to verify setup.');
  (window as any).testConnection = testConnection;
} else {
  // Node environment (if running with tsx or ts-node)
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default testConnection;
