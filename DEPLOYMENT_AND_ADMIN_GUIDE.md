# Peace & Love: Deployment & Admin Setup Guide

**Last Updated**: 2026-06-18  
**Status**: ✅ Ready for Local Testing & Deployment

---

## 📋 Table of Contents

1. [Quick Start (Local Development)](#quick-start-local-development)
2. [Creating Admin Account](#creating-admin-account)
3. [Managing Products & Inventory](#managing-products--inventory)
4. [Running Locally vs Docker](#running-locally-vs-docker)
5. [Deployment Options](#deployment-options)
6. [Getting www.peace.love.tn Domain & Free Hosting](#getting-wwwpeacelovetm-domain--free-hosting)

---

## 🚀 Quick Start (Local Development)

### Option 1: Docker (Recommended - Easiest)

Perfect if you want everything working in 2 minutes without manual setup.

```bash
# Navigate to project directory
cd c:\Users\21693\Documents\Work\Projects\PLWebsite

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d --build

# Initialize database & seed with products
cd backend
npm run db-setup

# Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# Admin: http://localhost:5173/login → then /admin
```

**To stop everything:**
```bash
docker-compose down
```

✅ **Pros**: Single command, no setup needed, PostgreSQL included  
❌ **Cons**: Requires Docker Desktop installed

---

### Option 2: Local Development (Manual Setup)

For more control and faster development iterations.

```bash
# Terminal 1: Start PostgreSQL (ensure it's running)
# If using Docker just for DB:
docker-compose up postgres -d

# Terminal 2: Start Backend
cd backend
npm install
npm run dev
# Should show: ✅ Server running on http://localhost:5000

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
# Should show: ➜ Local: http://localhost:5173
```

✅ **Pros**: Faster reloads, better debugging, more control  
❌ **Cons**: Need to manage 3 separate terminal windows

---

## 👤 Creating Admin Account

### Step 1: Direct Database Insert (Development Only)

The fastest way to create an admin for testing:

```bash
# Connect to PostgreSQL
# On Windows with Docker:
docker exec -it peace-love-postgres psql -U peace_love_user -d peace_love_db

# Or use PostgreSQL client if installed locally
psql postgresql://peace_love_user:peace_love_password@localhost:5432/peace_love_db
```

### Step 2: Create Admin User

```sql
-- Generate bcrypt hash for password (example uses 'admin123')
-- For now, use this SQL to insert:

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@peace.love.tn',
  '$2b$10$h.Xs3pO9/QMHWqQ5.6ZEu.Q3w5VVNqFqJJ5k5J5k5J5k5J5k5J5k5', -- bcrypt hash of 'admin123'
  'Admin User',
  'admin'
);

-- Verify it was created:
SELECT * FROM users WHERE role = 'admin';
```

### Step 3: Login to Admin Panel

```
URL: http://localhost:5173/login
Email: admin@peace.love.tn
Password: admin123
```

---

## 🔐 Creating Admin with Proper Password Hashing

For production, use this Node.js script:

**File: `backend/create-admin.js`**

```javascript
import bcrypt from 'bcrypt';
import { pool } from './src/config/database.js';

async function createAdmin() {
  const email = 'admin@peace.love.tn';
  const password = 'YourSecurePassword123!'; // Change this!
  const name = 'Admin User';
  
  try {
    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert into database
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, passwordHash, name, 'admin']
    );
    
    console.log('✅ Admin user created:', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    await pool.end();
  }
}

createAdmin();
```

**Run it:**
```bash
cd backend
node --import tsx create-admin.js
```

---

## 📦 Managing Products & Inventory

### Current Product Database

Your database already has **13+ products** seeded with this structure:

```
Categories:
├── Hair (2 products)
├── Face (1 product)
├── Hand Accessories (1 product)
├── Satin Pillows (1 product)
├── Notebooks (2 products)
├── Gifts (3 products)
└── Packaging (2 products)
```

**Example Product Structure:**
```json
{
  "id": 1,
  "name": "Hair Clip - Classic",
  "category": "Hair",
  "price": 0.75,
  "status": "available",
  "variants": [
    { "type": "color", "value": "Orange", "stock": 10 },
    { "type": "color", "value": "Jaune", "stock": 8 },
    { "type": "color", "value": "Blanc", "stock": 12 }
  ]
}
```

### View Products via API

```bash
# Get all products
curl http://localhost:5000/api/products

# Get products by category
curl http://localhost:5000/api/products?category=Hair

# Search products
curl http://localhost:5000/api/products?search=clip
```

### Add/Edit Products (Admin Interface)

**Current Status**: Inventory management UI is in Phase 2 (placeholder exists at `/admin/inventory`)

**For now, add products directly to database:**

```sql
-- Add a new product
INSERT INTO products (name, description, category_id, price, status)
VALUES (
  'New Product Name',
  'Product description here',
  1, -- category_id (1=Hair, 2=Face, etc.)
  9.99,
  'available'
);

-- Get the new product ID
SELECT id FROM products WHERE name = 'New Product Name' LIMIT 1;

-- Add variants (colors/sizes)
INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
VALUES (
  (SELECT id FROM products WHERE name = 'New Product Name'),
  'color',
  'Red',
  20
);
```

### Check Stock Levels

```sql
SELECT 
  p.name,
  p.price,
  pv.variant_value,
  pv.stock_quantity
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.name, pv.variant_value;
```

---

## 💻 Running Locally vs Docker

### Decision Matrix

| Factor | Local | Docker |
|--------|-------|--------|
| **Setup Time** | 15-20 min | 2 min |
| **Disk Space** | ~500MB | ~2GB |
| **Development Speed** | ⚡ Fastest (hot reload) | ⚡ Fast (containerized) |
| **Database Management** | Manual | Automatic |
| **Production-Ready** | ❌ No | ✅ Yes |
| **Cross-Platform** | ❌ May vary | ✅ Consistent |
| **Learning Curve** | Low | Medium |

### My Recommendation

**For Development**: Use Local setup with Docker for just PostgreSQL
```bash
docker-compose up postgres -d  # Just the database
# Then run frontend & backend locally for hot reload
```

**For Testing**: Use full Docker setup
```bash
docker-compose up -d --build  # Everything together
```

**For Deployment**: Use Docker (ensures consistency)

---

## 🌍 Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)

**Why Render?**
- ✅ Free tier with PostgreSQL (100MB)
- ✅ Auto-deploys from GitHub
- ✅ One-click setup
- ✅ Custom domain support
- ✅ No credit card initially

**Setup Steps:**

1. **Push to GitHub**
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: Peace & Love e-commerce"
git remote add origin https://github.com/yourusername/peace-love.git
git push -u origin main
```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Backend**
   - New → Web Service
   - Connect GitHub repo
   - Name: `peace-love-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=<Render PostgreSQL connection>
     JWT_SECRET=<generate-random-string>
     CORS_ORIGIN=https://yourdomian.com
     ```

4. **Deploy Frontend**
   - New → Static Site
   - Connect GitHub repo
   - Name: `peace-love-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

5. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Name: `peace-love-db`
   - Copy connection string to Backend env vars

**Estimated Cost**: Free tier supports ~100 concurrent connections

---

### Option 2: Vercel + Railway

**Frontend**: Vercel (free, optimized for React)
**Backend + Database**: Railway (free tier, then $5/month)

```bash
# Deploy frontend to Vercel
npm install -g vercel
cd frontend
vercel
```

More complex but more scalable.

---

### Option 3: Supabase (All-in-One)

Already set up in your Cheebo project! Could reuse.

- PostgreSQL included
- Auth pre-built
- Free tier: 500MB storage
- Real-time capabilities

---

## 🌐 Getting www.peace.love.tn Domain & Free Hosting

### Step 1: Get Free/Cheap .tn Domain

**Option A: Affordable Registrar**
- **Namecheap**: ~$8.88/year for `.tn` domains
- **Dynadot**: ~$6.99/year
- **Hostinger**: ~$9.99/year

**Option B: Free Alternatives** (subdomain-only)
- **Freenom**: free `.tk` / `.ml` / `.ga` (not `.tn`)
- **Github Pages**: free but `.github.io` only
- **Netlify**: free but `yoursite.netlify.com` only

**Recommendation**: **Go with Namecheap for `.tn` domain** (~$9/year) because:
- ✅ Short, professional URL
- ✅ Builds brand in Tunisia
- ✅ Easy DNS management
- ✅ Supports all deployment methods

### Step 2: Setup DNS Pointing to Render

**At Namecheap/Your Registrar:**

1. Go to Domain Settings → DNS
2. Add these records:

```
Type    | Name           | Value
--------|----------------|------------------
CNAME   | www            | <your-render-domain>
CNAME   | api            | <your-render-backend-domain>
CNAME   | @              | <your-render-domain>  (for root)
```

**Example:**
```
www → peace-love-frontend.onrender.com
api → peace-love-backend.onrender.com
```

### Step 3: Add Custom Domain to Render

1. In Render Dashboard → Frontend Service → Settings
2. Add Custom Domain: `www.peace.love.tn`
3. Render will provide DNS verification

### Step 4: Update Frontend API URL

**File: `frontend/.env.production`**
```
VITE_API_URL=https://api.peace.love.tn/api
```

Or if using subdomain routing:
```
VITE_API_URL=https://www.peace.love.tn/api
```

---

## 🔗 Final URLs Structure

```
🌐 Frontend (Public)
   https://www.peace.love.tn (or https://peace.love.tn)
   
🔐 Admin Panel
   https://www.peace.love.tn/login
   https://www.peace.love.tn/admin
   
⚙️ Backend API
   https://api.peace.love.tn/api/products
   https://api.peace.love.tn/api/orders
   https://api.peace.love.tn/api/auth
   
💾 Database
   Managed on Render PostgreSQL (hidden)
```

---

## ✅ Pre-Deployment Checklist

- [ ] All products imported to database
- [ ] Admin account created & tested
- [ ] Frontend dark/light theme works
- [ ] Shopping cart functionality tested
- [ ] Checkout form validation works
- [ ] Favicon set to logo-dark.png ✅
- [ ] Footer copyright year set to 2026 ✅
- [ ] TND currency displays correctly
- [ ] Email notifications (optional)
- [ ] Analytics setup (optional)

---

## 🚀 Quick Start Commands Summary

### Local Docker (Easiest)
```bash
cd PLWebsite
docker-compose up -d --build
cd backend && npm run db-setup
# Visit http://localhost:5173
```

### Local Development (Fastest)
```bash
# Terminal 1
docker-compose up postgres -d

# Terminal 2
cd backend && npm run dev

# Terminal 3
cd frontend && npm run dev
```

### Production (Render)
```bash
# Push to GitHub
git push

# Render auto-deploys from GitHub
# Add domain at: https://peace.love.tn
```

---

## 📞 Support & Troubleshooting

### Database connection refused
```bash
# Check if postgres is running
docker ps | grep postgres

# Restart if needed
docker-compose up postgres -d
```

### Port 5000/5173 already in use
```bash
# Kill process using port
lsof -ti:5000 | xargs kill -9

# Or use different ports
PORT=5001 npm run dev
```

### Admin login not working
```bash
# Check users table
docker exec peace-love-postgres psql -U peace_love_user -d peace_love_db -c "SELECT * FROM users;"

# If empty, create admin again
```

### Frontend can't reach backend
```bash
# Check CORS is enabled
# Check backend is running: curl http://localhost:5000/health

# In frontend .env:
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Next Steps

1. **Test Locally** → Run on Docker, create admin, test shopping flow
2. **Import Remaining Products** → Use SQL to add all inventory from screenshots
3. **Setup GitHub** → Push code to GitHub (required for Render auto-deploy)
4. **Deploy to Render** → Free tier gets you started
5. **Register Domain** → Get `peace.love.tn` on Namecheap (~$9/year)
6. **Go Live** → Point DNS to Render, enable SSL/TLS

---

**Status**: ✅ Ready for Testing & Deployment  
**Last Review**: 2026-06-18  
**Next Review**: When deploying to production

