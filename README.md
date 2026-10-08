# ClickCart — Modern Full-Stack E-Commerce & Order Management System

<div align="center">
  <img src="client/public/logo.svg" alt="ClickCart Logo" width="300"/>
  <p><strong>Shop in a click.</strong></p>
  <p>A production-quality full-stack retail and order fulfillment platform featuring an editorial design system, atomic MySQL transactions, dual-engine database fallback (MySQL + embedded SQLite), and cloud deployment readiness.</p>

  <p>
    <a href="https://github.com/Devarajb049/E_Commerce"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub Repo"/></a>
    <img src="https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js" alt="Node.js"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18"/>
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/MySQL-8.0%2B-4479A1?logo=mysql" alt="MySQL"/>
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
  </p>
</div>

---

## 🚀 Live Cloud Deployment

- **Deployment Platform:** [Voroa](https://getvoroa.com)
- **Live Deployment Dashboard:** [https://app.getvoroa.com/web/zlup8xkzey8eq69td9sz12nd](https://app.getvoroa.com/web/zlup8xkzey8eq69td9sz12nd)
- **GitHub Repository:** [https://github.com/Devarajb049/E_Commerce](https://github.com/Devarajb049/E_Commerce)

---

## ⚡ Quick Demo Accounts

For evaluation, testing, and live demonstration, ClickCart provides pre-seeded demo accounts:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@clickcart.com` | `admin123` | Analytics dashboard, inventory management, order fulfillment, category control |
| **Customer** | `customer@clickcart.com` | `password123` | Browsing, persistent cart, 4-step checkout, live order tracking, address book |

> **Pro-Tip:** The `/login` page features a **"⚡ Continue as Demo Admin"** one-tap button that logs in directly via the JWT API without typing.

---

## 🎨 Editorial Design System & Highlights

ClickCart features a bespoke **editorial retail visual language**:

1. **Subtle Technical Grid Footer CTA:**
   - Pure CSS dual `linear-gradient` grid canvas (`#F9FAFB` surface with `#E5E7EB` 1px lines at 56px intervals).
   - Oversized statement headline: `Let's Shop Smarter` with `#111827` dark text and `#4F46E5` Indigo contrast.
   - Architectural low-opacity background wordmark `CLICKCART` (`clamp(120px, 20vw, 400px)`).
   - Circular brand social buttons (LinkedIn, Instagram, GitHub, X) with hover elevation.
   - Pill-shaped uppercase legal buttons (`[ PRIVACY POLICY ]`, `[ TERMS OF SERVICE ]`) with interactive dialogs.
   - Floating circular **Back-to-Top** button with smooth scrolling and `prefers-reduced-motion` support.

2. **Purchasing & Checkout Flow:**
   - Editorial 4-step stepper (`01 Address` ── `02 Delivery` ── `03 Payment` ── `04 Review`).
   - Unauthenticated cart preservation (`localStorage`) with redirect protection.
   - Atomic order placement with row-level stock locks and 18% GST tax calculation.
   - Post-checkout unboxing confirmation animation and live multi-stage order timeline.

3. **Color Palette:**
   - **Primary Indigo:** `#4F46E5`
   - **Secondary Accent:** `#F97316`
   - **Dark Slate:** `#111827`
   - **Muted Text:** `#6B7280`
   - **Background Canvas:** `#F9FAFB`
   - **Borders & Dividers:** `#E5E7EB`

---

## 🛠️ Technology Stack

### Frontend Client (`/client`)
- **Core:** React 18 (functional components, hooks)
- **Tooling:** Vite 6 (instant HMR, optimized production chunks)
- **Routing:** React Router v6 (protected routes, role checks, query redirects)
- **Styling:** Vanilla CSS + Tailwind CSS (v3.4) with custom tokens
- **Icons:** Lucide React & official SVG brand marks
- **State:** React Context API (`CartContext`, `AuthContext`, `ToastContext`) + `localStorage` persistence

### Backend Server (`/server`)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4.21)
- **Authentication:** JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **Static Serving:** Serves the compiled React SPA with HTML5 pushState routing for unified single-service deployments
- **Database Layer:**
  - **Primary:** Hosted **Supabase PostgreSQL 15+** via connection pooling (`pg`) with ACID transactions and row-level stock locks (`FOR UPDATE`)
  - **Zero-Crash Fallback:** Embedded SQLite catalog auto-activates if `DATABASE_URL` is omitted, allowing offline development

---

## 📁 Repository Structure

```text
E_Commerce/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets & SVG icons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Footer.jsx      # Premium grid-based minimal footer CTA
│   │   │   ├── Navbar.jsx      # Navigation bar with live cart count
│   │   │   ├── ProductCard.jsx # Editorial product showcase card
│   │   │   ├── CartSummary.jsx # Price, GST 18%, and grand totals
│   │   │   └── order/          # Order timeline & success unboxing animation
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/              # Storefront, Checkout, Orders, Admin pages
│   │   ├── services/api.js     # Axios API service with JWT interceptor
│   │   └── index.css           # Global typography & design system tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Node.js / Express REST API
│   ├── config/
│   │   ├── db.js               # Dual-engine connection pool (MySQL + SQLite fallback)
│   │   └── sqliteStore.js      # Embedded database engine
│   ├── controllers/            # Auth, Product, Category, Order, Report controllers
│   ├── middleware/             # JWT auth verify, role guard, error handlers
│   ├── routes/                 # REST endpoints
│   ├── seed.js                 # Database seeder (admin & catalog data)
│   ├── server.js               # Entry point
│   └── package.json
│
├── database/                   # MySQL schema & seed scripts
│   ├── schema.sql              # Relational DDL tables, indexes, constraints
│   └── ecommerce_db.sql        # Full database dump
│
├── DEPLOYMENT.md               # Cloud environment variables & host guide
├── package.json                # Root monorepo scripts for cloud builds
└── README.md                   # Project documentation
```

---

## 📡 REST API Reference

### Health & Information
- `GET /api` — API info and running status
- `GET /api/health` — Database health check and ping latency

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve active user session profile

### Products & Categories
- `GET /api/products` — Filter catalog by search, category, price, stock, and sorting
- `GET /api/products/:id` — Single product details
- `POST /api/products` — Create product *(Admin only)*
- `PUT /api/products/:id` — Update product details *(Admin only)*
- `DELETE /api/products/:id` — Remove product *(Admin only)*
- `GET /api/categories` — List all departments with product counts

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` — Place order with atomic transaction & stock verification
- `GET /api/orders` — List orders (role-filtered: customer sees own, admin sees all)
- `GET /api/orders/:id` — Order line items and GST invoice payload
- `PUT /api/orders/:id/status` — Update order lifecycle (`PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`)

### Business Analytics (`/api/reports`) *(Admin only)*
- `GET /api/reports/summary` — KPIs (Gross Revenue, Total Orders, Low Stock Items)
- `GET /api/reports/sales-by-category` — Revenue distribution by department
- `GET /api/reports/top-products` — Top-selling items ranked by volume
- `GET /api/reports/daily-sales` — Daily financial breakdown

---

## 💻 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) 8.0+ *(Optional — SQLite runs automatically if MySQL is not installed)*
- [Git](https://git-scm.com/)

### Step 1: Clone Repository
```bash
git clone https://github.com/Devarajb049/E_Commerce.git
cd E_Commerce
```

### Step 2: Install All Dependencies
```bash
npm run install:all
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
```

*(Optional)* Configure your local MySQL credentials:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
TAX_RATE=0.18
JWT_SECRET=clickcart_super_secret_jwt_key_2026
```

### Step 4: Run the Application
From the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🌐 Cloud Deployment (Voroa / Render / Railway)

ClickCart is pre-configured with root build and start scripts:

1. **Connect GitHub:** Link your repository to your cloud provider (e.g., [Voroa](https://app.getvoroa.com/web/zlup8xkzey8eq69td9sz12nd)).
2. **Build Settings:**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. **Environment Variables:**
   ```env
   NODE_ENV=production
   CORS_ORIGIN=*
   JWT_SECRET=clickcart_secure_jwt_token_secret_key_2026_voroa
   JWT_EXPIRES_IN=7d
   TAX_RATE=0.18
   ```

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full cloud configuration options.

---

## 📄 License & Attribution

Designed and developed by **Project Team 10** for academic coursework in Full-Stack Development.
All rights reserved © 2026 ClickCart.
