#!/usr/bin/env node
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pl.tn.contact@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'salamlam';
const FULL_NAME = process.env.ADMIN_FULL_NAME || 'Admin Tester';

async function createOrGetUser() {
  // Create user via Admin REST API (returns existing user if email exists)
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, email_confirm: true })
  });
  const body = await res.json();
  if (!res.ok) {
    // If user already exists, try to fetch by email
    console.warn('Create user returned non-ok, attempting to find existing user by email', body);
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: users, error } = await supa.auth.admin.listUsers();
    if (error) throw error;
    const found = users?.find(u => u.email === ADMIN_EMAIL);
    if (found) return found;
    throw new Error('Could not create or find user: ' + JSON.stringify(body));
  }
  return body;
}

async function upsertProfile(supa, userId) {
  const { error } = await supa.from('profiles').upsert({ id: userId, full_name: FULL_NAME, role: 'admin' });
  if (error) throw error;
}

async function seedProductAndInventory(supa) {
  // insert a test product and inventory if not exists
  const { data: existing } = await supa.from('products').select('*').eq('name', 'Test Shirt').limit(1).maybeSingle();
  let productId;
  if (existing) productId = existing.id;
  else {
    const { data, error } = await supa.from('products').insert({ name: 'Test Shirt', description: 'Demo product', price: 25.0 }).select('id').single();
    if (error) throw error;
    productId = data.id;
  }

  const { data: inv } = await supa.from('inventory_items').select('*').eq('product_id', productId).limit(1).maybeSingle();
  if (!inv) {
    await supa.from('inventory_items').insert({ product_id: productId, sku: 'TS-01', stock_quantity: 5 });
  }
}

async function main() {
  try {
    console.log('Creating or finding admin user...');
    const user = await createOrGetUser();
    const userId = user.id || user.user?.id || user.uid || user.id;
    console.log('Admin user id:', userId);

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    console.log('Upserting profile...');
    await upsertProfile(supa, userId);
    console.log('Seeding product and inventory...');
    await seedProductAndInventory(supa);
    console.log('Done. You can now sign in as', ADMIN_EMAIL);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
