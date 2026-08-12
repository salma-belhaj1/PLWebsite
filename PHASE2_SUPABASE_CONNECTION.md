# Phase 2: Supabase Service Layer Connection

## Overview

Phase 2 replaces the old Express backend with direct Supabase integration. All data operations now go directly to Supabase through a clean, organized service layer.

## What Changed

### ✅ New Service Layer Structure
```
frontend/src/services/supabase/
├── index.ts              # Exports all services
├── products.ts           # Product CRUD + queries
├── auth.ts              # Authentication operations
├── cart.ts              # Shopping cart persistence
├── orders.ts            # Order management
├── expenses.ts          # Business expense tracking
└── inventory.ts         # Stock + inventory management
```

### ✅ Updated Main API Service
- `frontend/src/services/api.ts` now wraps Supabase services
- Backward compatible with existing components
- No component changes needed!

### ✅ Architecture
```
Components
    ↓
Old: api.ts → Express Backend → PostgreSQL
New: api.ts → Supabase Services → Supabase PostgreSQL
```

## Service Layer Documentation

### Products Service (`services/supabase/products.ts`)

```typescript
// Get all products with filters
const products = await productsService.getProducts({
  categoryId: 2,
  search: 'hair',
  featured: true,
});

// Get single product with variants
const product = await productsService.getProduct(1);

// Get all categories
const categories = await productsService.getCategories();

// Create product (admin)
const newProduct = await productsService.createProduct({
  name: 'New Product',
  category_id: 1,
  price: 25.00,
  cost_price: 12.00,
  description: '...',
  status: 'available',
  is_active: true,
  is_featured: false,
  sku: 'SKU-001',
  image_url: null,
  profit: 13.00,
});

// Update product
await productsService.updateProduct(1, { price: 30.00 });

// Delete product
await productsService.deleteProduct(1);

// Get product stock
const stock = productsService.getProductStock(variants);
const inStock = productsService.isProductInStock(variants);
```

### Auth Service (`services/supabase/auth.ts`)

```typescript
// Sign up
await authService.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  full_name: 'John Doe',
});

// Sign in
const session = await authService.signIn({
  email: 'user@example.com',
  password: 'secure_password',
});

// Get current user profile
const profile = await authService.getCurrentUserProfile();

// Update profile
await authService.updateUserProfile(userId, {
  phone: '+216 XXX XXX XXX',
  address: '...',
  city: 'Tunis',
});

// Check if user is admin
const isAdmin = await authService.isUserAdmin(userId);

// Sign out
await authService.signOut();
```

### Cart Service (`services/supabase/cart.ts`)

```typescript
// Get or create cart for user
const cart = await cartService.getOrCreateCart(userId);

// Get cart items with product details
const items = await cartService.getCartItems(cartId);

// Add item to cart
await cartService.addToCart(cartId, productId, variantId, quantity);

// Update item quantity
await cartService.updateCartItemQuantity(itemId, newQuantity);

// Remove from cart
await cartService.removeFromCart(itemId);

// Clear entire cart
await cartService.clearCart(cartId);

// Get cart total
const total = await cartService.getCartTotal(cartId);

// Get item count
const count = await cartService.getCartCount(cartId);
```

### Orders Service (`services/supabase/orders.ts`)

```typescript
// Create order from cart
const order = await ordersService.createOrder({
  user_id: userId,
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+216 ...',
  shipping_address: '...',
  items: [
    { product_id: 1, variant_id: null, quantity: 2, price: 25.00 },
    { product_id: 2, variant_id: 5, quantity: 1, price: 50.00 },
  ],
  total_amount: 100.00,
});

// Get order details
const order = await ordersService.getOrder(orderId);

// Get user's orders
const orders = await ordersService.getUserOrders(userId);

// Get all orders (admin)
const allOrders = await ordersService.getAllOrders({
  status: 'pending',
  payment_status: 'paid',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});

// Update order status (admin)
await ordersService.updateOrderStatus(orderId, 'shipped');

// Update payment status (admin)
await ordersService.updatePaymentStatus(orderId, 'paid');

// Get order stats
const stats = await ordersService.getOrderStats();
```

