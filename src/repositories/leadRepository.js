const { getSupabase } = require('../db/supabaseClient');

async function upsertOutboundLead({ phoneNumber, message }) {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  // For outbound messages, `status` should default to `cold` (table default).
  const { data, error } = await supabase
    .from('leads')
    .upsert(
      {
        phone_number: phoneNumber,
        last_message: message,
        last_message_at: now,
      },
      { onConflict: 'phone_number' }
    )
    .select('id, phone_number, last_message_at');

  if (error) throw error;

  // `upsert` returns an array of affected rows.
  if (!data || data.length === 0) {
    throw new Error('Outbound lead upsert did not return a row.');
  }

  return data[0];
}

async function upsertInboundLead({ phoneNumber, message }) {
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('leads')
    .upsert(
      {
        phone_number: phoneNumber,
        status: 'engaged',
        last_message: message,
        last_message_at: now,
      },
      { onConflict: 'phone_number' }
    )
    .select('id, phone_number, last_message_at');

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('Inbound lead upsert did not return a row.');
  }

  return data[0];
}

module.exports = { upsertOutboundLead, upsertInboundLead };

