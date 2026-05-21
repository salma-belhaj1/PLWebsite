# Peace & Love E-commerce Store

A full-stack e-commerce website for the **Peace & Love** store built with modern technologies.

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** for database
- **JWT** for authentication
- **CORS** for cross-origin requests

### Hosting
- **Render** for full-stack deployment
- **PostgreSQL** managed database
- **Docker** for containerization

## 📁 Project Structure

```
PLWebsite/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── backend/           # Node.js + Express backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml # Local development with Docker
└── vercel.json       # Deployment configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+
- PostgreSQL (or use Docker)
- npm or yarn

### Local Development

#### 1. Clone and Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

#### 2. Setup Database

Using Docker (recommended):
```bash
docker-compose up -d
```

Or setup PostgreSQL manually:
```bash
createdb peace_love_db
```

#### 3. Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql://peace_love_user:peace_love_password@localhost:5432/peace_love_db
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

#### 4. Start Development Servers

**Backend**:
```bash
cd backend
npm run dev
```

**Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

Access the frontend at `http://localhost:5173` and backend API at `http://localhost:5000`

## 🚀 Deployment on Render

### Step 1: Create Backend Service

1. Go to [Render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set configuration:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`
5. Add environment variables:
   - `DATABASE_URL` - Connection string from PostgreSQL
   - `JWT_SECRET` - Secret key
   - `CORS_ORIGIN` - Your frontend URL
   - `NODE_ENV` - "production"

### Step 2: Create PostgreSQL Database

1. Create a new **PostgreSQL** database on Render
2. Copy the connection string and add to backend environment variables

### Step 3: Create Frontend Service

1. Create a new **Static Site**
2. Connect your GitHub repository
3. Set configuration:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: `frontend`

### Step 4: Connect Services

Update frontend environment variables to point to your backend URL:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 📝 Features

### Client Space
- 🛍️ Product browsing with filters
- 🛒 Shopping cart management
- 💳 Checkout process
- 👤 User account & order history
- ❤️ Wishlist functionality

### Admin Space
- 📊 Dashboard with key metrics
- 📦 Inventory management
- 📋 Order management
- 👥 Customer management
- 📈 Analytics and reporting

## 🎨 Design System

### Colors
- **Pink**: `#ee7aaa` (Primary)
- **Red**: `#ff0000` (Accent)
- **Black**: `#000000` (Dark)
- **White**: `#ffffff` (Light)

### Fonts
- **Stayvibes** (Headings) - Wobbly playful text
- **18th Century** (Body) - Classic serif font

### UI/UX Principles
- Responsive design (mobile-first)
- Accessible components
- Smooth animations and transitions
- Intuitive navigation
- Fast loading times

## 📚 API Documentation

Coming soon...

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention via parameterized queries
- Helmet.js for HTTP headers security

## 📦 Database Schema

Coming soon...

## 🤝 Contributing

Contributions are welcome! Please create a pull request with your changes.

## 📄 License

MIT

## 👥 Contact

- Instagram: [@peace.love.tn](https://www.instagram.com/peace.love.tn/)
- Email: pl.tn.contact@gmail.com
- Phone: +216 93 656 789

---

Built with ❤️ for Peace & Love
