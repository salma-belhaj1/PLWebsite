import { pool } from '../config/database.js';

interface Product {
  name: string;
  description: string;
  category: string;
  price: number;
  status: string;
  variants?: { type: string; value: string; quantity: number }[];
}

const categories = ['Hair', 'Face', 'Hand Accessories', 'Satin Pillows', 'Notebooks', 'Gifts', 'Packaging'];

const products: Record<string, Product[]> = {
  Hair: [
    {
      name: 'Hair Clip - Classic',
      description: 'Beautiful hair clip available in multiple colors',
      category: 'Hair',
      price: 0.75,
      status: 'available',
      variants: [
        { type: 'color', value: 'Orange', quantity: 10 },
        { type: 'color', value: 'Jaune', quantity: 8 },
        { type: 'color', value: 'Blanc', quantity: 12 },
      ],
    },
  ],
  Face: [
    {
      name: 'Face Mask - Hydrating',
      description: 'Premium hydrating face mask for all skin types',
      category: 'Face',
      price: 15.99,
      status: 'available',
      variants: [
        { type: 'type', value: 'Gel', quantity: 20 },
        { type: 'type', value: 'Cream', quantity: 15 },
      ],
    },
  ],
  'Hand Accessories': [
    {
      name: 'Hand Cream',
      description: 'Nourishing hand cream with natural ingredients',
      category: 'Hand Accessories',
      price: 12.99,
      status: 'available',
      variants: [
        { type: 'scent', value: 'Lavender', quantity: 25 },
        { type: 'scent', value: 'Rose', quantity: 20 },
      ],
    },
  ],
  'Satin Pillows': [
    {
      name: 'Satin Pillowcase - Queen',
      description: 'Luxurious satin pillowcase for hair and skin care',
      category: 'Satin Pillows',
      price: 24.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Blanc', quantity: 10 },
        { type: 'color', value: 'Rose', quantity: 8 },
        { type: 'color', value: 'Noir', quantity: 6 },
      ],
    },
  ],
  Notebooks: [
    {
      name: 'Journal - Hardcover',
      description: 'Premium hardcover journal for daily journaling',
      category: 'Notebooks',
      price: 19.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Bleu', quantity: 15 },
        { type: 'color', value: 'Rose', quantity: 12 },
        { type: 'pages', value: '80 pages', quantity: 10 },
      ],
    },
    {
      name: 'Notebook - Ruled',
      description: 'Eco-friendly ruled notebook',
      category: 'Notebooks',
      price: 12.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Noir', quantity: 20 },
        { type: 'pages', value: '50 pages', quantity: 18 },
      ],
    },
  ],
  Gifts: [
    {
      name: 'Plushie - Peace Dove',
      description: 'Adorable peace dove plushie toy',
      category: 'Gifts',
      price: 29.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Rose', quantity: 10 },
        { type: 'color', value: 'Blanc', quantity: 8 },
        { type: 'color', value: 'Orange', quantity: 6 },
      ],
    },
    {
      name: 'Keychain - Love Heart',
      description: 'Cute love heart keychain',
      category: 'Gifts',
      price: 9.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Bleu', quantity: 25 },
        { type: 'color', value: 'Rose', quantity: 30 },
      ],
    },
    {
      name: 'Socks - Cozy',
      description: 'Comfortable and cozy socks',
      category: 'Gifts',
      price: 7.99,
      status: 'available',
      variants: [
        { type: 'color', value: 'Noir', quantity: 40 },
        { type: 'color', value: 'Blanc', quantity: 35 },
      ],
    },
  ],
  Packaging: [
    {
      name: 'Packaging - Small Box',
      description: 'Eco-friendly small cardboard box',
      category: 'Packaging',
      price: 0.76,
      status: 'available',
      variants: [
        { type: 'size', value: 'S', quantity: 100 },
      ],
    },
    {
      name: 'Packaging - Large Box',
      description: 'Eco-friendly large cardboard box',
      category: 'Packaging',
      price: 1.16,
      status: 'available',
      variants: [
        { type: 'size', value: 'L', quantity: 75 },
      ],
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Seed categories
    console.log('📂 Inserting categories...');
    for (const category of categories) {
      await pool.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [category]
      );
    }

    // Seed products
    console.log('📦 Inserting products...');
    for (const [categoryName, categoryProducts] of Object.entries(products)) {
      // Get category ID
      const categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [
        categoryName,
      ]);

      if (categoryResult.rows.length === 0) {
        console.warn(`⚠️ Category not found: ${categoryName}`);
        continue;
      }

      const categoryId = categoryResult.rows[0].id;

      // Insert products
      for (const product of categoryProducts) {
        const productResult = await pool.query(
          `INSERT INTO products (name, description, category_id, price, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [product.name, product.description, categoryId, product.price, product.status]
        );

        const productId = productResult.rows[0].id;

        // Insert variants
        if (product.variants) {
          for (const variant of product.variants) {
            await pool.query(
              `INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
               VALUES ($1, $2, $3, $4)`,
              [productId, variant.type, variant.value, variant.quantity]
            );
          }
        }
      }
    }

    console.log('✅ Database seed completed successfully!');
    console.log(`📊 Inserted ${categories.length} categories`);
    const allProducts = Object.values(products).flat();
    console.log(`📦 Inserted ${allProducts.length} products`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
