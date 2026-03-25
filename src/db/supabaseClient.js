const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.'
    );
  }

  supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  logger.info('Supabase client initialized');
  return supabase;
}

module.exports = { getSupabase };

