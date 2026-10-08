# ClickCart — Deployment & Environment Variables Guide

This guide details all environment variables, build settings, and configuration steps for deploying ClickCart to cloud hosting providers (e.g. **Voroa**, **Render**, **Railway**, **Vercel**).

---

## 1. Architecture Overview

ClickCart is composed of two services:
1. **Frontend Client (`/client`):** Vite + React SPA styled with Tailwind CSS.
2. **Backend Server (`/server`):** Express REST API with JWT authentication and dual-engine database layer (MySQL with automatic fallback to embedded SQLite).

---

## 2. Environment Variables Reference

### Client (Frontend) — `/client`

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `VITE_API_URL` | Optional | `/api` | Base URL of your backend REST API. If deploying client and server on separate domains, point this to your backend domain. | `https://clickcart-api.onrender.com/api` |

> **Note for Static Frontend Deployments:**
> When deploying the frontend on a CDN or static host (Voroa / Vercel / Netlify), set `VITE_API_URL` to your hosted backend URL with `/api` suffix.

---

### Server (Backend) — `/server`

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | Port for Express HTTP server (usually auto-assigned by cloud host). | `5000` |
| `NODE_ENV` | Optional | `development` | Runtime environment mode (`production` or `development`). | `production` |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origin (your frontend domain). Use `*` or your frontend URL. | `https://clickcart.getvoroa.com` |
| `JWT_SECRET` | **Recommended** | Built-in secret | Secret string used to sign JWT auth tokens. Use at least 32 characters in production. | `c7f93e2b1a8d4c5e6f0a1b2c3d4e5f6a` |
| `JWT_EXPIRES_IN` | Optional | `1d` | Token validity period. | `7d` |
| `TAX_RATE` | Optional | `0.18` | Standard GST tax calculation rate (0.18 = 18%). | `0.18` |

#### Database Variables (MySQL / Cloud Database)

ClickCart features a **zero-crash dual engine**: if MySQL environment variables are omitted or unreachable, the server automatically boots with its **embedded production SQLite catalog**.

To connect to a managed MySQL service (e.g., Aiven, PlanetScale, Railway, Supabase, TiDB):

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `DB_HOST` | Optional | `localhost` | Database host hostname or IP | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | Optional | `3306` | MySQL TCP port | `3306` |
| `DB_USER` | Optional | `root` | Database username | `clickcart_user` |
| `DB_PASSWORD` | Optional | `""` | Database user password | `SecretPass123!` |
| `DB_NAME` | Optional | `ecommerce_db` | Database schema name | `ecommerce_db` |

---

## 3. Deploying to Voroa (`app.getvoroa.com`)

### Frontend (Client SPA)
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  ```env
  VITE_API_URL=https://<your-backend-domain>/api
  ```

### Backend (Node.js API)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  ```env
  NODE_ENV=production
  PORT=5000
  CORS_ORIGIN=*
  JWT_SECRET=clickcart_super_secure_secret_production_2026
  ```

---

## 4. Single-Command Monorepo Deployment (Render / Railway)

If deploying the repository as a unified web service:

- **Build Command:**
  ```bash
  npm run install:all && npm run build
  ```
- **Start Command:**
  ```bash
  npm run server
  ```

---

## 5. Built-In Demo Accounts

The backend automatically creates demo accounts on initial boot:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@clickcart.com` | `admin123` |
| **Customer** | `customer@clickcart.com` | `password123` |

Both accounts are pre-configured with active session credentials and demo order history.
