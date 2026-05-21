# Peace & Love Backend

Node.js + Express backend API for the Peace & Love e-commerce store.

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- PostgreSQL 12+

### Installation

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://username:password@localhost:5432/peace_love_db
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

### Development

```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
src/
├── config/        # Configuration (database, constants)
├── controllers/   # Business logic
├── middleware/    # Express middleware
├── routes/        # API routes
├── db/           # Database utilities
├── scripts/      # Database scripts
└── server.ts     # Main server entry point
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/products` - Get all products
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Database Setup

PostgreSQL setup instructions coming soon...
