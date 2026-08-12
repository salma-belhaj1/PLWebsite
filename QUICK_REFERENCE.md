# Peace & Love - Quick Reference Card

---

## 🚀 START HERE (Choose One)

### 🐳 Option A: Docker (Easiest)
```bash
cd c:\Users\21693\Documents\Work\Projects\PLWebsite
docker-compose up -d --build
cd backend && npm run db-setup
# Visit: http://localhost:5173
```

### 💻 Option B: Local Development (Faster)
```bash
# Terminal 1
docker-compose up postgres -d

# Terminal 2
cd backend && npm install && npm run dev

# Terminal 3
cd frontend && npm install && npm run dev
```

---

## 🔑 Quick Commands

```bash
# Create admin (in PostgreSQL)
docker exec -it peace-love-postgres psql -U peace_love_user -d peace_love_db

# Insert admin user
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@peace.love.tn', '$2b$10$xxx', 'Admin', 'admin');

# Seed products
npm run seed

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| Admin Login | http://localhost:5173/login |
| Admin Panel | http://localhost:5173/admin |
| Products API | http://localhost:5000/api/products |

---

## 👤 Admin Credentials (For Testing)

```
Email: admin@peace.love.tn
Password: admin123
```

---

## 📦 Database Credentials

```
Host: localhost
Port: 5432
Database: peace_love_db
Username: peace_love_user
Password: peace_love_password
```

---

## 📊 What's Included

✅ Dark/Light theme  
✅ English/French bilingual  
✅ Shopping cart  
✅ Product filtering & sorting  
✅ Checkout form  
✅ Order confirmation  
✅ 13+ seeded products  
✅ Admin routes (protected)  
✅ Responsive design  
✅ Accessibility features  

---

## ⏳ Phase 2 (Coming Soon)

⏳ Inventory management UI  
⏳ Order management  
⏳ Analytics dashboard  
⏳ Payment integration  
⏳ Email notifications  

---

## 🔄 Testing Flow

1. **Start app** → Docker or local
2. **Navigate to** http://localhost:5173
3. **Browse shop** → Click products
4. **Add to cart** → Click "Add to Bag"
5. **Checkout** → Fill form & place order
6. **See success** → Order confirmation
7. **Test themes** → Click moon/sun icon
8. **Test languages** → Click EN/FR
9. **Login as admin** → admin@peace.love.tn / admin123
10. **View admin panel** → /admin

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| Port 5173/5000 in use | `docker-compose restart` |
| Products not showing | `npm run seed` |
| Can't login | Create admin in DB (see admin creation) |
| API not working | `curl http://localhost:5000/health` |
| Styles missing | Hard refresh: `Ctrl+Shift+Delete` |

---

## 📈 Deployment Path

1. **Test locally** ← You are here
2. **Push to GitHub** → `git push`
3. **Deploy to Render** → Connect GitHub repo
4. **Get domain** → Register peace.love.tn on Namecheap
5. **Point DNS** → Add CNAME records
6. **Go live** → www.peace.love.tn

See **DEPLOYMENT_AND_ADMIN_GUIDE.md** for detailed steps.

---

## 📝 Key Files

```
PLWebsite/
├── frontend/
│   ├── src/pages/Shop.tsx          (Filtering, sorting, products)
│   ├── src/components/CartDrawer   (Shopping cart)
│   ├── src/components/Footer       (Copyright 2026)
│   ├── index.html                  (Favicon set ✅)
│   └── src/locales/                (EN/FR translations)
│
├── backend/
│   ├── src/scripts/seed.ts         (Products seeding)
│   ├── src/db/schema.sql           (Database tables)
│   └── src/routes/products.ts      (API endpoints)
│
├── docker-compose.yml              (Services config)
├── ENHANCEMENT_SUMMARY.md          (UI/UX details)
├── DEPLOYMENT_AND_ADMIN_GUIDE.md   (Deployment steps)
└── SYSTEM_STATUS_AND_TESTING_GUIDE.md (Full status)
```

---

## 💡 Tips

- **Dark Mode**: Stored in localStorage, persists
- **Language**: Stored in localStorage, persists  
- **Cart**: Stored in React Context, cleared on logout
- **Theme Colors**: Tailwind custom colors in config
- **Animations**: CSS in App.css, Framer-motion in JSX
- **API Calls**: Axios with baseURL in env vars

---

## 📞 Support Files

📄 **ENHANCEMENT_SUMMARY.md** - UI/UX features  
📄 **DEPLOYMENT_AND_ADMIN_GUIDE.md** - Hosting & admin setup  
📄 **SYSTEM_STATUS_AND_TESTING_GUIDE.md** - Full system status  
📄 **GETTING_STARTED.md** - Original setup guide  
📄 **DATABASE_SETUP.md** - DB configuration  

---

## ✨ Brand Colors

```
Primary Pink: #ee7aaa (Brand identity)
Secondary Red: #FF1744 (Accents)
Light Background: #ffffff
Dark Background: #0a0a0a
```

---

## 🎯 Current Status

**Frontend**: ✅ Complete  
**Backend**: ✅ Core API Ready  
**Database**: ✅ Schema & Seeds Ready  
**Admin Panel**: ⏳ Phase 2  
**Auth**: ⏳ Routes ready, endpoints to complete  
**Payments**: ⏳ Not yet integrated  
**Email**: ⏳ Not yet configured  

---

**Last Updated**: 2026-06-18  
**Status**: 🚀 Ready for Local Testing
