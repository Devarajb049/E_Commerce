const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seedUsers() {
  console.log('🔄 Checking and initializing Users table in MySQL...');

  try {
    // 1. Ensure Users table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Hash demo passwords securely
    const adminPasswordHash = await bcrypt.hash('ClickCart@123', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    // 3. Idempotently insert/update Demo Admin account
    const [adminResult] = await db.query(
      `INSERT INTO Users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role = 'admin'`,
      ['ClickCart Admin', 'admin@clickcart.com', adminPasswordHash]
    );

    // 4. Idempotently insert/update Demo Customer account
    const [customerResult] = await db.query(
      `INSERT INTO Users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'customer')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role = 'customer'`,
      ['Demo Customer', 'customer@clickcart.com', customerPasswordHash]
    );

    console.log('✅ Demo accounts verified & seeded successfully:');
    console.log('   - Admin:    admin@clickcart.com (Role: admin)');
    console.log('   - Customer: customer@clickcart.com (Role: customer)');
    return true;
  } catch (error) {
    console.error('❌ Error during users seeding:', error.message);
    throw error;
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
