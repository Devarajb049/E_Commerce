const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedUsers() {
  console.log('🔄 Checking and initializing Users table...');

  try {
    if (db.isSqlite) {
      console.log('✅ SQLite fallback active with pre-seeded demo accounts:');
      console.log('   - Admin:    admin@clickcart.com (Role: admin)');
      console.log('   - Customer: customer@clickcart.com (Role: customer)');
      return true;
    }

    // Hash demo passwords securely (admin123 and password123)
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const customerPasswordHash = await bcrypt.hash('password123', 10);

    // Idempotently insert/update Demo Admin account in PostgreSQL
    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = 'admin'`,
      ['ClickCart Admin', 'admin@clickcart.com', adminPasswordHash]
    );

    // Idempotently insert/update Demo Customer account in PostgreSQL
    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = 'customer'`,
      ['Demo Customer', 'customer@clickcart.com', customerPasswordHash]
    );

    // Idempotently insert/update Customer B account in PostgreSQL for multi-customer testing
    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer')
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role = 'customer'`,
      ['Customer B', 'customer2@clickcart.com', customerPasswordHash]
    );

    console.log('✅ Demo accounts verified & seeded successfully:');
    console.log('   - Admin:      admin@clickcart.com (Role: admin)');
    console.log('   - Customer A: customer@clickcart.com (Role: customer)');
    console.log('   - Customer B: customer2@clickcart.com (Role: customer)');
    return true;
  } catch (error) {
    console.warn('⚠️ Non-blocking users seeding notice:', error.message);
    return false;
  }
}

// If executed directly via CLI (e.g. `npm run seed`)
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('🎉 Database user seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedUsers };
