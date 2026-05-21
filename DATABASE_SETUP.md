# Database Setup Guide for Peace & Love

## Prerequisites

- PostgreSQL installed and running
- Docker (optional, for running PostgreSQL in a container)

---

## 🚀 Quick Setup (Recommended)

### Step 1: Start PostgreSQL with Docker

Make sure you're in the PLWebsite directory, then run:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with:
- Username: `peace_love_user`
- Password: `peace_love_password`
- Database: `peace_love_db`
- Port: `5432`

### Step 2: Verify PostgreSQL is Running

```bash
docker ps
```

You should see the postgres container running.

### Step 3: Initialize Database Schema

From the backend directory:

```bash
cd backend
npm run init-db
```

This will:
- Create all tables (products, categories, orders, users, etc.)
- Create indexes for performance
- Set up relationships between tables

### Step 4: Seed Database with Products

```bash
npm run seed
```

This will populate your database with:
- 7 product categories (Hair, Face, Hand Accessories, etc.)
- 13+ sample products from your inventory
- Product variants (colors, sizes, etc.)

### Step 5: Verify Data

The backend API is now ready! Test it with:

```bash
curl http://localhost:5000/api/products
```

---

## 📊 Database Schema

### Categories Table
- Stores product categories (Hair, Gifts, etc.)

### Products Table
- Main product information
- References categories
- Stores price, description, status

### Product Variants Table
- Stores product variations (color, size, etc.)
- Each product can have multiple variants
- Tracks stock quantity per variant

### Orders Table
- Stores customer orders
- Customer information
- Order status and total amount

### Order Items Table
- Items within each order
- Links to products and variants
- Stores quantity and price at time of order

### Users Table
- Customer and admin accounts
- Stores hashed passwords
- Roles (customer, admin)

---

## 🔄 Database Commands

```bash
# Initialize schema (create tables)
npm run init-db

# Seed database (populate with products)
npm run seed

# Full setup (init + seed)
npm run db-setup
```

---

## 🛠️ Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL is running: `docker ps`
- Check DATABASE_URL in `.env` file
- Verify port 5432 is available

### "Table already exists" error
- This is fine! The schema uses `IF NOT EXISTS`
- To reset: Drop tables manually or use a fresh database

### "psql: command not found"
- PostgreSQL is not installed
- Use Docker: `docker-compose up -d`

---

## 📝 Updating Product Data

To add/update products from your Google Sheets:

1. Edit `src/scripts/seed.ts`
2. Update the `products` object with new data
3. Run `npm run seed` again

---

## 🔐 Production Setup

For production on Render:

1. Create a PostgreSQL database on Render
2. Copy the connection URL
3. Set `DATABASE_URL` environment variable
4. Run migrations on deployment

---

## 📞 API Endpoints

Once seeded, your backend will have:

```
GET  /api/products              - Get all products
GET  /api/products/:id          - Get product by ID
GET  /api/products/categories   - Get all categories
```

---

## ✅ Next Steps

After database is set up:

1. Connect frontend to fetch products
2. Update Shop page to display real products
3. Implement cart functionality
4. Add user authentication
5. Set up admin product management

---

**Your database is ready! 🎉**
