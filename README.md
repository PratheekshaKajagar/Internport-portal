# 🚀 InternPort — PERN Stack

Internship application portal rebuilt with the **PERN stack**:
**PostgreSQL + Express + React + Node.js**

---

## 🛠 Tech Stack

| Layer | Original | PERN Version |
|-------|----------|--------------|
| **Frontend** | Vanilla HTML/JS | ⚛️ React 18 + React Router |
| **Backend** | Python (FastAPI) | 🟩 Node.js + Express |
| **Database** | PostgreSQL / MySQL | 🐘 PostgreSQL only |
| **Auth** | python-jose + passlib | 🔑 jsonwebtoken + bcryptjs |
| **Build tool** | — | ⚡ Vite |
| **ORM** | SQLAlchemy | 🐘 pg (node-postgres) |

---

## ⚡ Quick Start (Local)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Database Setup
```sql
CREATE DATABASE internport;
```

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Install & Run Backend
```bash
cd backend
npm install
npm run dev   # or: npm start
# API runs at http://localhost:5000
```

### 5. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 6. Open in Browser

| Page | URL |
|------|-----|
| 🌐 Portal | http://localhost:5173 |
| 📝 Apply | http://localhost:5173/apply |
| 🔐 Admin Login | http://localhost:5173/admin/login |
| 📊 Dashboard | http://localhost:5173/admin/dashboard |

---

## 🔑 Default Admin Credentials
| Field | Value |
|-------|-------|
| Email | admin@internport.com |
| Password | admin123 |

---

## 🌐 Deploy for FREE — Live Link

### Option A: Railway (Recommended — Easiest)
Railway gives you a free PostgreSQL + Node.js hosting in minutes.

1. **Create account** at https://railway.app
2. **New Project → Deploy from GitHub** (push your code first)
3. **Add PostgreSQL** service in Railway dashboard
4. **Set environment variables** for backend:
   ```
   DB_HOST=<railway postgres host>
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASS=<railway postgres password>
   JWT_SECRET=your-secret-here
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
5. Deploy backend → get URL like `https://internport-backend.railway.app`
6. **Deploy frontend to Vercel** (see Option B)

### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Push code to GitHub
2. Import at https://vercel.com/new
3. Set Root Directory: `frontend`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy → get live URL!

**Backend (Railway):**
Follow Option A steps above.

### Option C: Render (Full Free Tier)

**Backend on Render:**
1. https://render.com → New Web Service
2. Connect GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add PostgreSQL database (New → PostgreSQL)
7. Copy database connection string to env vars

**Frontend on Render:**
1. New Static Site
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Set `VITE_API_URL` to your backend URL

### Option D: Self-hosted (VPS / DigitalOcean)
```bash
# On server:
git clone <your-repo>
cd internport-pern

# Backend
cd backend && npm install
cp .env.example .env  # configure .env
pm2 start server.js --name internport-api

# Frontend build
cd ../frontend && npm install
VITE_API_URL=http://your-server:5000 npm run build
# Serve /dist with nginx
```

---

## 📁 Project Structure

```
internport-pern/
├── backend/
│   ├── server.js          # Express app entry
│   ├── database.js        # PostgreSQL pool (pg)
│   ├── initDB.js          # Table creation + admin seed
│   ├── auth.js            # JWT + bcrypt helpers
│   ├── routes/
│   │   ├── auth.js        # POST /api/auth/login, GET /api/auth/me
│   │   ├── applications.js # CRUD for applications
│   │   └── stats.js       # GET /api/admin/stats
│   ├── uploads/           # Uploaded resumes
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Router setup
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css      # Global styles
│   │   ├── api/index.js   # API client
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── Toast.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Apply.jsx
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       └── AdminApplications.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json           # Root scripts
└── README.md
```

---

## ✨ Features (Same as original)
- ✅ Public application form with resume upload (PDF/DOC/DOCX)
- ✅ Admin dashboard with stats & position breakdown chart
- ✅ Search, filter by status/position, pagination
- ✅ Status management: Pending → Selected / Rejected
- ✅ Detail modal with full applicant view
- ✅ JWT-protected admin panel
- ✅ Animated hero with floating cards
- ✅ Animated stat counters
- ✅ FAQ accordion
- ✅ Toast notifications
- ✅ Responsive (mobile-friendly)

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF