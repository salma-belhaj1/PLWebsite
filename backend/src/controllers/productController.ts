import { Request, Response } from 'express';
import { pool } from '../config/database.js';

export async function getAllProducts(req: Request, res: Response) {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.status,
        c.name as category,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category) {
      query += ` AND c.name = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      result.rows.map(async (product) => {
        const variantResult = await pool.query(
          'SELECT variant_type, variant_value, stock_quantity FROM product_variants WHERE product_id = $1',
          [product.id]
        );
        return {
          ...product,
          variants: variantResult.rows,
        };
      })
    );

    res.json({
      data: productsWithVariants,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.status,
        c.name as category,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];

    // Get variants
    const variantResult = await pool.query(
      'SELECT variant_type, variant_value, stock_quantity FROM product_variants WHERE product_id = $1',
      [id]
    );

    res.json({
      ...product,
      variants: variantResult.rows,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT id, name, description FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
