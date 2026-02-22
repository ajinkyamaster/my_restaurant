# Smart Restaurant Management System

An end-to-end QR-based restaurant ordering and table management system with AI-powered analytics and future trend prediction.

Built with a **Next.js** frontend and **Express.js** API backend, deployed as two independent services.

> **Live Demo:**  
> Frontend: [my-restaurant-frontend-43pp.onrender.com](https://my-restaurant-frontend-43pp.onrender.com)  
> Backend API: [my-restaurant-1-bdhy.onrender.com](https://my-restaurant-1-bdhy.onrender.com)

---

## Overview

Digitizes the complete dine-in workflow — QR-based table sessions, real-time order management, and ML-driven business insights. Designed strictly for on-premise dine-in (no advance/remote booking).

**Three role-based panels:** Customer · Manager · Admin

---

## Architecture

```
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│   Next.js Frontend   │──────▶│   Express.js API      │──────▶│   MongoDB    │
│   (Render - Static)  │ JSON  │   (Render - Server)   │       │   (Atlas)    │
└──────────────────────┘       └──────────┬───────────┘       └──────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │  Python FastAPI   │
                                │  (ML Predictions) │
                                └──────────────────┘
```

The frontend was **migrated from server-rendered EJS templates to a Next.js (React) app**. The backend now serves only JSON API endpoints — all EJS views, SSR routes, and view-specific middlewares have been removed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React, TypeScript, CSS Modules |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose-free, native driver) |
| **AI/ML** | Python, FastAPI, Linear Regression, Random Forest |
| **Deployment** | Render (frontend + backend as separate services) |
| **Auth** | Session-based (express-session + connect-mongo) |

---

## Customer Panel

### Table Booking
- **QR-Based (Primary):** Scan QR on the table → book page auto-fills table number, non-editable. Ensures physical presence.
- **Manual Entry (Temporary Fallback):** Customer types table number. Will be removed once all tables have QR codes.

### Ordering Flow
1. Book a table → session created (links customer, table, cart)
2. Browse digital menu → add items to cart
3. Review cart → place order → checkout
4. View order history & payment summary

### Payment
- Currently simulated (redirects to success page)
- Payment-gateway ready (Razorpay / Stripe / UPI can be plugged in)

### End Session
- Customer ends session after dining
- Clears cart, orders, customer data & vacates the table
- Ensures data privacy and table availability accuracy

---

## Manager Panel

- Secure login with session-based auth
- View all active orders across tables
- Accept/confirm orders (reflected in real-time on customer side)
- Enables kitchen–service coordination

---

## Admin Panel

- Dashboard with live stats (tables, orders, bookings, revenue)
- CRUD: menu items & tables
- View all bookings with active/expired status
- Manage managers & admins (create, vacate)
- **AI Analytics:** weekly revenue/expense/profit trends with ML predictions
- **End-of-Day Reset:** clears all bookings, orders & sessions

---

## AI-Powered Analytics

The admin panel includes an ML-driven analytics dashboard:
- Trained on historical weekly sales data
- **Models:** Linear Regression + Random Forest Regressor
- **Predicts:** next-week revenue, expenses, profit
- Served via Python FastAPI microservice

---

## Project Structure

```
my_restaurant/
├── app.js                    # Express entry point (API-only)
├── controllers/
│   ├── baseController.js     # Menu & session API
│   └── customer/             # Cart, orders, session, tables API
├── routes/
│   ├── customer/api.js       # /api/* routes
│   ├── admin/api.js          # /api/admin/* routes
│   └── manager/api.js        # /api/manager/* routes
├── models/                   # MongoDB data access (unchanged)
├── session/                  # Session config (cross-site cookie support)
├── frontend/                 # Next.js app
│   ├── app/                  # Pages (customer, admin, manager)
│   ├── components/           # Reusable UI components
│   ├── utils/                # API client functions
│   └── styles/               # Theme & global styles
└── future_trends/            # Python FastAPI ML service
```

---

## Local Development

```bash
# Backend
npm install
npm run dev          # Starts Express on :5000

# Frontend
cd frontend
npm install
npm run dev          # Starts Next.js on :3000

# AI Service (optional)
cd future_trends
pip install -r requirements.txt
uvicorn app:app --port 8000
```

Create a `.env` in root:
```
MONGO_URI=your_mongodb_uri
DB_NAME=my_restro
SESSION_SECRET=your_secret
```

---

## Deployment (Render)

Two separate Render Web Services from the same GitHub repo:

| Service | Root Directory | Build Command | Start Command |
|---------|---------------|---------------|---------------|
| **Backend** | *(root)* | `npm install` | `node app.js` |
| **Frontend** | `frontend` | `npm install && npm run build` | `npm start` |

**Environment variables:**

| Service | Key | Value |
|---------|-----|-------|
| Backend | `NODE_ENV` | `production` |
| Backend | `FRONTEND_URL` | `https://your-frontend.onrender.com` |
| Frontend | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

---

## Key Highlights

- QR-based table session architecture
- Migrated from EJS to Next.js (React) frontend
- Backend serves pure JSON API — no server-rendered views
- Cross-site cookie support for split deployments
- Session-based auth for all three panels
- AI-powered business analytics with ML predictions
- Payment-gateway-ready architecture
- End-of-day reset for data cleanliness
