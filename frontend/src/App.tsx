import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

import { AuthProvider } from './context/AuthContext'
import { AdminGuard } from './guards/AdminGuard'

import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import Inventory from './pages/admin/Inventory'
import Expenses from './pages/admin/Expenses'
import Analytics from './pages/admin/Analytics'
import Customers from './pages/admin/Customers'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/inventory" element={<AdminGuard><Inventory /></AdminGuard>} />
          <Route path="/admin/expenses" element={<AdminGuard><Expenses /></AdminGuard>} />
          <Route path="/admin/analytics" element={<AdminGuard><Analytics /></AdminGuard>} />
          <Route path="/admin/customers" element={<AdminGuard><Customers /></AdminGuard>} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App
