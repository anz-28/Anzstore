const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

let pool;

function initPool() {
  if (!pool) {
    console.log('[DB] Initializing pool...');
    console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
    
    const useSsl = process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'));
    const connectionString = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=require(?![a-zA-Z0-9])/g, '').replace(/\?$/, '');
    
    console.log('[DB] Using SSL:', useSsl);
    console.log('[DB] Connection string length:', connectionString.length);
    if (connectionString.includes('supabase')) {
      console.log('[DB] Connected to Supabase');
    }
    
    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });
    
    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error:', err.message);
    });
    
    console.log('[DB] Pool created successfully');
  }
  return pool;
}

async function getDb() {
  const pool = initPool();
  return pool;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeProduct(row) {
  if (!row) return null;
  return {
    ...row,
    price: toNumber(row.price),
    stock: row.stock === null || row.stock === undefined ? 0 : Number(row.stock),
    featured: Boolean(row.featured),
  };
}

function normalizeOrder(row) {
  if (!row) return null;
  return {
    ...row,
    total: toNumber(row.total),
    items: row.items
      ? row.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          price_at_time: toNumber(item.price_at_time),
        }))
      : undefined,
  };
}

async function initTables() {
  const pool = initPool();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT,
        category TEXT DEFAULT 'general',
        stock INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_address TEXT,
        customer_phone TEXT,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        stripe_session_id TEXT,
        stripe_payment_intent TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        product_name TEXT,
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    `);
  } finally {
    client.release();
  }
}

// Product operations
async function getAllProducts(filters = {}) {
  const pool = initPool();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  let paramCounter = 1;

  if (filters.category && filters.category !== 'all') {
    query += ` AND category = $${paramCounter++}`;
    params.push(filters.category);
  }
  if (filters.featured) {
    query += ` AND featured = true`;
  }
  if (filters.search) {
    query += ` AND (name ILIKE $${paramCounter++} OR description ILIKE $${paramCounter++})`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY created_at DESC';
  console.log('[getAllProducts] Executing query:', query.substring(0, 100) + '...', 'with params:', params.length);
  const result = await pool.query(query, params);
  console.log('[getAllProducts] Query returned', result.rows.length, 'rows');
  return result.rows.map(normalizeProduct);
}

async function getProductById(id) {
  const pool = initPool();
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return normalizeProduct(result.rows[0] || null);
}

async function createProduct(product) {
  const pool = initPool();
  const id = uuidv4();
  await pool.query(
    `INSERT INTO products (id, name, description, price, image, category, stock, featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, product.name, product.description, product.price, product.image || null, product.category || 'general', product.stock || 0, product.featured ? true : false]
  );
  return getProductById(id);
}

async function updateProduct(id, updates) {
  const pool = initPool();
  const fields = [];
  const params = [];
  let paramCounter = 1;

  if (updates.name !== undefined) { fields.push(`name = $${paramCounter++}`); params.push(updates.name); }
  if (updates.description !== undefined) { fields.push(`description = $${paramCounter++}`); params.push(updates.description); }
  if (updates.price !== undefined) { fields.push(`price = $${paramCounter++}`); params.push(updates.price); }
  if (updates.image !== undefined) { fields.push(`image = $${paramCounter++}`); params.push(updates.image); }
  if (updates.category !== undefined) { fields.push(`category = $${paramCounter++}`); params.push(updates.category); }
  if (updates.stock !== undefined) { fields.push(`stock = $${paramCounter++}`); params.push(updates.stock); }
  if (updates.featured !== undefined) { fields.push(`featured = $${paramCounter++}`); params.push(updates.featured ? true : false); }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCounter}`, params);
  return getProductById(id);
}

async function deleteProduct(id) {
  const pool = initPool();
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

// Order operations
async function getAllOrders(filters = {}) {
  const pool = initPool();
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  let paramCounter = 1;

  if (filters.status && filters.status !== 'all') {
    query += ` AND status = $${paramCounter++}`;
    params.push(filters.status);
  }
  if (filters.email) {
    query += ` AND customer_email = $${paramCounter++}`;
    params.push(filters.email);
  }

  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  return result.rows.map(normalizeOrder);
}

async function getOrderById(id) {
  const pool = initPool();
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
  const order = orderResult.rows[0];
  
  if (order) {
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    order.items = itemsResult.rows.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      price_at_time: toNumber(item.price_at_time),
    }));
  }
  return normalizeOrder(order);
}

async function createOrder(order) {
  const pool = initPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const id = uuidv4();

    await client.query(
      `INSERT INTO orders (id, customer_name, customer_email, customer_address, customer_phone, total, status, stripe_session_id, stripe_payment_intent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, order.customer_name, order.customer_email, order.customer_address || '', order.customer_phone || '', order.total, order.status || 'pending', order.stripe_session_id || null, order.stripe_payment_intent || null]
    );

    if (order.items) {
      for (const item of order.items) {
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price_at_time)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), id, item.product_id, item.product_name, item.quantity, item.price_at_time]
        );
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query('COMMIT');
    return getOrderById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateOrderStatus(id, status) {
  const pool = initPool();
  await pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  return getOrderById(id);
}