### Expenses Service (`services/supabase/expenses.ts`)

```typescript
// Get all expenses
const expenses = await expensesService.getExpenses({
  category: 'packaging',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
});

// Get expenses by category
const packaging = await expensesService.getExpensesByCategory('packaging');

// Get unique categories
const categories = await expensesService.getExpenseCategories();

// Create expense
const expense = await expensesService.createExpense({
  category: 'packaging',
  description: 'Packaging boxes',
  amount: 50.00,
  quantity: 100,
  expense_date: '2026-01-15',
  status: 'active',
  notes: 'Large order',
});

// Update expense
await expensesService.updateExpense(expenseId, { amount: 60.00 });

// Archive expense (soft delete)
await expensesService.archiveExpense(expenseId);

// Get expense stats
const stats = await expensesService.getExpenseStats();
const monthlyStats = await expensesService.getMonthlyExpenses(2026, 1);
```

### Inventory Service (`services/supabase/inventory.ts`)

```typescript
// Get all inventory items
const inventory = await inventoryService.getInventory();

// Get inventory for specific product
const item = await inventoryService.getInventoryByProductId(productId);

// Get low stock items
const low = await inventoryService.getLowStockItems();

// Get out of stock items
const outOfStock = await inventoryService.getOutOfStockItems();

// Update stock quantity
await inventoryService.updateStockQuantity(productId, 100);

// Add to stock
await inventoryService.addStock(productId, 50);

// Remove from stock
await inventoryService.removeStock(productId, 10);

// Update reorder levels
await inventoryService.updateReorderLevels(productId, 20, 100);

// Get inventory value stats
const stats = await inventoryService.getInventoryValueStats();

// Search inventory
const results = await inventoryService.searchInventory('SKU-001');
```

## Using Services in Components

### Example: Shop Component (Already Updated)
```typescript
import { productService } from '../services/api';

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productService.getAllProducts({
        categoryId: 1,
        q: 'hair',
      });
      setProducts(data.data);
    };
    
    fetchProducts();
  }, []);
  
  // ...
}
```

### Example: Admin Product Form (New)
```typescript
import { productService } from '../services/api';

async function handleCreateProduct(formData) {
  try {
    const product = await productService.createProduct({
      name: formData.name,
      category_id: formData.categoryId,
      price: parseFloat(formData.price),
      cost_price: parseFloat(formData.costPrice),
      description: formData.description,
      status: 'available',
      is_active: true,
      sku: formData.sku,
      image_url: uploadedImageUrl,
      profit: formData.price - formData.costPrice,
    });
    
    toast.success('Product created');
  } catch (err) {
    toast.error(err.message);
  }
}
```

## Migration Checklist

- [x] Created 6 service modules
- [x] Implemented all CRUD operations
- [x] Updated api.ts wrapper
- [x] Maintained backward compatibility
- [x] Auth context already uses Supabase
- [ ] Run database migrations (Phase 1)
- [ ] Test all services
- [ ] Update remaining components (if needed)

## Error Handling

All services throw errors on failure. Use try/catch in components:

```typescript
try {
  const data = await productService.getAllProducts();
} catch (error) {
  console.error('Failed to fetch:', error);
  // Show user-friendly error
}
```

## What's NOT Changed

- Components don't need updates (backward compatible)
- Cart context still works for local state
- AuthContext already uses Supabase
- No new dependencies needed
- Same TypeScript types

## Next Steps

1. **Run Phase 1 Migrations** on Supabase (database setup)
2. **Test Services** - Try fetching products in browser console:
   ```typescript
   import { productService } from '@/services/api';
   const products = await productService.getAllProducts();
   console.log(products);
   ```
3. **Update remaining admin pages** to use new services
4. **Add image upload functionality** (Phase 3)
5. **Build product CRUD forms** (Phase 3)

## Important Notes

- All operations are real-time with Supabase
- No local Express backend needed anymore
- Costs remain the same (Supabase free tier can handle this)
- RLS (Row Level Security) can be configured later for multi-tenant apps
- Services are reusable across the app - no duplication

---

**Status**: Ready for Phase 1 Database Migration
