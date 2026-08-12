const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create admin user if not exists
    console.log("📝 Checking admin user...");
    const adminEmail = "pl.tn.contact@gmail.com";
    const adminPassword = "salamlam";

    let adminUser = null;
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error) {
        adminUser = data.users.find((u) => u.email === adminEmail);
      }
    } catch (e) {
      console.log("ℹ️  Admin API not available, checking profiles table instead");
    }

    if (!adminUser) {
      console.log(`  Creating admin user ${adminEmail}...`);
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
        });

      if (createError) {
        // User might already exist
        if (createError.message.includes("already")) {
          console.log(`  ✓ Admin user already exists`);
        } else {
          throw createError;
        }
      } else {
        adminUser = newUser;
        console.log(`  ✓ Admin user created: ${newUser.id}`);
      }
    } else {
      console.log(`  ✓ Admin user found: ${adminUser.id}`);
    }

    // 2. Get admin user ID from auth or profiles
    let adminId;
    if (adminUser) {
      adminId = adminUser.id;
    } else {
      // Fallback: get from profiles table
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();
      if (profileError) {
        throw new Error("Could not find admin user");
      }
      adminId = profiles.id;
    }

    // 3. Upsert admin profile
    console.log("👤 Upserting admin profile...");
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: adminId,
        full_name: "Admin User",
        role: "admin",
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;
    console.log(`  ✓ Admin profile updated`);

    // 4. Check existing products
    console.log("📦 Checking for existing products...");
    let { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("name", "Classic T-Shirt")
      .limit(1);

    if (checkError) throw checkError;

    let product;
    if (existingProducts && existingProducts.length > 0) {
      product = existingProducts[0];
      console.log(`  ✓ Product already exists (ID: ${product.id})`);
    } else {
      console.log("  Creating new product...");
      const { data: products, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: "Classic T-Shirt",
            description: "Comfortable classic t-shirt in multiple colors",
            price: 29.99,
            image_url: "https://via.placeholder.com/300?text=Classic+T-Shirt",
          },
        ])
        .select();

      if (productError) throw productError;
      product = products[0];
      console.log(`  ✓ Product created: ${product.name} (ID: ${product.id})`);
    }

    // 5. Seed inventory
    console.log("📊 Seeding inventory...");
    let { data: existingInventory, error: checkInvError } = await supabase
      .from("inventory_items")
      .select("id, sku, stock_quantity")
      .eq("product_id", product.id)
      .limit(1);

    if (checkInvError) throw checkInvError;

    let inventory;
    if (existingInventory && existingInventory.length > 0) {
      inventory = existingInventory;
      console.log(
        `  ✓ Inventory already exists: SKU ${inventory[0].sku}, Stock: ${inventory[0].stock_quantity}`
      );
    } else {
      const { data: newInventory, error: inventoryError } = await supabase
        .from("inventory_items")
        .insert([
          {
            product_id: product.id,
            sku: `SHIRT-001`,
            stock_quantity: 50,
          },
        ])
        .select();

      if (inventoryError) throw inventoryError;
      inventory = newInventory;
      console.log(
        `  ✓ Inventory created: SKU ${inventory[0].sku}, Stock: ${inventory[0].stock_quantity}`
      );
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`\n📋 Summary:`);
    console.log(`  - Admin ID: ${adminId}`);
    console.log(`  - Product: ${product.name} ($${product.price})`);
    console.log(
      `  - Initial Stock: ${inventory[0].stock_quantity} units\n`
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
