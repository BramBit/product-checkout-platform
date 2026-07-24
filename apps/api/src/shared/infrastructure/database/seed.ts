import { Pool } from 'pg';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required to run seed script.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const products = [
    {
      name: 'MacBook Pro 16 M3 Max',
      description: 'Supercharged for pros with 36GB RAM and 1TB SSD',
      price_in_cents: 1499900000, // $14,999,000 COP
      stock_quantity: 10,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    },
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'Titanium design with A17 Pro chip and 48MP camera system',
      price_in_cents: 649900000, // $6,499,000 COP
      stock_quantity: 15,
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Industry leading noise canceling wireless headphones',
      price_in_cents: 349900000, // $3,499,000 COP
      stock_quantity: 20,
      image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb',
    },
    {
      name: 'Dell XPS 15 OLED',
      description: '15.6 inch 3.5K OLED Touch Display with Intel Core i9',
      price_in_cents: 989900000, // $9,899,000 COP
      stock_quantity: 8,
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
    },
  ];

  try {
    console.log('Starting seed process...');
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, description, price_in_cents, stock_quantity, image_url)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE name = $1
         )`,
        [
          product.name,
          product.description,
          product.price_in_cents,
          product.stock_quantity,
          product.image_url,
        ],
      );
    }
    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
