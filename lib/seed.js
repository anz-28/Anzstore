const { getDb, createProduct, getAdminByUsername, createAdminUser } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...');
  
  const db = getDb();

  // Create admin user
  const existingAdmin = getAdminByUsername('admin');
  if (!existingAdmin) {
    const hash = await bcrypt.hash('admin123', 10);
    createAdminUser('admin', hash);
    console.log('✅ Admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Check if products exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const products = [
      {
        name: 'Starter Website Package',
        description: 'One-page conversion-focused website with mobile optimization, contact form, and basic on-page SEO. Ideal for solo founders and local businesses.',
        price: 399.00,
        image: '',
        category: 'web-design',
        stock: 12,
        featured: true,
      },
      {
        name: 'Business Website Build',
        description: 'Multi-page business site with custom sections, CMS-backed content editing, performance tuning, and analytics setup.',
        price: 1299.00,
        image: '',
        category: 'web-development',
        stock: 8,
        featured: true,
      },
      {
        name: 'E-commerce Store Setup',
        description: 'Complete online store setup including product catalog, checkout, payment integration, shipping rules, and transactional emails.',
        price: 1899.00,
        image: '',
        category: 'ecommerce',
        stock: 6,
        featured: true,
      },
      {
        name: 'Landing Page Sprint',
        description: 'Fast 3-day landing page build for launches and ads, including A/B-ready sections and speed-first implementation.',
        price: 549.00,
        image: '',
        category: 'growth',
        stock: 10,
        featured: false,
      },
      {
        name: 'Website Redesign Service',
        description: 'UX and UI refresh for outdated websites with modern visual system, improved content hierarchy, and responsive layouts.',
        price: 1499.00,
        image: '',
        category: 'web-design',
        stock: 7,
        featured: true,
      },
      {
        name: 'Technical SEO Fix Pack',
        description: 'Hands-on fixes for Core Web Vitals, crawl issues, indexing, metadata, and structured data to improve search visibility.',
        price: 799.00,
        image: '',
        category: 'seo',
        stock: 9,
        featured: false,
      },
      {
        name: 'Website Care Plan (Monthly)',
        description: 'Ongoing maintenance with updates, uptime monitoring, backups, security checks, and priority support each month.',
        price: 199.00,
        image: '',
        category: 'maintenance',
        stock: 25,
        featured: true,
      },
      {
        name: 'Performance Optimization Audit',
        description: 'Deep technical audit with actionable fixes for page speed, rendering bottlenecks, bundle size, and perceived UX performance.',
        price: 649.00,
        image: '',
        category: 'optimization',
        stock: 11,
        featured: false,
      },
    ];

    for (const product of products) {
      createProduct(product);
    }
    console.log(`✅ Created ${products.length} sample products`);

    // Create some sample orders
    const allProducts = db.prepare('SELECT * FROM products').all();
    const { v4: uuidv4 } = require('uuid');
    
    const sampleOrders = [
      { customer_name: 'Alex Chen', customer_email: 'alex@example.com', status: 'delivered', daysAgo: 2 },
      { customer_name: 'Jordan Smith', customer_email: 'jordan@example.com', status: 'shipped', daysAgo: 1 },
      { customer_name: 'Sam Wilson', customer_email: 'sam@example.com', status: 'processing', daysAgo: 0 },
      { customer_name: 'Casey Brown', customer_email: 'casey@example.com', status: 'delivered', daysAgo: 5 },
      { customer_name: 'Riley Johnson', customer_email: 'riley@example.com', status: 'delivered', daysAgo: 7 },
      { customer_name: 'Morgan Lee', customer_email: 'morgan@example.com', status: 'cancelled', daysAgo: 3 },
      { customer_name: 'Taylor Davis', customer_email: 'taylor@example.com', status: 'delivered', daysAgo: 10 },
      { customer_name: 'Drew Martinez', customer_email: 'drew@example.com', status: 'pending', daysAgo: 0 },
    ];

    for (const sampleOrder of sampleOrders) {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let total = 0;
      
      for (let i = 0; i < numItems; i++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        items.push({
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          price_at_time: product.price,
        });
        total += product.price * qty;
      }

      const orderId = uuidv4();
      db.prepare(`
        INSERT INTO orders (id, customer_name, customer_email, total, status, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-${sampleOrder.daysAgo} days'))
      `).run(orderId, sampleOrder.customer_name, sampleOrder.customer_email, Math.round(total * 100) / 100, sampleOrder.status);

      for (const item of items) {
        db.prepare(`
          INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price_at_time)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), orderId, item.product_id, item.product_name, item.quantity, item.price_at_time);
      }
    }
    console.log(`✅ Created ${sampleOrders.length} sample orders`);
  } else {
    console.log('ℹ️  Products already exist, skipping seed');
  }

  console.log('🎉 Seed complete!');
}

seed().catch(console.error);