async function cancelOrder(id) {
  const pool = initPool();
  const client = await pool.connect();

  try {
    const order = await getOrderById(id);
    if (!order) return null;

    await client.query('BEGIN');
    await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['cancelled', id]);

    if (order.items) {
      for (const item of order.items) {
        await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
      }
    }

    await client.query('COMMIT');
    return getOrderById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Analytics
async function getAnalytics(days = 30) {
  const pool = initPool();

  const totalRevenue = await pool.query(
    `SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '${days} days'`
  );

  const totalOrders = await pool.query(
    `SELECT COUNT(*) as count FROM orders WHERE created_at >= NOW() - INTERVAL '${days} days'`
  );

  const completedOrders = await pool.query(
    `SELECT COUNT(*) as count FROM orders WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '${days} days'`
  );

  const cancelledOrders = await pool.query(
    `SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled' AND created_at >= NOW() - INTERVAL '${days} days'`
  );

  const revenueByDay = await pool.query(
    `SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
     FROM orders WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(created_at) ORDER BY date`
  );

  const topProducts = await pool.query(
    `SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price_at_time) as revenue
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status != 'cancelled' AND o.created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY oi.product_id, oi.product_name ORDER BY total_sold DESC LIMIT 5`
  );

  const categoryBreakdown = await pool.query(
    `SELECT p.category, COUNT(DISTINCT o.id) as orders, SUM(oi.quantity * oi.price_at_time) as revenue
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN products p ON oi.product_id = p.id
     WHERE o.status != 'cancelled' AND o.created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY p.category ORDER BY revenue DESC`
  );

  const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');
  const lowStock = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock <= 5 AND stock > 0');
  const outOfStock = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock = 0');

  return {
    revenue: toNumber(totalRevenue.rows[0].revenue),
    totalOrders: Number(totalOrders.rows[0].count),
    completedOrders: Number(completedOrders.rows[0].count),
    cancelledOrders: Number(cancelledOrders.rows[0].count),
    avgOrderValue: Number(totalOrders.rows[0].count) > 0 ? toNumber(totalRevenue.rows[0].revenue) / Number(totalOrders.rows[0].count) : 0,
    revenueByDay: revenueByDay.rows.map(row => ({ ...row, revenue: toNumber(row.revenue), orders: Number(row.orders) })),
    topProducts: topProducts.rows.map(row => ({ ...row, total_sold: Number(row.total_sold), revenue: toNumber(row.revenue) })),
    categoryBreakdown: categoryBreakdown.rows.map(row => ({ ...row, orders: Number(row.orders), revenue: toNumber(row.revenue) })),
    totalProducts: Number(totalProducts.rows[0].count),
    lowStock: Number(lowStock.rows[0].count),
    outOfStock: Number(outOfStock.rows[0].count),
  };
}

// Admin user operations
async function getAdminByUsername(username) {
  const pool = initPool();
  const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

async function createAdminUser(username, passwordHash) {
  const pool = initPool();
  const id = uuidv4();
  await pool.query('INSERT INTO admin_users (id, username, password_hash) VALUES ($1, $2, $3)', [id, username, passwordHash]);
  return { id, username };
}

async function getCategories() {
  const pool = initPool();
  const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
  return result.rows.map(r => r.category);
}

module.exports = {
  initPool,
  initTables,
  getDb,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getAnalytics,
  getAdminByUsername,
  createAdminUser,
  getCategories,
};
