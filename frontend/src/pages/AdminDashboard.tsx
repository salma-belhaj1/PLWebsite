import Header from '../components/Header'
import Footer from '../components/Footer'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-pl-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-5xl font-stayvibes text-pl-pink mb-8">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-pl-pink to-pl-pink/80 text-pl-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-stayvibes mb-2">Total Sales</h3>
            <p className="text-4xl font-bold">$0.00</p>
          </div>
          <div className="bg-gradient-to-br from-pl-red to-pl-red/80 text-pl-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-stayvibes mb-2">Total Orders</h3>
            <p className="text-4xl font-bold">0</p>
          </div>
          <div className="bg-gradient-to-br from-pl-black to-pl-black/80 text-pl-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-stayvibes mb-2">Total Products</h3>
            <p className="text-4xl font-bold">0</p>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-stayvibes text-pl-pink mb-6">Inventory Management</h3>
          <p className="font-century text-gray-600">Coming soon...</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
