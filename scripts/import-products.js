#!/usr/bin/env node

/**
 * Product Import Script
 * Imports products from a CSV file into Supabase
 * 
 * Usage: node import-products.js <csv-file> <supabase-url> <supabase-key>
 * Example: node import-products.js products.csv https://xxx.supabase.co eyJ...Q
 */

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

async function importProducts() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node import-products.js <csv-file> <supabase-url> <supabase-key>');
    console.error('Example: node import-products.js products.csv https://xxx.supabase.co eyJ...Q');
    process.exit(1);
  }

  const [csvFile, supabaseUrl, supabaseKey] = args;

  // Validate inputs
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  if (!supabaseUrl.includes('supabase.co')) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  console.log('📦 Product Import Script');
  console.log('========================');
  console.log(`📁 CSV File: ${csvFile}`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);

  try {
    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase');

    // Read and parse CSV
    const fileContent = fs.readFileSync(csvFile, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Parsed ${records.length} products from CSV`);

    // Process products
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        // Expected CSV columns:
        // name, description, price, sku, stock_quantity, image_url (optional)
        
        const name = record.name || record.Product || record.Category;
        const description = record.description || record.Description || '';
        const price = parseFloat(record.price || record.Price || record['Prix de vente'] || 0);
        const sku = record.sku || record.SKU || record['SKU'] || `SKU-${Date.now()}-${Math.random()}`;
        const stockQuantity = parseInt(record.stock_quantity || record.Stock || record['Stock'] || 0);
        const imageUrl = record.image_url || record.Image || record['Image URL'] || null;

        // Validate required fields
        if (!name || isNaN(price)) {
          throw new Error(`Invalid data: name="${name}", price="${price}"`);
        }

        // Check if product with this SKU already exists
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('name', name)
          .single();

        if (existing) {
          console.log(`⏭️  Skipping duplicate product: ${name} (SKU: ${sku})`);
          continue;
        }

        // Insert product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert([
            {
              name,
              description,
              price,
              image_url: imageUrl,
            },
          ])
          .select();

        if (productError) throw productError;

        const productId = productData[0].id;

        // Insert inventory item
        const { error: invError } = await supabase
          .from('inventory_items')
          .insert([
            {
              product_id: productId,
              sku,
              stock_quantity: stockQuantity,
            },
          ]);

        if (invError) throw invError;

        console.log(`✅ Imported: ${name} (${sku}) - $${price} - ${stockQuantity} units`);
        successCount++;
      } catch (err) {
        errorCount++;
        const errorMsg = `Row: ${record.name || 'N/A'} - ${err.message}`;
        console.log(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Summary
    console.log('\n📈 Import Summary');
    console.log('=================');
    console.log(`✅ Successfully imported: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📊 Total processed: ${records.length} records`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n⚠️  Error Details:');
      errors.forEach(e => console.log(`   ${e}`));
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

importProducts();
