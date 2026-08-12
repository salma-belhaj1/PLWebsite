# Peace & Love Frontend

React + TypeScript frontend for the Peace & Love e-commerce store.

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Project Structure

```
src/
├── components/     # Reusable React components
├── pages/         # Page components
├── services/      # API service calls
├── context/       # React context for state management
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run Vitest once the test dependencies are installed

## Store Features

- Top announcement ribbon and search in the header
- Shop filters for sorting, stock status, and search query syncing
- Persistent cart with a drawer and checkout modal
- Checkout posts orders to the backend and expects inventory to be decremented atomically on order creation
- Shipping is fixed at 8 TND and prices are displayed in TND

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
```
