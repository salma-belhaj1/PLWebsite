# PHASE 1 & 2 EXECUTION GUIDE

## 🎯 What You're About to Do

**Phase 1**: Update your Supabase database with missing tables and seed initial data
**Phase 2**: Connect your frontend to Supabase (already done - files created)

---

## 📋 STEP-BY-STEP EXECUTION

### STEP 1: Run Phase 1 Migrations on Supabase

#### 1.1 Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select **peace&love** project (or your project name)
3. Click **SQL Editor** on the left sidebar
4. Click **New Query** button

#### 1.2 Run Migration 1 (Schema Updates)
1. Open: `supabase/migrations/001_add_missing_tables.sql`
2. Copy ALL the content
3. Paste into Supabase SQL Editor
4. Click the **Run** button
5. Wait for "Success" message

**What happens:**
- ✅ Adds cost tracking to products (cost_price, profit, sku)
- ✅ Creates carts + cart_items tables
- ✅ Creates other_expenses table
- ✅ Creates inventory_items table
- ✅ Creates profiles table
- ✅ Sets up indexes for performance

#### 1.3 Run Migration 2 (Seed Data)
1. Create a NEW Query in SQL Editor
2. Open: `supabase/migrations/002_seed_initial_data.sql`
3. Copy ALL the content
4. Paste into Supabase SQL Editor
5. Click the **Run** button
6. Wait for "Success" message

**What happens:**
- ✅ Creates 6 categories (Hair, Face, Satin Pillows, Notebooks, Gifts, Packaging)
- ✅ Creates 12 seed products
- ✅ Creates product variants
- ✅ Initializes inventory
- ✅ Calculates profit margins

#### 1.4 Verify Migrations Succeeded
In a NEW SQL Query, run:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: carts, cart_items, other_expenses, inventory_items, profiles, etc.
```

Then run:
```sql
-- Check data was seeded
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_variants FROM product_variants;

-- Should show: 6, 12, 2+
```

✅ **Phase 1 Complete** - Database is now ready!

---

### STEP 2: Frontend Service Layer (Already Done)

The following files have already been created for you:

#### New Service Layer Files Created:
```
frontend/src/services/supabase/
├── products.ts       ✅ Product CRUD
├── auth.ts          ✅ Authentication
├── cart.ts          ✅ Cart persistence
├── orders.ts        ✅ Order management
├── expenses.ts      ✅ Expense tracking
├── inventory.ts     ✅ Inventory management
└── index.ts         ✅ Exports all services
```

#### Updated Files:
- `frontend/src/services/api.ts` - Now wraps Supabase services
- `frontend/src/context/AuthContext.tsx` - Already uses Supabase Auth

#### No Changes Needed:
- Components stay the same (backward compatible)
- Cart context stays the same
- All existing code works unchanged

✅ **Phase 2 Complete** - Frontend connected to Supabase!

---

### STEP 3: Test the Connection

#### 3.1 Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

#### 3.2 Open Browser Console
- Press `F12` or `Ctrl + Shift + I`
- Go to **Console** tab

#### 3.3 Test Product Service
Paste this in console:

```javascript
import('src/services/api.js').then(async (mod) => {
  const products = await mod.productService.getAllProducts();
  console.log('Products:', products);
});
```

**Expected output:**
```javascript
{
  data: [
    { id: 1, name: 'Hair Clip Deluxe', price: 5, ... },
    { id: 2, name: 'Hair Brush Set', price: 12, ... },
    // ... 12 products total
  ]
}
```

#### 3.4 Test Categories
```javascript
import('src/services/api.js').then(async (mod) => {
  const cats = await mod.productService.getCategories();
  console.log('Categories:', cats);
});
```

**Expected output:**
```javascript
{
  data: [
    { id: 1, name: 'Hair', ... },
    { id: 2, name: 'Face', ... },
    // ... 6 categories total
  ]
}
```

✅ If you see data → **Connection works!**

---

## 🔍 Verification Checklist

After running both phases, verify:

- [ ] Supabase SQL Editor shows all tables exist
- [ ] Categories count = 6
- [ ] Products count = 12
- [ ] Variants count = 2+
- [ ] Shop page loads products (http://localhost:5173/shop)
- [ ] Browser console tests show data
- [ ] No errors in browser console

---

## ⚠️ If Something Goes Wrong

### Problem: "Table already exists"
**Solution:** This is OK! Just means you ran it before. Continue anyway.

### Problem: "UNIQUE constraint failed"
**Solution:** Database already has data. Clear and re-seed:

In Supabase SQL Editor:
```sql
DELETE FROM product_variants;
DELETE FROM inventory_items;
DELETE FROM products;
DELETE FROM categories;
```

Then re-run Migration 2 (Seed Data).

### Problem: Products don't show in Shop page
**Solution:** Check browser console for errors. Test with:

```javascript
// In browser console
import('src/services/api.js').then(async (mod) => {
  try {
    const products = await mod.productService.getAllProducts();
    console.log('Success:', products);
  } catch (err) {
    console.error('Error:', err);
  }
});
```

### Problem: "Supabase env vars are missing"
**Solution:** Make sure `.env.local` exists in frontend folder with:

```
VITE_SUPABASE_URL=https://idivzmkyhpfrudgsqpyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (your key)
```

---

## 📊 What You Have Now

### Database
- ✅ 6 Categories
- ✅ 12 Products with costs
- ✅ Variant support
- ✅ Inventory tracking
- ✅ Cart persistence
- ✅ Order management
- ✅ Expense tracking
- ✅ User profiles

### Frontend
- ✅ Product queries
- ✅ Authentication
- ✅ Cart persistence
- ✅ Order creation
- ✅ Expense management
- ✅ Inventory queries

### Not Yet
- ❌ Product images (need to upload)
- ❌ Admin product creation UI
- ❌ Admin CRUD forms
- ❌ Admin dashboard stats (calculations only, no UI)
- ❌ Checkout order creation (need to wire)

---

## 📝 Next Steps After Phase 1 & 2

1. **Phase 3**: Build Admin Product CRUD
   - Create ProductForm component
   - Add/Edit/Delete products
   - Upload product images

2. **Phase 4**: Inventory Management
   - Stock tracking UI
   - Reorder levels
   - Bulk import

3. **Phase 5**: Expense Management
   - Expense form & list
   - Category management

4. **Phase 6**: Dashboard Statistics
   - Calculate KPIs
   - Show charts
   - Real-time updates

---

## 🚀 Success Indicators

You'll know everything is working when:

1. ✅ No errors in browser console
2. ✅ Shop page shows 12 products
3. ✅ Products have images placeholder
4. ✅ Categories show correctly
5. ✅ Can add products to cart
6. ✅ Cart items persist (refresh page = items stay)
7. ✅ Can browse by category

---

## 🎉 You're Ready!

Once you complete these steps, you'll have:
- A fully connected Supabase backend
- 6 product categories
- 12 sample products
- All necessary tables for your ecommerce system
- Frontend ready to display products and manage cart

**Report back when you've completed Phase 1 & 2 migrations!**
