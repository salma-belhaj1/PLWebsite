import { Router } from 'express';
import { getAllProducts, getProductById, getCategories } from '../controllers/productController.js';

const productsRouter = Router();

// GET /api/products - Get all products with optional filtering
productsRouter.get('/', getAllProducts);

// GET /api/products/categories - Get all categories
productsRouter.get('/categories', getCategories);

// GET /api/products/:id - Get product by ID
productsRouter.get('/:id', getProductById);

// TODO: Admin routes
// POST /api/products - Create product (admin only)
// PUT /api/products/:id - Update product (admin only)
// DELETE /api/products/:id - Delete product (admin only)

export default productsRouter;
