-- ========================================================
-- ClickCart Seed Data
-- 8 Categories, 42 Realistic Products
-- ========================================================

USE ecommerce_db;

-- Clear previous data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Order_Items;
TRUNCATE TABLE Orders;
TRUNCATE TABLE Products;
TRUNCATE TABLE Categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Categories
INSERT INTO Categories (category_id, category_name, description) VALUES
(1, 'Electronics', 'Smart gadgets, premium wireless audio, and personal electronic devices.'),
(2, 'Mobile Accessories', 'Fast chargers, durable cables, magnetic phone mounts, and cases.'),
(3, 'Computer Accessories', 'Ergonomic keyboards, precision wireless mice, laptop stands, and USB-C hubs.'),
(4, 'Fashion & Apparel', 'Modern everyday casuals, minimalist tees, jackets, and accessories.'),
(5, 'Footwear', 'Everyday sneakers, running athletic shoes, and casual slip-ons.'),
(6, 'Home & Kitchen', 'Aesthetic kitchen appliances, vacuum insulated flasks, and home essentials.'),
(7, 'Stationery & Office', 'Premium fountain pens, dot-grid hardcover notebooks, and desk organizers.'),
(8, 'Beauty & Personal Care', 'Hydrating serums, natural botanical skincare, and grooming essentials.');

