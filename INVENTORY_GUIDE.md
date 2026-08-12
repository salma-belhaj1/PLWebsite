# Product & Inventory Management Guide

## Overview
This guide covers:
1. ✅ **Inventory Management UI** - View, search, and delete products in admin dashboard
2. ✅ **Add Products** - Form to create new products with pricing and stock
3. ✅ **Product Images** - Google Sheets image URLs support
4. 📝 **Bulk Import** - CSV import script for migrating products from spreadsheets
5. 📊 **Expense Tracking** - Track business expenses (packaging, shipping, etc.)
6. 📈 **Dashboard Stats** - Real-time inventory and revenue metrics

---

## 1. Admin Dashboard Features

### Inventory Management Page
- **Location**: `/admin/inventory`
- **Features**:
  - 📋 View all products in table format
  - 🔍 Search by product name or SKU
  - 🎨 Color-coded stock levels (Green: >5, Yellow: 1-5, Red: 0)
  - 🖼️ Clickable image links (opens Google Sheets images)
  - 🗑️ Delete products
  
**Columns Displayed**:
| Product | SKU | Price | Stock | Image | Actions |
|---------|-----|-------|-------|-------|---------|

### Add Product Form
- **Location**: `/admin/inventory/new`
- **Fields**:
  - Product Name (required)
  - Description (optional)
  - Price (required, decimal format)
  - SKU (optional, auto-generated if empty)
  - Initial Stock (required, integer)
  - Image URL (optional, paste Google Sheets image link)

---

## 2. Bulk Product Import

### Quick Start
```bash
# From PLWebsite root directory
node scripts/import-products.js <CSV_FILE> <SUPABASE_URL> <SUPABASE_ANON_KEY>
```

### Example
```bash
node scripts/import-products.js ./scripts/my-products.csv \
  https://yourproject.supabase.co \
  eyJhbGc...UQ
```

### CSV File Format
Create a CSV file with these columns (in any order):

```csv
name,description,price,sku,stock_quantity,image_url
Classic T-Shirt,Premium cotton,29.99,SHIRT-001,50,https://lh3.googleusercontent.com/xxx
Hoodie,Fleece lined,49.99,HOOD-001,30,https://lh3.googleusercontent.com/yyy
```

### Column Reference
| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `name` | Text | ✅ | Product name/title |
| `description` | Text | ❌ | Product details |
| `price` | Number | ✅ | Sale price (decimal, e.g., 29.99) |
| `sku` | Text | ❌ | Auto-generated if empty |
| `stock_quantity` | Number | ❌ | Initial stock (default: 0) |
| `image_url` | URL | ❌ | Google Sheets or external image link |

### CSV Examples

#### From Google Sheets
1. Open your Google Sheet with inventory data
2. **File → Download → CSV**
3. Open the downloaded file in a text editor
4. Keep only required columns, add missing headers if needed
5. Save as `products.csv`
6. Run import script

#### Alternative Column Names (auto-detected)
The script is flexible and accepts these variations:
- Product name: `name`, `Product`, `Category`
- Price: `price`, `Price`, `Prix de vente`
- Stock: `stock_quantity`, `Stock`, `Quantity`
- Image: `image_url`, `Image`, `Image URL`

### Supported Image Sources
✅ Google Drive shared images
✅ Google Sheets image links
✅ External URLs (direct image links)
✅ Any HTTPS image URL

**Note**: Images are stored as URLs only (not uploaded). Ensure image links are publicly accessible.

### Import Script Features
- ✅ Validates CSV format
- ✅ Skips duplicate products (by name)
- ✅ Auto-generates missing SKUs
- ✅ Handles errors gracefully
- ✅ Provides detailed success/error report
- ✅ Connection verification

### Example Output
```
📦 Product Import Script
========================
📁 CSV File: products.csv
🔗 Supabase URL: https://xxx.supabase.co
✅ Connected to Supabase
📊 Parsed 12 products from CSV

✅ Imported: Classic T-Shirt (SHIRT-001) - $29.99 - 50 units
✅ Imported: Hoodie (HOOD-001) - $49.99 - 30 units
⏭️  Skipping duplicate product: Jeans (JEANS-001)
❌ Row: Invalid Product - Invalid data: name="", price="NaN"

📈 Import Summary
=================
✅ Successfully imported: 11 products
❌ Errors: 1 products
📊 Total processed: 12 records
```

---

## 3. Expense Tracking

### Expense Management Page
- **Location**: `/admin/expenses`
- **Features**:
  - 📊 Total expenses tracker
  - ➕ Add new expense form
  - 📋 Expense history table
  - 🔒 Admin-only access

### Add Expense Form
**Fields**:
- Category (e.g., Packaging, Shipping, Fees, Other)
- Description (e.g., "Brown cardboard boxes, 100 units")
- Price per unit (decimal)
- Quantity (integer)
- **Total** (auto-calculated: Price × Quantity)

