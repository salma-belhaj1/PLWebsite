import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { AdminGuard } from './guards/AdminGuard'
import { CustomerGuard } from './guards/CustomerGuard'
import LoadingScreen from './components/LoadingScreen'
import CartDrawer from './components/CartDrawer'
import SupabaseConfigWarning from './components/SupabaseConfigWarning'

// Public & Customer Pages
const Shop = lazy(() => import('./pages/Shop'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Account = lazy(() => import('./pages/Account'))
const OrdersPage = lazy(() => import('./pages/Orders'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))

// Dedicated Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Inventory = lazy(() => import('./pages/admin/Inventory'))
const Expenses = lazy(() => import('./pages/admin/Expenses'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))

function App() {
  return (
    <Router>
      <AuthProvider>
        <SupabaseConfigWarning />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<Shop />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/shop" element={<Shop />} />
            
            {/* Customer Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Protected Routes */}
            <Route
              path="/account"
              element={
                <CustomerGuard>
                  <Account />
                </CustomerGuard>
              }
            />
            <Route
              path="/orders"
              element={
                <CustomerGuard>
                  <OrdersPage />
                </CustomerGuard>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerGuard>
                  <CheckoutPage />
                </CustomerGuard>
              }
            />

            {/* Admin Authentication & Dedicated Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminDashboard />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminGuard>
                  <Inventory />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/expenses"
              element={
                <AdminGuard>
                  <Expenses />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminGuard>
                  <Analytics />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminGuard>
                  <AdminOrders />
                </AdminGuard>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
        <CartDrawer />
      </AuthProvider>
    </Router>
  )
}

export default App
