# ClickCart — Simple E-Commerce Cart & Order Management System

<div align="center">
  <img src="client/public/logo.svg" alt="ClickCart Logo" width="280"/>
  <p><strong>Shop in a click.</strong></p>
  <p>A production-quality full-stack retail and order fulfillment platform powered by React, Node.js/Express, and MySQL 8+.</p>
</div>

---

## 1. Project Information

- **Project Name:** ClickCart (Simple E-Commerce Cart & Order Management System)
- **Project Number:** Project 10
- **Academic Context:** Full-Stack Development (FSD) Project
- **GitHub Repository:** [https://github.com/Devarajb049/E_Commerce.git](https://github.com/Devarajb049/E_Commerce.git)

---

## Demo Admin Login

For testing, evaluation, and demonstration purposes, use the dedicated one-tap demo administrator account:

- **Email:** `admin@clickcart.com`
- **Password:** `ClickCart@123`
- **Role:** Administrator

> **Note:** The demo admin account is automatically seeded into MySQL on server initialization with bcrypt password hashing (`npm run seed`). Reviewers can click the **"⚡ Continue as Demo Admin"** one-tap button directly on the `/login` page to authenticate instantly via the real JWT authentication API without manual typing.


## 1. Brand Identity & Visual System

- **Brand Name:** `ClickCart`
- **Brand Tagline:** `Shop in a click.`
- **Visual Identity:** Modern shopping cart in primary Indigo combined with an active orange mouse cursor clicking into the basket with ripple indicators.
- **Color Palette:**
  - **Primary Indigo:** `#4F46E5`
  - **Secondary Orange:** `#F97316`
  - **Dark Text:** `#111827`
  - **Secondary Text:** `#6B7280`
  - **Background:** `#F9FAFB`
  - **Border:** `#E5E7EB`
  - **Success / In Stock:** `#16A34A`
  - **Warning / Low Stock:** `#D97706`
  - **Error / Out of Stock:** `#DC2626`

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with modern functional components & hooks
- **Build Tool:** Vite 6
- **Routing:** React Router v6 (`BrowserRouter`, dynamic route parameters, nested layouts)
- **Styling:** Tailwind CSS (configured with ClickCart brand palette)
- **Icons:** Lucide React
- **HTTP Client:** Axios (centralized client with response error interceptors)
- **State Management:** React Context API (`CartContext`, `ToastContext`) with `localStorage` backup

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (v4.21)
- **Database Driver:** `mysql2/promise` (connection pooling with transaction support)
- **Environment Management:** `dotenv`
- **Cross-Origin Resource Sharing:** `cors`
- **Error Handling:** Centralized Express middleware with sanitized user error codes

### Database
- **Engine:** MySQL 8.0+ (InnoDB storage engine)
- **Design:** Normalized relational database (Categories, Products, Orders, Order_Items)
- **Integrity:** Primary keys, foreign key constraints (`ON DELETE RESTRICT` / `ON DELETE CASCADE`), `CHECK` constraints
- **Indexes:** B-tree indexes for fast product searching, category lookups, and order date analytics
- **Transactions:** Atomic ACID transactions (`START TRANSACTION`, `FOR UPDATE` stock locking, `COMMIT`, `ROLLBACK`)

---

## 3. Application Architecture

```text
React Client (Vite :3000)
    │
    ▼ Axios HTTP Requests
Express Server (:5000)
    │
    ├── Middleware (CORS, JSON Parser, Request Logger, Input Validation)
    │
    ├── Routes & Controllers (/api/categories, /api/products, /api/orders, /api/reports)
    │
    ▼ Connection Pool (mysql2/promise)
MySQL 8.0+ Database (ecommerce_db)
    ├── Categories
    ├── Products (Row-level Locking FOR UPDATE)
    ├── Orders (ACID Transaction)
    └── Order_Items (Historical Price Snapshots)
```

---

## 4. Folder Structure

```text
FSD-Project/
├── client/                     # Frontend React Application
│   ├── public/
│   │   ├── favicon.svg         # ClickCart browser tab icon
│   │   ├── logo-icon.svg       # Vector cart + cursor mark
│   │   └── logo.svg            # Full vector logo with wordmark
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminNav.jsx    # Admin header tab navigation
│   │   │   ├── CartItem.jsx    # Interactive item card with steppers
│   │   │   ├── CartSummary.jsx # Price, GST 18%, and grand total summary
│   │   │   ├── CategoryCard.jsx# Department card with product counters
│   │   │   ├── EmptyState.jsx  # Branded empty state illustration
│   │   │   ├── ErrorMessage.jsx# Friendly alert banner with retry
│   │   │   ├── Footer.jsx      # Footer with team members and links
│   │   │   ├── LoadingSpinner.jsx # Branded ClickCart bounce loader
│   │   │   ├── Navbar.jsx      # Responsive header with live cart badge
│   │   │   ├── ProductCard.jsx # Card with stock badges & Add to Cart
│   │   │   ├── ProductGrid.jsx # Responsive 1 to 4 column catalog grid
│   │   │   ├── SearchBar.jsx   # Live search bar with clear action
│   │   │   └── Toast.jsx       # Non-intrusive alert toasts
│   │   ├── context/
│   │   │   ├── CartContext.jsx # Cart state, stock bounds, and calculations
│   │   │   └── ToastContext.jsx# Toast notification state
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing hero, departments & featured
│   │   │   ├── Products.jsx       # Search, filter by price/cat, sorting
│   │   │   ├── ProductDetails.jsx # Detailed view, quantity selector
│   │   │   ├── Cart.jsx           # Cart page with line items & totals
│   │   │   ├── Checkout.jsx       # Shipping form validation & order trigger
│   │   │   ├── OrderSuccess.jsx   # Confirmation screen with order ID
│   │   │   ├── Invoice.jsx        # Printable GST tax invoice
│   │   │   ├── Orders.jsx         # Customer order history & tracking
│   │   │   ├── AdminDashboard.jsx # KPIs, category charts & top items
│   │   │   ├── AdminProducts.jsx  # Catalog inventory CRUD
│   │   │   ├── AdminCategories.jsx# Category department CRUD
│   │   │   ├── AdminOrders.jsx    # Order fulfillment status updater
│   │   │   └── AdminReports.jsx   # SQL aggregate business reports
│   │   ├── services/
│   │   │   └── api.js          # Axios API service
│   │   ├── App.jsx             # Route definitions & providers
│   │   ├── main.jsx            # React root DOM mount
│   │   └── index.css           # Tailwind base styles and print styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Node.js / Express Application
│   ├── config/
│   │   └── db.js               # mysql2/promise connection pool
│   ├── controllers/
│   │   ├── categoryController.js  # Category CRUD with dependency checks
│   │   ├── productController.js   # Products filtering, search, sort, CRUD
│   │   ├── orderController.js     # Transactional order placement & status
│   │   └── reportController.js    # SQL aggregate calculations (SUM, COUNT)
│   ├── middleware/
│   │   ├── errorHandler.js     # Centralized error handler & status codes
│   │   └── validation.js       # Customer and catalog input validators
│   ├── routes/
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reportRoutes.js
│   ├── app.js                  # Express app setup & route mounting
│   ├── server.js               # Port listener with graceful shutdown
│   ├── .env                    # Environment config (gitignored)
│   ├── .env.example            # Environment template
│   └── package.json
│
├── database/                   # MySQL Database Scripts
│   ├── schema.sql              # Table definitions, constraints, indexes
│   └── seed.sql                # 8 categories and 42 realistic products
│
├── .gitignore
├── README.md
└── package.json                # Monorepo root with concurrent scripts
```

---

## 5. Database Schema & Design

### Relational Schema

```text
┌──────────────────────┐         ┌───────────────────────────────┐
│      Categories      │ 1     N │           Products            │
├──────────────────────┤─────────├───────────────────────────────┤
│ PK category_id       │         │ PK product_id                 │
│    category_name     │         │ FK category_id ──► Categories │
│    description       │         │    product_name               │
│    created_at        │         │    description                │
└──────────────────────┘         │    price (CHECK > 0)          │
                                 │    stock_quantity (CHECK >= 0)│
                                 │    image_url                  │
                                 │    created_at / updated_at    │
                                 └───────────────┬───────────────┘
                                                 │ 1
                                                 │
                                                 │ N
┌──────────────────────┐ 1     N ┌───────────────┴───────────────┐
│        Orders        │─────────┤          Order_Items          │
├──────────────────────┤         ├───────────────────────────────┤
│ PK order_id          │         │ PK order_item_id              │
│    order_number (UQ) │         │ FK order_id ─────► Orders     │
│    customer_name     │         │ FK product_id ───► Products   │
│    email             │         │    quantity (CHECK > 0)       │
│    phone             │         │    price (CHECK > 0) [Snapshot│
│    address           │         │    subtotal                   │
│    city, state, PIN  │         └───────────────────────────────┘
│    subtotal, tax     │
│    total_amount      │
│    order_status      │
│    created_at        │
└──────────────────────┘
```

### Key Integrity Rules
1. **Foreign Key Protection:** Deleting a Category with attached Products is blocked by the database with a user-friendly error message.
2. **Historical Pricing Snapshots:** `Order_Items.price` permanently records the item's purchase price at checkout time. Future price changes to the product catalog never modify past invoices.
3. **Atomic Transactions:** Order creation executes inside `START TRANSACTION`:
   - Checks stock with `SELECT ... FOR UPDATE`
   - Validates that `quantity <= stock_quantity`
   - Re-computes financial subtotal and 18% GST directly from database prices
   - Inserts `Orders` record
   - Inserts `Order_Items` records
   - Decrements stock from `Products`
   - Commits transaction atomically; if any step fails, performs an instant `ROLLBACK`.

---

## 7. REST API Endpoints

### Health & Root
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and ClickCart welcome message |
| `GET` | `/api/health` | Live database health and ping latency |

### Product Catalog
| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | `search`, `category`, `sort`, `min_price`, `max_price`, `in_stock_only` | Get catalog items with multi-criteria filtering |
| `GET` | `/api/products/:id`| — | Get product details by ID |
| `POST` | `/api/products` | — | Create a new catalog product |
| `PUT` | `/api/products/:id`| — | Update product price, stock, or description |
| `DELETE`| `/api/products/:id`| — | Delete product (with order history check) |

### Categories
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Get all categories with product counts |
| `GET` | `/api/categories/:id` | Get single category by ID |
| `POST` | `/api/categories` | Create a new category department |
| `PUT` | `/api/categories/:id` | Update category name and description |
| `DELETE`| `/api/categories/:id` | Delete category (blocked if products exist) |

### Orders & Checkout
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Place order with atomic transaction & stock update |
| `GET` | `/api/orders` | Get order list with search and status filtering |
| `GET` | `/api/orders/:id` | Get complete order and item line history |
| `PUT` | `/api/orders/:id/status` | Update fulfillment status (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |

### Business Intelligence & Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | KPI metrics (Revenue, Orders, Low Stock, Today's Sales) |
| `GET` | `/api/reports/sales-by-category` | Category revenue breakdown using `GROUP BY` |
| `GET` | `/api/reports/top-products` | Top-selling items ranked by `SUM(quantity)` |
| `GET` | `/api/reports/daily-sales` | Revenue history grouped by `DATE(created_at)` |

---

## 8. Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) 8.0 or later
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Devarajb049/E_Commerce.git
cd E_Commerce
```

### Step 2: Database Setup
Make sure your MySQL server is running. Then load the schema and seed scripts:

```bash
# Using MySQL Command Line or MySQL Workbench:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

*Note: For Windows PowerShell, you can execute:*
```powershell
cmd /c "mysql -u root -p < database/schema.sql"
cmd /c "mysql -u root -p < database/seed.sql"
```

### Step 3: Configure Environment Variables
Inside the `server/` directory, create a `.env` file (copied from `.env.example`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env` to reflect your MySQL credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
TAX_RATE=0.18
```

### Step 4: Install Dependencies

From the project root:
```bash
# Install root monorepo packages (concurrently)
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

---

## 9. Running the Application

### Option A: Run Both Together (Recommended)
From the project root directory:
```bash
npm run dev
```
This simultaneously boots the Express backend at `http://localhost:5000` and the React Vite client at `http://localhost:3000`.

### Option B: Run Separately in Two Terminals

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Server listens at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Vite runs at http://localhost:3000
```

---

## 10. Customer & Admin User Journey

### Customer Shopping Workflow
1. **Home Page (`/`):** View ClickCart hero branding, explore curated departments, and browse featured items.
2. **Catalog Page (`/products`):** Search in real-time, filter by price range and departments, and sort by price or newest arrivals.
3. **Product Details (`/products/:id`):** Inspect high-resolution images, check real-time stock levels, choose quantities, and click "Add to Cart".
4. **Cart Management (`/cart`):** Update item quantities, verify the live 18% GST calculation, and click "Proceed to Checkout".
5. **Checkout (`/checkout`):** Fill out shipping details (validated client-side and server-side) and place order.
6. **Order Confirmation (`/order-success/:orderId`):** Receive unique human-readable order ID (`ORD-XXXXX`).
7. **Tax Invoice (`/invoice/:id`):** View formal GST tax invoice and print with browser print function.
8. **My Orders (`/orders`):** Track all historical customer orders and review items.

### Administrator Workflow
1. **Admin Dashboard (`/admin`):** View overall revenue, order volume, catalog size, today's metrics, and low-stock alerts.
2. **Product Management (`/admin/products`):** Add new items, edit prices/stock, and delete out-of-circulation products.
3. **Department Management (`/admin/categories`):** Add and organize store departments.
4. **Order Fulfillment (`/admin/orders`):** Inspect full order payloads, verify customer details, and update status (`PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
5. **Sales Analytics (`/admin/reports`):** Review SQL aggregate reports for category breakdown, best-selling products, and daily sales trends.

---

## 11. Verification & Testing Checklist

- [x] Backend connects to MySQL 8+ with healthy response on `/api/health`
- [x] 8 categories and 42 realistic products loaded into `ecommerce_db`
- [x] Multi-criteria search, department filters, and price ranges function smoothly
- [x] Cart respects live inventory stock and prevents over-allocation
- [x] Checkout executes an atomic MySQL transaction with row-level locking
- [x] Product stock automatically decrements upon successful order placement
- [x] GST tax (18%) and line item totals calculate server-side
- [x] Tax invoices format properly on screen and in browser print view
- [x] Admin status changes persist instantly to MySQL
- [x] SQL `SUM()`, `COUNT()`, and `GROUP BY` power the analytics reports
- [x] Responsive layout functions seamlessly on desktop, tablet, and mobile
- [x] Zero console errors during end-to-end user navigation

---

## 12. License & Attribution

This project is developed for academic coursework by **Project Team 10**. All rights reserved © 2026 ClickCart.
