const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(process.cwd(), 'data', 'store.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  const database = db;

  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT DEFAULT 'general',
      stock INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_address TEXT,
      customer_phone TEXT,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      stripe_payment_intent TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Product operations
function getAllProducts(filters = {}) {
  const database = getDb();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (filters.category && filters.category !== 'all') {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.featured) {
    query += ' AND featured = 1';
  }
  if (filters.search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY created_at DESC';
  return database.prepare(query).all(...params);
}

function getProductById(id) {
  const database = getDb();
  return database.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function createProduct(product) {
  const database = getDb();
  const id = uuidv4();
  database.prepare(`
    INSERT INTO products (id, name, description, price, image, category, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, product.name, product.description, product.price, product.image || null, product.category || 'general', product.stock || 0, product.featured ? 1 : 0);
  return getProductById(id);
}

function updateProduct(id, updates) {
  const database = getDb();
  const fields = [];
  const params = [];

  if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
  if (updates.price !== undefined) { fields.push('price = ?'); params.push(updates.price); }
  if (updates.image !== undefined) { fields.push('image = ?'); params.push(updates.image); }
  if (updates.category !== undefined) { fields.push('category = ?'); params.push(updates.category); }
  if (updates.stock !== undefined) { fields.push('stock = ?'); params.push(updates.stock); }
  if (updates.featured !== undefined) { fields.push('featured = ?'); params.push(updates.featured ? 1 : 0); }

  fields.push("updated_at = datetime('now')");
  params.push(id);

  database.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  return getProductById(id);
}

function deleteProduct(id) {
  const database = getDb();
  return database.prepare('DELETE FROM products WHERE id = ?').run(id);
}

// Order operations
function getAllOrders(filters = {}) {
  const database = getDb();
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (filters.status && filters.status !== 'all') {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.email) {
    query += ' AND customer_email = ?';
    params.push(filters.email);
  }

  query += ' ORDER BY created_at DESC';
  return database.prepare(query).all(...params);
}

function getOrderById(id) {
  const database = getDb();
  const order = database.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (order) {
    order.items = database.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  }
  return order;
}

function createOrder(order) {
  const database = getDb();
  const id = uuidv4();
  
  const insertOrder = database.prepare(`
    INSERT INTO orders (id, customer_name, customer_email, customer_address, customer_phone, total, status, stripe_session_id, stripe_payment_intent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = database.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price_at_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    insertOrder.run(id, order.customer_name, order.customer_email, order.customer_address || '', order.customer_phone || '', order.total, order.status || 'pending', order.stripe_session_id || null, order.stripe_payment_intent || null);
    
    if (order.items) {
      for (const item of order.items) {
        insertItem.run(uuidv4(), id, item.product_id, item.product_name, item.quantity, item.price_at_time);
        database.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(item.quantity, item.product_id, item.quantity);
      }
    }
  });

  transaction();
  return getOrderById(id);
}

function updateOrderStatus(id, status) {
  const database = getDb();
  database.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
  return getOrderById(id);
}

function cancelOrder(id) {
  const database = getDb();
  const order = getOrderById(id);
  if (!order) return null;

  const transaction = database.transaction(() => {
    database.prepare("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(id);
    // Restore stock
    if (order.items) {
      for (const item of order.items) {
        database.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
      }
    }
  });

  transaction();
  return getOrderById(id);
}

// Analytics
function getAnalytics(days = 30) {
  const database = getDb();
  
  const totalRevenue = database.prepare(`
    SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-${days} days')
  `).get();

  const totalOrders = database.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE created_at >= datetime('now', '-${days} days')
  `).get();

  const completedOrders = database.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status = 'delivered' AND created_at >= datetime('now', '-${days} days')
  `).get();

  const cancelledOrders = database.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled' AND created_at >= datetime('now', '-${days} days')
  `).get();

  const revenueByDay = database.prepare(`
    SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
    FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-${days} days')
    GROUP BY DATE(created_at) ORDER BY date
  `).all();

  const topProducts = database.prepare(`
    SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price_at_time) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled' AND o.created_at >= datetime('now', '-${days} days')
    GROUP BY oi.product_id ORDER BY total_sold DESC LIMIT 5
  `).all();

  const categoryBreakdown = database.prepare(`
    SELECT p.category, COUNT(DISTINCT o.id) as orders, SUM(oi.quantity * oi.price_at_time) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status != 'cancelled' AND o.created_at >= datetime('now', '-${days} days')
    GROUP BY p.category ORDER BY revenue DESC
  `).all();

  const totalProducts = database.prepare('SELECT COUNT(*) as count FROM products').get();
  const lowStock = database.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= 5 AND stock > 0').get();
  const outOfStock = database.prepare('SELECT COUNT(*) as count FROM products WHERE stock = 0').get();

  return {
    revenue: totalRevenue.revenue,
    totalOrders: totalOrders.count,
    completedOrders: completedOrders.count,
    cancelledOrders: cancelledOrders.count,
    avgOrderValue: totalOrders.count > 0 ? totalRevenue.revenue / totalOrders.count : 0,
    revenueByDay,
    topProducts,
    categoryBreakdown,
    totalProducts: totalProducts.count,
    lowStock: lowStock.count,
    outOfStock: outOfStock.count,
  };
}

// Admin user operations
function getAdminByUsername(username) {
  const database = getDb();
  return database.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

function createAdminUser(username, passwordHash) {
  const database = getDb();
  const id = uuidv4();
  database.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, passwordHash);
  return { id, username };
}

function getCategories() {
  const database = getDb();
  return database.prepare('SELECT DISTINCT category FROM products ORDER BY category').all().map(r => r.category);
}

module.exports = {
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
