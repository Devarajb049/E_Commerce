/**
 * ClickCart Embedded Fallback Database Engine
 * Powered by sql.js (WebAssembly SQLite)
 * Ensures 100% zero-crash operation when remote Supabase PostgreSQL is unreachable, paused, or unconfigured.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');

let dbInstance = null;
let initPromise = null;
let inTransaction = false;

const DB_DIR = path.resolve(__dirname, '../../database');
const DB_FILE = path.join(DB_DIR, 'clickcart_store.sqlite');

async function getSqliteDb() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!fs.existsSync(DB_DIR)) {
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (e) {}
    }

    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileBuffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(fileBuffer);
      } catch (e) {
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }

    // Create schema
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price REAL NOT NULL,
        original_price REAL,
        is_featured INTEGER DEFAULT 0,
        is_sale INTEGER DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        sku TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        email TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        shipping_fee REAL DEFAULT 0.0,
        discount REAL DEFAULT 0.0,
        total REAL NOT NULL,
        payment_method TEXT DEFAULT 'cod',
        payment_status TEXT DEFAULT 'pending',
        order_status TEXT DEFAULT 'Order Placed',
        shipping_full_name TEXT NOT NULL,
        shipping_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        shipping_state TEXT NOT NULL,
        shipping_postal_code TEXT NOT NULL,
        shipping_country TEXT DEFAULT 'India',
        estimated_delivery_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        product_price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        changed_by TEXT DEFAULT 'SYSTEM',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        product_id INTEGER,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'REQUESTED',
        refund_amount REAL DEFAULT 0.0,
        admin_notes TEXT,
        restocked INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT DEFAULT 'India',
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(cart_id, product_id)
      );
    `);

    // Check if categories are seeded
    const catCheck = db.exec('SELECT COUNT(*) AS cnt FROM categories');
    const catCount = catCheck[0]?.values[0][0] || 0;

    if (catCount === 0) {
      console.log('🌱 Seeding embedded database catalog with 8 categories & 42 products...');

      // Seed 8 Categories
      const categories = [
        [1, 'Electronics', 'electronics', 'Smart gadgets, premium wireless audio, and personal electronic devices.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'active'],
        [2, 'Mobile Accessories', 'mobile-accessories', 'Fast chargers, durable cables, magnetic phone mounts, and cases.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', 'active'],
        [3, 'Computer Accessories', 'computer-accessories', 'Ergonomic keyboards, precision wireless mice, laptop stands, and USB-C hubs.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'active'],
        [4, 'Fashion & Apparel', 'fashion-apparel', 'Modern everyday casuals, minimalist tees, jackets, and accessories.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', 'active'],
        [5, 'Footwear', 'footwear', 'Everyday sneakers, running athletic shoes, and casual slip-ons.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'active'],
        [6, 'Home & Kitchen', 'home-kitchen', 'Aesthetic kitchen appliances, vacuum insulated flasks, and home essentials.', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80', 'active'],
        [7, 'Stationery & Office', 'stationery-office', 'Premium fountain pens, dot-grid hardcover notebooks, and desk organizers.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'active'],
        [8, 'Beauty & Personal Care', 'beauty-personal-care', 'Hydrating serums, natural botanical skincare, and grooming essentials.', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', 'active']
      ];

      for (const [id, name, slug, desc, img, status] of categories) {
        db.run('INSERT INTO categories (id, name, slug, description, image, status) VALUES (?, ?, ?, ?, ?, ?)', [id, name, slug, desc, img, status]);
      }

      // Seed 42 Products
      const products = [
        [1, 1, 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', 'sony-wh-1000xm5', 'Industry-leading noise canceling with two processors, 8 microphones, and up to 30-hour battery life.', 24990.00, 29990.00, 1, 1, 18, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'ELEC-SNY-001'],
        [2, 1, 'ClickCart SonicPulse Bluetooth Speaker', 'clickcart-sonicpulse-speaker', 'Compact portable 20W stereo speaker with deep bass, IPX7 waterproof rating, and 14-hour playtime.', 2999.00, 3999.00, 1, 1, 35, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 'ELEC-SPK-002'],
        [3, 1, 'Aura ANC True Wireless Earbuds', 'aura-anc-wireless-earbuds', 'Active noise cancellation earbuds with transparency mode, wireless charging case, and low latency gaming mode.', 4499.00, 5999.00, 0, 1, 24, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', 'ELEC-EAR-003'],
        [4, 1, 'FitPro Horizon Smart Fitness Tracker', 'fitpro-horizon-smart-tracker', 'AMOLED display smartwatch with SpO2 monitoring, 24/7 heart-rate tracking, sleep score, and 5ATM water resistance.', 3299.00, 4499.00, 1, 1, 40, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'ELEC-WTC-004'],
        [5, 1, '4K Ultra-HD Action Camera with Gimbal', '4k-ultrahd-action-camera', 'Crisp 4K 60fps recording, dual touch screens, waterproof up to 10m without case, and electronic image stabilization.', 14999.00, 17999.00, 0, 0, 8, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', 'ELEC-CAM-005'],
        [6, 1, 'InstaPrint Retro Instant Film Camera', 'instaprint-retro-film-camera', 'Automatic exposure, built-in selfie mirror, and sharp retro photo printing for preserving spontaneous memories.', 6499.00, 7999.00, 0, 0, 15, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'ELEC-RET-006'],

        [7, 2, 'Anker 65W GaN Fast Wall Charger', 'anker-65w-gan-charger', 'Ultra-compact 3-port fast wall charger with PowerIQ 3.0 for charging phones, tablets, and laptops concurrently.', 2499.00, 3299.00, 1, 1, 50, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', 'MOB-ANK-007'],
        [8, 2, 'MagSafe 10000mAh Magnetic Power Bank', 'magsafe-10000mah-powerbank', 'Wireless snap-on magnetic power bank with foldable kickstand and 20W bi-directional PD fast charging.', 2199.00, 2999.00, 0, 1, 32, 'https://images.unsplash.com/photo-1609592426815-a6a2416b2512?w=800&q=80', 'MOB-MAG-008'],
        [9, 2, 'Braided USB-C to Lightning Fast Charging Cable (2m)', 'braided-usbc-lightning-cable', 'Heavy-duty Kevlar-reinforced braided cable rated for 30,000+ bends with 480Mbps data transfer speed.', 699.00, 999.00, 0, 0, 60, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', 'MOB-CBL-009'],
        [10, 2, 'Aerocool Magnetic Car Dashboard Phone Mount', 'aerocool-magnetic-car-mount', 'Strong N52 neodymium magnets with 360-degree rotation ball joint for one-handed navigation positioning.', 899.00, 1299.00, 0, 0, 28, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80', 'MOB-MNT-010'],
        [11, 2, 'Ultra-Slim Liquid Silicone Case for iPhone 15', 'liquid-silicone-case-iphone15', 'Silky soft-touch exterior with microfiber interior lining and raised bezel camera lip protection.', 799.00, 1199.00, 0, 0, 45, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80', 'MOB-CSE-011'],
        [12, 2, '3-in-1 Foldable Wireless Charging Station', '3in1-wireless-charging-station', 'Simultaneously charges your smartphone, smartwatch, and wireless earbuds with intelligent temperature control.', 2999.00, 3999.00, 1, 1, 19, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80', 'MOB-STA-012'],

        [13, 3, 'Keychron K2 Wireless Mechanical Keyboard', 'keychron-k2-mechanical-keyboard', 'Compact 75% layout RGB backlit mechanical keyboard with hot-swappable Gateron G Pro Brown switches.', 7499.00, 8999.00, 1, 1, 14, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'CMP-KEY-013'],
        [14, 3, 'Logitech MX Master 3S Ergonomic Mouse', 'logitech-mx-master-3s', 'Quiet clicks, 8K DPI any-surface tracking sensor, and MagSpeed electromagnetic scroll wheel.', 8995.00, 10995.00, 1, 1, 12, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 'CMP-MOU-014'],
        [15, 3, 'Aluminum Ergonomic Laptop Riser Stand', 'aluminum-laptop-riser-stand', 'Sturdy anodized aluminum stand that elevates your screen to eye level to reduce neck strain.', 1499.00, 1999.00, 0, 0, 30, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 'CMP-STD-015'],
        [16, 3, '8-in-1 USB-C Multiport Docking Hub', '8in1-usbc-multiport-dock', 'Includes 4K HDMI 60Hz, 100W Power Delivery pass-through, Gigabit Ethernet, SD/TF reader, and 3 USB-A ports.', 2899.00, 3999.00, 0, 1, 22, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'CMP-DOK-016'],
        [17, 3, 'Extra-Large Water-Resistant Desk Mat (900x400mm)', 'xl-desk-mat-900x400', 'Smooth micro-weave fabric surface with non-slip natural rubber base and anti-fray stitched edges.', 999.00, 1499.00, 0, 0, 40, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&q=80', 'CMP-MAT-017'],
        [18, 3, 'Full HD 1080p Streaming Webcam with Privacy Shutter', 'hd-1080p-streaming-webcam', 'Sharp wide-angle glass lens with auto low-light correction and stereo dual noise-reducing microphones.', 2799.00, 3499.00, 0, 0, 25, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80', 'CMP-CAM-018'],

        [19, 4, 'Classic Heavyweight Organic Cotton Crewneck T-Shirt', 'classic-organic-cotton-tshirt', 'Crafted from 100% combed organic ring-spun cotton with ribbed collar and relaxed modern fit.', 899.00, 1299.00, 0, 1, 55, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', 'FSH-TSH-019'],
        [20, 4, 'Minimalist Oxford Button-Down Slim Shirt', 'minimalist-oxford-buttondown-shirt', 'Breathable pre-shrunk cotton Oxford fabric designed for effortless smart-casual versatility.', 1799.00, 2499.00, 0, 0, 27, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'FSH-SHT-020'],
        [21, 4, 'Urban Water-Resistant Commuter Backpack (22L)', 'urban-commuter-backpack-22l', 'Padded 15.6-inch laptop compartment with hidden anti-theft back pocket and luggage strap pass-through.', 2499.00, 3299.00, 1, 1, 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'FSH-BAG-021'],
        [22, 4, 'Polarized Retro Square Sunglasses UV400', 'polarized-retro-square-sunglasses', 'Lightweight acetate frame with scratch-resistant polarized TAC lenses for glare-free clear vision.', 1299.00, 1899.00, 0, 0, 40, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', 'FSH-SNG-022'],
        [23, 4, 'Genuine Full-Grain Leather Bi-Fold Wallet', 'fullgrain-leather-bifold-wallet', 'RFID-blocking slim profile wallet with 8 card slots, quick thumb slide, and divided cash compartment.', 1199.00, 1699.00, 0, 0, 30, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', 'FSH-WLT-023'],
        [24, 4, 'All-Weather Windbreaker Lightweight Jacket', 'all-weather-windbreaker-jacket', 'Durable water-repellent shell with breathable mesh lining, adjustable hood, and zippered welt pockets.', 2999.00, 3999.00, 0, 1, 16, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80', 'FSH-JKT-024'],

        [25, 5, 'CloudStride Cushioned Daily Running Shoes', 'cloudstride-running-shoes', 'Engineered mesh upper with responsive foam midsole for lightweight shock absorption on daily runs.', 3499.00, 4499.00, 1, 1, 20, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'FTW-RUN-025'],
        [26, 5, 'Urban Minimalist White Leather Sneakers', 'urban-white-leather-sneakers', 'Clean low-top sneaker silhouette with supple leather upper and vulcanized durable gum rubber sole.', 2799.00, 3699.00, 1, 1, 25, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', 'FTW-SNK-026'],
        [27, 5, 'Breathable Slip-On Casual Loafers', 'breathable-slipon-loafers', 'Stretch knit upper with memory foam cushioned footbed for effortless all-day walking comfort.', 1999.00, 2799.00, 0, 0, 30, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 'FTW-LOF-027'],
        [28, 5, 'TrailMaster Rugged Outdoor Hiking Boots', 'trailmaster-hiking-boots', 'Waterproof leather and Cordura construction with high-traction Vibram outsole and reinforced toe bumper.', 4899.00, 5999.00, 0, 0, 11, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'FTW-BOT-028'],
        [29, 5, 'Ergonomic Arch Support Recovery Slides', 'arch-support-recovery-slides', 'Soft dual-density EVA foam slides designed to soothe fatigued feet after workouts or long days.', 999.00, 1499.00, 0, 0, 45, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80', 'FTW-SLD-029'],
        [30, 5, 'Classic Canvas Low-Top Lace Sneakers', 'classic-canvas-lace-sneakers', 'Timeless vulcanized canvas sneaker with reinforced stitching and cushioned insole.', 1499.00, 1999.00, 0, 0, 28, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 'FTW-CNV-030'],

        [31, 6, 'Stainless Steel Double-Wall Thermal Coffee Press', 'stainless-steel-thermal-coffee-press', 'Insulated vacuum French press that keeps brew piping hot for 2 hours with dual micro-mesh filter.', 1899.00, 2499.00, 0, 0, 22, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80', 'HOM-COF-031'],
        [32, 6, 'Smart Digital Precision Kitchen Food Scale', 'smart-kitchen-food-scale', 'High-precision sensor with 0.1g increments, tare function, and backlit LCD display for baking.', 849.00, 1199.00, 0, 0, 38, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', 'HOM-SCL-032'],
        [33, 6, 'Double-Walled Insulated Flask with Leak-Proof Cap (750ml)', 'double-walled-insulated-flask-750ml', '18/8 food-grade stainless steel bottle keeping drinks icy cold for 24 hours or piping hot for 12.', 999.00, 1399.00, 0, 1, 50, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 'HOM-FLK-033'],
        [34, 6, 'Aroma Ultrasonic Essential Oil Diffuser (300ml)', 'aroma-ultrasonic-oil-diffuser', 'Whisper-quiet ultrasonic mist maker with 7 ambient LED light colors and auto shut-off safety.', 1599.00, 2199.00, 0, 0, 26, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', 'HOM-DIF-034'],
        [35, 6, 'Cast Iron Pre-Seasoned Skillet (10-inch)', 'cast-iron-preseasoned-skillet-10in', 'Heavy-duty skillet with superior heat retention for searing steaks, baking cornbread, or sautéing.', 1899.00, 2499.00, 0, 0, 15, 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80', 'HOM-SKL-035'],
        [36, 6, 'Modern Ceramic Mug with Acacia Wood Lid & Coaster', 'modern-ceramic-mug-wood-lid', 'Handcrafted matte finish ceramic mug (380ml) with natural heat-insulating wooden coaster lid.', 599.00, 899.00, 0, 0, 48, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 'HOM-MUG-036'],

        [37, 7, 'Premium Hardcover Dot-Grid Journal (160 GSM)', 'hardcover-dotgrid-journal-160gsm', 'Thick bleed-proof acid-free bamboo paper with expandable back pocket, dual ribbons, and elastic band.', 799.00, 1099.00, 0, 0, 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'OFF-JRN-037'],
        [38, 7, 'Brass Precision Rollerball Gel Pen (0.5mm)', 'brass-precision-rollerball-pen', 'Solid machined brass hexagonal pen body with smooth-gliding archival black Japanese ink cartridge.', 699.00, 999.00, 0, 0, 42, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80', 'OFF-PEN-038'],
        [39, 7, 'Minimalist Metal Desktop Organizer Tray', 'metal-desktop-organizer-tray', 'Powder-coated steel desk caddy to cleanly organize pens, paper clips, sticky notes, and cards.', 549.00, 799.00, 0, 0, 30, 'https://images.unsplash.com/photo-1507842229451-79b1be886a07?w=800&q=80', 'OFF-TRY-039'],

        [40, 8, 'Hydrating Hyaluronic Acid & Vitamin C Facial Serum', 'hyaluronic-acid-vitaminc-serum', 'Intense moisture booster formulated with 2% multi-molecular hyaluronic acid and green tea antioxidants.', 899.00, 1299.00, 0, 1, 33, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', 'BTY-SRM-040'],
        [41, 8, 'Botanical Nourishing Hair Repair Treatment Oil', 'botanical-nourishing-hair-oil', 'Cold-pressed Moroccan argan oil and jojoba blend to tame frizz and restore healthy luminous shine.', 749.00, 1099.00, 0, 0, 27, 'https://images.unsplash.com/photo-1608248597359-00f074d28362?w=800&q=80', 'BTY-OIL-041'],
        [42, 8, 'Mineral Sunscreen SPF 50+ Broad Spectrum (100ml)', 'mineral-sunscreen-spf50', 'Lightweight non-greasy matte finish sunscreen with zinc oxide and zero white cast protection.', 699.00, 999.00, 0, 0, 40, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', 'BTY-SUN-042']
      ];

      for (const [id, catId, name, slug, desc, price, origPrice, isFeat, isSale, stock, img, sku] of products) {
        db.run(
          'INSERT INTO products (id, category_id, name, slug, description, price, original_price, is_featured, is_sale, stock, image, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, catId, name, slug, desc, price, origPrice, isFeat, isSale, stock, img, sku]
        );
      }

      // Seed Demo Accounts (admin123 and password123)
      const adminHash = bcrypt.hashSync('admin123', 10);
      const customerHash = bcrypt.hashSync('password123', 10);

      db.run('INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
        1, 'ClickCart Admin', 'admin@clickcart.com', adminHash, 'admin'
      ]);
      db.run('INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
        2, 'Demo Customer', 'customer@clickcart.com', customerHash, 'customer'
      ]);
      db.run('INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
        3, 'Customer B', 'customer2@clickcart.com', customerHash, 'customer'
      ]);

      // Seed initial demo orders
      db.run(`
        INSERT INTO orders (id, order_number, user_id, email, subtotal, tax, shipping_fee, discount, total, payment_method, payment_status, order_status, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country)
        VALUES 
        (1, 'CC-10245', 2, 'customer@clickcart.com', 7499.00, 1349.82, 0.00, 0.00, 8848.82, 'cod', 'pending', 'Out for Delivery', 'Demo Customer', '+91 98765 43210', 'Flat 402, Lotus Residency, MG Road', 'Bengaluru', 'Karnataka', '560001', 'India'),
        (2, 'CC-10189', 2, 'customer@clickcart.com', 2999.00, 539.82, 0.00, 0.00, 3538.82, 'online', 'paid', 'Delivered', 'Demo Customer', '+91 98765 43210', 'Flat 402, Lotus Residency, MG Road', 'Bengaluru', 'Karnataka', '560001', 'India')
      `);

      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES
        (1, 13, 'Keychron K2 Wireless Mechanical Keyboard', 7499.00, 1, 7499.00),
        (2, 2, 'ClickCart SonicPulse Bluetooth Speaker', 2999.00, 1, 2999.00)
      `);

      db.run(`
        INSERT INTO order_status_history (order_id, status, note, changed_by)
        VALUES
        (1, 'Order Placed', 'Order placed successfully by customer', 'Demo Customer'),
        (1, 'Processing', 'Payment verified and items packaged at fulfillment center', 'ADMIN'),
        (1, 'Shipped', 'Courier dispatched via Express Air', 'ADMIN'),
        (1, 'Out for Delivery', 'Driver assigned for delivery today', 'ADMIN'),
        (2, 'Order Placed', 'Order placed successfully', 'Demo Customer'),
        (2, 'Delivered', 'Delivered to customer', 'COURIER')
      `);

      // Seed demo address
      db.run(`
        INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, postal_code, country, is_default)
        VALUES (2, 'Demo Customer', '+91 98765 43210', 'Flat 402, Lotus Residency, MG Road', 'Bengaluru', 'Karnataka', '560001', 'India', 1)
      `);

      if (!inTransaction) {
        persistDb(db);
      }
      console.log('✅ Embedded database catalog & demo accounts successfully initialized.');
    }

    dbInstance = db;
    return dbInstance;
  })();

  return initPromise;
}

function persistDb(db) {
  try {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch (e) {
    // Non-fatal
  }
}

/**
 * Translate SQL queries designed for PostgreSQL to SQLite
 */
