# ClickCart Database Setup — Supabase PostgreSQL Guide

This document describes how to configure and connect ClickCart to **Supabase PostgreSQL**.

---

## 🚀 Quick Setup Instructions (8 Steps)

### Step 1: Open Your Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project (e.g. `https://supabase.com/dashboard/org/zvnihfslrdnvyujxyiov`).

---

### Step 2: Open the SQL Editor
1. In the left navigation menu of your Supabase dashboard, click on **SQL Editor** (the `>_` icon).
2. Click **New query** (or the **+** button).

---

### Step 3: Run the Database Schema (`supabase_schema.sql`)
1. Open [`database/supabase_schema.sql`](./supabase_schema.sql) from this repository.
2. Copy the entire content and paste it into the Supabase SQL Editor.
3. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
4. Ensure the output shows: `Success. No rows returned` (all tables, foreign keys, check constraints, and indexes created).

---

### Step 4: Run the Seed Data (`supabase_seed.sql`)
1. In the Supabase SQL Editor, open a new query tab.
2. Open [`database/supabase_seed.sql`](./supabase_seed.sql) from this repository.
3. Copy the entire content, paste it into the editor, and click **Run**.
4. This seeds the **8 product categories**, **42 realistic catalog items**, and the **2 demo user accounts** (Admin & Customer).

---

### Step 5: Copy Your PostgreSQL Connection String
1. Go to **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click **Database**.
3. Under the **Connection string** section:
   - Select the **URI** tab.
   - Choose **Node.js** (or Direct Connection / Session Pooler).
   - Mode: **Session** (Port 5432) or **Transaction** (Port 6543).
   - The connection string looks like:
     ```text
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
     or
     ```text
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

---

### Step 6: Add `DATABASE_URL` to `.env`
Inside `server/.env` (and root `.env` if deploying unified):

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@db.zvnihfslrdnvyujxyiov.supabase.co:5432/postgres
```
*(Replace `YOUR_ACTUAL_PASSWORD_HERE` with your actual Supabase database password created during project setup).*

---

### Step 7: Start Backend Server
From the root directory:
```bash
npm run server
```
Or in development:
```bash
npm run dev
```

The server console will display:
```text
✅ Successfully connected to Supabase PostgreSQL database.
✅ Demo accounts verified & seeded successfully.
```

---

### Step 8: Test Database Connection & Endpoints
Verify via terminal or browser:
- **Health Check:** `http://localhost:5000/api/health`
  ```json
  {
    "success": true,
    "status": "healthy",
    "database": {
      "connected": true,
      "engine": "postgres",
      "name": "postgres"
    }
  }
  ```
- **Categories:** `http://localhost:5000/api/categories`
- **Products:** `http://localhost:5000/api/products`

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@clickcart.com` | `admin123` *(also supports `ClickCart@123`)* |
| **Customer** | `customer@clickcart.com` | `password123` *(also supports `Customer@123`)* |