-- 2. Insert Products (Realistic names, descriptions, prices, stock, image URLs)
INSERT INTO Products (product_id, category_id, product_name, description, price, stock_quantity, image_url) VALUES
-- Category 1: Electronics (IDs 1-6)
(1, 1, 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', 'Industry-leading noise canceling with two processors, 8 microphones, and up to 30-hour battery life.', 24990.00, 18, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'),
(2, 1, 'ClickCart SonicPulse Bluetooth Speaker', 'Compact portable 20W stereo speaker with deep bass, IPX7 waterproof rating, and 14-hour playtime.', 2999.00, 35, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'),
(3, 1, 'Aura ANC True Wireless Earbuds', 'Active noise cancellation earbuds with transparency mode, wireless charging case, and low latency gaming mode.', 4499.00, 24, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'),
(4, 1, 'FitPro Horizon Smart Fitness Tracker', 'AMOLED display smartwatch with SpO2 monitoring, 24/7 heart-rate tracking, sleep score, and 5ATM water resistance.', 3299.00, 40, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
(5, 1, '4K Ultra-HD Action Camera with Gimbal', 'Crisp 4K 60fps recording, dual touch screens, waterproof up to 10m without case, and electronic image stabilization.', 14999.00, 8, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'),
(6, 1, 'InstaPrint Retro Instant Film Camera', 'Automatic exposure, built-in selfie mirror, and sharp retro photo printing for preserving spontaneous memories.', 6499.00, 15, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'),

-- Category 2: Mobile Accessories (IDs 7-12)
(7, 2, 'Anker 65W GaN Fast Wall Charger', 'Ultra-compact 3-port fast wall charger with PowerIQ 3.0 for charging phones, tablets, and laptops concurrently.', 2499.00, 50, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'),
(8, 2, 'MagSafe 10000mAh Magnetic Power Bank', 'Wireless snap-on magnetic power bank with foldable kickstand and 20W bi-directional PD fast charging.', 2199.00, 32, 'https://images.unsplash.com/photo-1609592426815-a6a2416b2512?w=800&q=80'),
(9, 2, 'Braided USB-C to Lightning Fast Charging Cable (2m)', 'Heavy-duty Kevlar-reinforced braided cable rated for 30,000+ bends with 480Mbps data transfer speed.', 699.00, 60, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'),
(10, 2, 'Aerocool Magnetic Car Dashboard Phone Mount', 'Strong N52 neodymium magnets with 360-degree rotation ball joint for one-handed navigation positioning.', 899.00, 28, 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&q=80'),
(11, 2, 'Ultra-Slim Liquid Silicone Case for iPhone 15', 'Silky soft-touch exterior with microfiber interior lining and raised bezel camera lip protection.', 799.00, 45, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80'),
(12, 2, '3-in-1 Foldable Wireless Charging Station', 'Simultaneously charges your smartphone, smartwatch, and wireless earbuds with intelligent temperature control.', 2999.00, 19, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'),

-- Category 3: Computer Accessories (IDs 13-18)
(13, 3, 'Keychron K2 Wireless Mechanical Keyboard', 'Compact 75% layout RGB backlit mechanical keyboard with hot-swappable Gateron G Pro Brown switches.', 7499.00, 14, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'),
(14, 3, 'Logitech MX Master 3S Ergonomic Mouse', 'Quiet clicks, 8K DPI any-surface tracking sensor, and MagSpeed electromagnetic scroll wheel.', 8995.00, 12, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'),
(15, 3, 'Aluminum Ergonomic Laptop Riser Stand', 'Sturdy anodized aluminum stand that elevates your screen to eye level to reduce neck strain.', 1499.00, 30, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'),
(16, 3, '8-in-1 USB-C Multiport Docking Hub', 'Includes 4K HDMI 60Hz, 100W Power Delivery pass-through, Gigabit Ethernet, SD/TF reader, and 3 USB-A ports.', 2899.00, 22, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'),
(17, 3, 'Extra-Large Water-Resistant Desk Mat (900x400mm)', 'Smooth micro-weave fabric surface with non-slip natural rubber base and anti-fray stitched edges.', 999.00, 40, 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&q=80'),
(18, 3, 'Full HD 1080p Streaming Webcam with Privacy Shutter', 'Sharp wide-angle glass lens with auto low-light correction and stereo dual noise-reducing microphones.', 2799.00, 25, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80'),

-- Category 4: Fashion & Apparel (IDs 19-24)
(19, 4, 'Classic Heavyweight Organic Cotton Crewneck T-Shirt', 'Crafted from 100% combed organic ring-spun cotton with ribbed collar and relaxed modern fit.', 899.00, 55, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'),
(20, 4, 'Minimalist Oxford Button-Down Slim Shirt', 'Breathable pre-shrunk cotton Oxford fabric designed for effortless smart-casual versatility.', 1799.00, 27, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'),
(21, 4, 'Urban Water-Resistant Commuter Backpack (22L)', 'Padded 15.6-inch laptop compartment with hidden anti-theft back pocket and luggage strap pass-through.', 2499.00, 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'),
(22, 4, 'Polarized Retro Square Sunglasses UV400', 'Lightweight acetate frame with scratch-resistant polarized TAC lenses for glare-free clear vision.', 1299.00, 40, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'),
(23, 4, 'Genuine Full-Grain Leather Bi-Fold Wallet', 'RFID-blocking slim profile wallet with 8 card slots, quick thumb slide, and divided cash compartment.', 1199.00, 30, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'),
(24, 4, 'All-Weather Windbreaker Lightweight Jacket', 'Durable water-repellent shell with breathable mesh lining, adjustable hood, and zippered welt pockets.', 2999.00, 16, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80'),

-- Category 5: Footwear (IDs 25-30)
(25, 5, 'CloudStride Cushioned Daily Running Shoes', 'Engineered mesh upper with responsive foam midsole for lightweight shock absorption on daily runs.', 3499.00, 20, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),
(26, 5, 'Urban Minimalist White Leather Sneakers', 'Clean low-top sneaker silhouette with supple leather upper and vulcanized durable gum rubber sole.', 2799.00, 25, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'),
(27, 5, 'Breathable Slip-On Casual Loafers', 'Stretch knit upper with memory foam cushioned footbed for effortless all-day walking comfort.', 1999.00, 30, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80'),
(28, 5, 'TrailMaster Rugged Outdoor Hiking Boots', 'Waterproof leather and Cordura construction with high-traction Vibram outsole and reinforced toe bumper.', 4899.00, 11, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80'),
(29, 5, 'Ergonomic Arch Support Recovery Slides', 'Soft dual-density EVA foam slides designed to soothe fatigued feet after workouts or long days.', 999.00, 45, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80'),
(30, 5, 'Classic Canvas Low-Top Lace Sneakers', 'Timeless vulcanized canvas sneaker with reinforced stitching and cushioned insole.', 1499.00, 28, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'),

-- Category 6: Home & Kitchen (IDs 31-36)
(31, 6, 'Stainless Steel Double-Wall Thermal Coffee Press', 'Insulated vacuum French press that keeps brew piping hot for 2 hours with dual micro-mesh filter.', 1899.00, 22, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80'),
(32, 6, 'Smart Digital Precision Kitchen Food Scale', 'High-precision sensor with 0.1g increments, tare function, and backlit LCD display for baking.', 849.00, 38, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80'),
(33, 6, 'Double-Walled Insulated Flask with Leak-Proof Cap (750ml)', '18/8 food-grade stainless steel bottle keeping drinks icy cold for 24 hours or piping hot for 12.', 999.00, 50, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'),
(34, 6, 'Aroma Ultrasonic Essential Oil Diffuser (300ml)', 'Whisper-quiet ultrasonic mist maker with 7 ambient LED light colors and auto shut-off safety.', 1599.00, 26, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'),
(35, 6, 'Cast Iron Pre-Seasoned Skillet (10-inch)', 'Heavy-duty skillet with superior heat retention for searing steaks, baking cornbread, or sautéing.', 1899.00, 15, 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80'),
(36, 6, 'Modern Ceramic Mug with Acacia Wood Lid & Coaster', 'Handcrafted matte finish ceramic mug (380ml) with natural heat-insulating wooden coaster lid.', 599.00, 48, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'),

-- Category 7: Stationery & Office (IDs 37-39)
(37, 7, 'Premium Hardcover Dot-Grid Journal (160 GSM)', 'Thick bleed-proof acid-free bamboo paper with expandable back pocket, dual ribbons, and elastic band.', 799.00, 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'),
(38, 7, 'Brass Precision Rollerball Gel Pen (0.5mm)', 'Solid machined brass hexagonal pen body with smooth-gliding archival black Japanese ink cartridge.', 699.00, 42, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80'),
(39, 7, 'Minimalist Metal Desktop Organizer Tray', 'Powder-coated steel desk caddy to cleanly organize pens, paper clips, sticky notes, and cards.', 549.00, 30, 'https://images.unsplash.com/photo-1507842229451-79b1be886a07?w=800&q=80'),

-- Category 8: Beauty & Personal Care (IDs 40-42)
(40, 8, 'Hydrating Hyaluronic Acid & Vitamin C Facial Serum', 'Intense moisture booster formulated with 2% multi-molecular hyaluronic acid and green tea antioxidants.', 899.00, 33, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'),
(41, 8, 'Botanical Nourishing Hair Repair Treatment Oil', 'Cold-pressed Moroccan argan oil and jojoba blend to tame frizz and restore healthy luminous shine.', 749.00, 27, 'https://images.unsplash.com/photo-1608248597359-00f074d28362?w=800&q=80'),
(42, 8, 'Mineral Sunscreen SPF 50+ Broad Spectrum (100ml)', 'Lightweight non-greasy matte finish sunscreen with zinc oxide and zero white cast protection.', 699.00, 40, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80');

-- 3. Insert Demo Users (Idempotent seed with hashed passwords)
INSERT INTO Users (name, email, password_hash, role) VALUES
('ClickCart Admin', 'admin@clickcart.com', '$2b$10$ZuzuuZZOvMdfL7a8nOvInOeJ4h6EfbGm/jywqzixhPtyQ8QyxWkCq', 'admin'),
('Demo Customer', 'customer@clickcart.com', '$2b$10$hhhz/FbP.GVAx4KS1UfNlOSoWDtq/upWiowfVVutBY2g3aDaXjU3y', 'customer')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role);