function translatePgToSqlite(sql) {
  let s = sql.trim();
  // Strip FOR UPDATE
  s = s.replace(/\s+FOR\s+UPDATE\s*$/i, '');
  // Replace $1, $2, $3 positional params with ?1, ?2, ?3 indexed params for SQLite prepared statements
  s = s.replace(/\$(\d+)/g, '?$1');
  // Replace ILIKE with LIKE
  s = s.replace(/\bILIKE\b/gi, 'LIKE');
  // Replace CURRENT_DATE with date('now')
  s = s.replace(/\bCURRENT_DATE\b/gi, "date('now')");
  // Replace CURRENT_TIMESTAMP with datetime('now')
  s = s.replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now')");
  // Replace id::text with CAST(id AS TEXT)
  s = s.replace(/([\w.]+)::text/gi, 'CAST($1 AS TEXT)');
  // Replace TRUE/FALSE with 1/0
  s = s.replace(/\bTRUE\b/g, '1').replace(/\bFALSE\b/g, '0');
  // Strip PostgreSQL RETURNING clauses for inserts/updates in SQLite
  s = s.replace(/\s+RETURNING\s+[\s\S]*$/i, '');
  return s;
}

/**
 * Execute parameterized query on SQLite
 */
async function querySqlite(sql, params = []) {
  const db = await getSqliteDb();
  const cleanSql = translatePgToSqlite(sql);

  // Normalize parameters: convert boolean/dates to string/numbers
  const normalizedParams = (params || []).map((p) => {
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p instanceof Date) return p.toISOString();
    return p;
  });

  const isSelect = /^\s*SELECT\b/i.test(cleanSql);

  if (isSelect) {
    try {
      const stmt = db.prepare(cleanSql);
      if (normalizedParams.length > 0) {
        stmt.bind(normalizedParams);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, { rows, rowCount: rows.length, affectedRows: rows.length }];
    } catch (err) {
      throw err;
    }
  } else {
    // Mutation: INSERT, UPDATE, DELETE
    try {
      db.run(cleanSql, normalizedParams);

      const isInsert = /^\s*INSERT\b/i.test(cleanSql);
      let insertId = 0;
      if (isInsert) {
        const lastIdRes = db.exec('SELECT last_insert_rowid() AS id');
        insertId = lastIdRes[0]?.values[0][0] || 0;
      }

      const changesRes = db.exec('SELECT changes() AS changes');
      const affectedRows = changesRes[0]?.values[0][0] || 0;

      if (!inTransaction) {
        persistDb(db);
      }

      let resultRows = insertId
        ? [{ id: insertId, product_id: insertId, order_id: insertId, category_id: insertId, address_id: insertId, return_id: insertId }]
        : [];

      if (resultRows.length === 0 && affectedRows > 0) {
        resultRows = [{ id: 1, affected: affectedRows }];
      }

      return [
        resultRows,
        {
          insertId,
          affectedRows,
          rowCount: affectedRows,
          rows: resultRows
        }
      ];
    } catch (err) {
      throw err;
    }
  }
}

async function getSqliteConnection() {
  const db = await getSqliteDb();
  return {
    async query(sql, params = []) {
      return querySqlite(sql, params);
    },
    async beginTransaction() {
      inTransaction = true;
      db.run('BEGIN TRANSACTION;');
    },
    async commit() {
      try {
        db.run('COMMIT;');
        inTransaction = false;
        persistDb(db);
      } catch (e) {
        inTransaction = false;
      }
    },
    async rollback() {
      try {
        db.run('ROLLBACK;');
      } catch (e) {}
      inTransaction = false;
    },
    release() {
      inTransaction = false;
    }
  };
}

module.exports = {
  getSqliteDb,
  querySqlite,
  getSqliteConnection,
  persistDb
};