### Expense Categories
- 📦 **Packaging** - Boxes, tissue paper, labels, tape
- 🚚 **Shipping** - Courier fees, postal charges
- 💳 **Fees** - Payment processing, platform fees
- 🎁 **Supplies** - Stickers, ribbons, gift wrap
- 🔧 **Other** - Miscellaneous business expenses

---

## 4. Dashboard & Stats

### Dashboard Overview
- **Location**: `/admin`
- **Real-time Stats**:
  - 📦 Total Products (count of all items)
  - 📈 In Stock (count of items with stock > 0)
  - 🛍️ Items Sold (count of completed orders)
  - 💰 Revenue (sum of all order totals)
  - 📊 Total Profit (revenue minus expenses)

### Quick Action Cards
- ➕ Add Product → `/admin/inventory/new`
- 📋 Manage Inventory → `/admin/inventory`
- 💰 Track Expenses → `/admin/expenses`

### Growth Insights
- Inventory value (total revenue)
- Stock status (items in stock)
- Conversion rate (% of items sold)

---

## 5. Database Schema

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  image_url TEXT,
  created_at TIMESTAMP
);
```

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  sku TEXT,
  stock_quantity INTEGER
);
```

### Other Expenses Table
```sql
CREATE TABLE other_expenses (
  id SERIAL PRIMARY KEY,
  category TEXT,
  description TEXT,
  amount NUMERIC(10, 2),
  expense_date TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP
);
```

---

## 6. Troubleshooting

### Import Script Issues

**Error: "CSV file not found"**
- Verify file path is correct
- Use absolute path or relative path from project root
- Check file extension is `.csv`

**Error: "Invalid Supabase URL format"**
- URL should be: `https://[PROJECT-REF].supabase.co`
- Check for typos, ensure HTTPS protocol

**Error: "Invalid data: name/price"**
- CSV missing required fields
- Check column names match expected format
- Ensure price column has numeric values (e.g., 29.99, not "$29.99")

**Products not imported but no errors**
- Check for duplicate products (script skips duplicates)
- Verify Supabase connection credentials
- Check database permissions for admin user

### Image Links Not Showing
- Verify URLs are HTTPS (not HTTP)
- Test link in browser to confirm accessibility
- Use "Share" link from Google Drive for public access
- For Google Sheets: Right-click image → Open image in new tab → Copy URL

### Stock Quantity Issues
- Stock automatically decrements on order (via database trigger)
- Cannot sell more than available stock
- Use Inventory page to adjust stock if needed

---

## 7. Workflow Example

### Migrating from Google Sheets

**Step 1: Export Data**
1. Open your Google Sheet
2. File → Download → CSV
3. Save as `my-inventory.csv`

**Step 2: Prepare CSV**
1. Open in Excel or text editor
2. Keep only columns: name, price, description, sku, stock_quantity, image_url
3. Delete extra columns
4. Save

**Step 3: Run Import**
```bash
cd c:\Users\21693\Documents\Work\Projects\PLWebsite
node scripts/import-products.js ./scripts/my-inventory.csv \
  https://your-project.supabase.co \
  your-anon-key
```

**Step 4: Verify**
1. Go to `/admin/inventory`
2. Search for imported products
3. Check stock levels and images

---

## 8. API Reference (For Developers)

### Fetch Inventory
```typescript
const { data } = await supabase
  .from('products')
  .select('*, inventory_items!inner(*)')
  .order('created_at', { ascending: false });
```

### Create Product
```typescript
const { data, error } = await supabase
  .from('products')
  .insert([{ name, description, price, image_url }])
  .select();
```

### Update Stock
```typescript
await supabase
  .from('inventory_items')
  .update({ stock_quantity: newQty })
  .eq('product_id', productId);
```

### Add Expense
```typescript
const { error } = await supabase
  .from('other_expenses')
  .insert([{ category, description, amount, expense_date: new Date() }]);
```

---

## 9. Performance Tips

- ✅ Search by SKU (indexed, faster than name search)
- ✅ Keep product images under 2MB
- ✅ Use HTTPS URLs for all image links
- ✅ Batch import large product lists (1000+ items)
- ✅ Archive old expense records periodically

---

## 10. Security

🔒 **Admin-Only Access**
- Inventory, Expenses, Analytics require `role = 'admin'`
- Non-admins redirected to shop
- Database RLS policies enforce server-side security

🔒 **Data Protection**
- All URLs require HTTPS
- Supabase RLS prevents unauthorized access
- Anon key limited to public data only
- Admin key used for sensitive operations

---

## Next Steps

- 📱 Mobile app support (coming soon)
- 📊 Advanced analytics & reporting
- 🤖 Automated low-stock alerts
- 📈 Profit margin tracking
- 🔄 Inventory sync from multiple sources

---

**Questions?** Check the admin sidebar or navigate to the relevant section.
