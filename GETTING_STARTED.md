# 🚀 Getting Started with Peace & Love E-commerce

Welcome! This guide will help you set up and run the Peace & Love e-commerce website locally and deploy it to Render.

## 📋 Quick Setup (5 minutes)

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd ../backend
npm install
```

### 2. Start PostgreSQL Database

Using Docker (recommended - requires Docker Desktop):
```bash
docker-compose up -d
```

Or use a local PostgreSQL installation.

### 3. Set Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql://peace_love_user:peace_love_password@localhost:5432/peace_love_db
NODE_ENV=development
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

✅ You should see:
- Backend: `✅ Server running on http://localhost:5000`
- Frontend: Open `http://localhost:5173` in your browser

---

## 📁 Project Structure Overview

```
PLWebsite/
├── frontend/                    # React + TypeScript app
│   ├── src/
│   │   ├── pages/             # Home, Shop, Admin pages
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API calls (axios)
│   │   ├── context/           # State management
│   │   ├── App.tsx            # Main app component
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database & environment config
│   │   ├── routes/            # API routes (products, auth, etc)
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, error handling
│   │   ├── db/               # Database utilities
│   │   └── server.ts         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml          # Local PostgreSQL + services
├── README.md                   # Project overview
└── GETTING_STARTED.md         # This file
```

---

## 🎨 Design System

Your brand colors are already configured in Tailwind:

- **Pink** (`text-pl-pink`): `#ee7aaa` - Use for headings
- **Red** (`text-pl-red`): `#ff0000` - Use for accents
- **Black** (`text-pl-black`): `#000000` - Use for text
- **White** (`text-pl-white`): `#ffffff` - Use for backgrounds

**Fonts:**
- **Stayvibes** (headings): Already imported in `index.css`
- **18th Century** (body text): Already imported in `index.css`

Example:
```tsx
<h1 className="text-3xl font-stayvibes text-pl-pink">Welcome</h1>
<p className="font-century text-pl-black">Regular text goes here</p>
```

---

## 🔌 Backend API Structure

### Current Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/products` | Get all products |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### How to Add New Routes

1. **Create a controller** in `backend/src/controllers/`:
```typescript
// backend/src/controllers/productController.ts
import { Request, Response } from 'express';

export async function getAllProducts(req: Request, res: Response) {
  // Your logic here
  res.json({ products: [] });
}
```

2. **Create a route** in `backend/src/routes/`:
```typescript
// backend/src/routes/products.ts
import { Router } from 'express';
import { getAllProducts } from '../controllers/productController.js';

const productsRouter = Router();
productsRouter.get('/', getAllProducts);

export default productsRouter;
```

3. **Register in server.ts**:
```typescript
app.use('/api/products', productsRouter);
```

---

## 🖼️ Frontend Pages

### Home Page (`src/pages/Home.tsx`)
- Welcome message with brand intro
- Featured products showcase
- Call-to-action button to shop

### Shop Page (`src/pages/Shop.tsx`)
- Product grid layout
- Filters (coming soon)
- Product cards with add to cart

### Admin Dashboard (`src/pages/AdminDashboard.tsx`)
- Key metrics (sales, orders, products)
- Inventory management (coming soon)
- Order management (coming soon)

### How to Add New Pages

1. **Create page component**:
```tsx
// src/pages/ProductDetails.tsx
export default function ProductDetails() {
  return (
    <div className="min-h-screen">
      {/* Your content */}
    </div>
  );
}
```

2. **Add route in App.tsx**:
```tsx
import ProductDetails from './pages/ProductDetails';

<Route path="/products/:id" element={<ProductDetails />} />
```

---

## 🔐 Authentication Setup (Coming Soon)

When ready to implement authentication:

1. Backend will generate JWT tokens on login
2. Frontend stores token in localStorage
3. API calls include token in Authorization header
4. Auth middleware on backend validates token

Example middleware is already in `backend/src/middleware/auth.ts`

---

## 📊 Database Schema (Coming Soon)

When you're ready to build the database:

### Planned Tables
- `users` - Customer accounts
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in each order
- `categories` - Product categories
- `inventory` - Stock tracking

---

## 🚀 Deploying to Render

### Prerequisites
- GitHub account with your code pushed
- Render.com account (free tier available)

### Step 1: Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "PostgreSQL"
3. Choose name: `peace-love-db`
4. Region: Choose closest to you
5. PostgreSQL Version: 15
6. Plan: Free tier (0.07$/hour, auto-paused)
7. Click "Create Database"
8. Copy the **External Database URL** (you'll need this)

### Step 2: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `peace-love-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`
   
4. Environment Variables:
   ```
   DATABASE_URL=<paste from PostgreSQL step>
   NODE_ENV=production
   JWT_SECRET=<generate-secure-random-string>
   CORS_ORIGIN=<your-frontend-url>
   ```
   
5. Click "Create Web Service"
6. Wait for deployment (~3 minutes)
7. Copy your backend URL (e.g., `https://peace-love-backend.onrender.com`)

### Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `peace-love-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: `frontend`
   
4. Environment Variables:
   ```
   VITE_API_URL=https://peace-love-backend.onrender.com/api
   ```
   
5. Click "Create Static Site"
6. Wait for deployment (~2 minutes)

### Step 4: Update Frontend to Point to Backend

In `frontend/.env.production`:
```
VITE_API_URL=https://peace-love-backend.onrender.com/api
```

Then redeploy frontend.

### ✅ You're Live!

Your site will be available at the URL provided by Render (e.g., `https://peace-love-frontend.onrender.com`)

---

## 📝 Next Steps

1. **Create Database Schema**
   - Design tables for products, users, orders
   - Add migrations

2. **Implement Product Management**
   - Create product API endpoints
   - Build admin interface for adding products
   - Import your Google Sheets data

3. **Implement User Authentication**
   - Register/login functionality
   - User profiles
   - Order history

4. **Add Shopping Cart**
   - Cart state management
   - Checkout process
   - Payment integration (Stripe/Paypal)

5. **Polish UI/UX**
   - Add product images
   - Improve styling with your brand colors
   - Mobile responsiveness testing
   - Animation and transitions

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend can't connect to backend
- Check backend is running on `http://localhost:5000`
- Check `VITE_API_URL` environment variable
- Check CORS settings in `backend/src/server.ts`

### Database connection error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` is correct
- Verify PostgreSQL credentials match `.env`

### Docker issues
```bash
# Stop all containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Render Docs](https://render.com/docs)

---

## 💡 Tips

- Use TypeScript strict mode - it catches errors early!
- Keep components small and reusable
- Use React Router for page navigation
- Store API URLs in environment variables
- Always validate user input on frontend AND backend
- Use strong JWT secrets in production
- Test on mobile devices regularly

---

## 🤝 Need Help?

- Check the README.md in `frontend/` and `backend/` directories
- Review the code comments
- Check error messages carefully
- Ask questions in commits/PRs

---

**Happy coding! 🚀 Let's build Peace & Love together!**
