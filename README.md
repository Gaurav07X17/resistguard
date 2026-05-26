# 🛡️ ResistGuard — AMR Surveillance Platform

A full-stack MERN application for tracking Antimicrobial Resistance (AMR) across clinical and environmental samples.

**Team:** TeachParadox | Gaurav Chhetri, Pratham Chauhan, Deepak Tripathi, Manas Raj

---

## Project Structure

```
resistguard/
├── backend/          ← Node.js + Express + MongoDB API
└── frontend/         ← React + Recharts SPA
```

---

## Quick Start

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up environment variables

```bash
# In /backend, copy and fill in:
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/resistguard
JWT_SECRET=change_this_to_a_random_string
```

### 3. Seed demo data

```bash
cd backend
node config/seed.js
```

This creates two demo accounts:
- **Researcher:** `researcher@demo.com` / `password123`
- **Technician:** `technician@demo.com` / `password123`

### 4. Run the app

```bash
# Terminal 1 — Backend (runs on port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (runs on port 3000)
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET  | `/api/auth/me` | 🔒 Any | Current user |
| GET  | `/api/samples` | 🔒 Any | List samples (filterable) |
| POST | `/api/samples` | 🔒 Any | Submit new sample |
| GET  | `/api/samples/:id` | 🔒 Any | Sample detail |
| PUT  | `/api/samples/:id` | 🔒 Researcher/Admin | Update sample |
| DELETE | `/api/samples/:id` | 🔒 Admin | Delete sample |
| GET  | `/api/stats/summary` | 🔒 Any | Dashboard counts |
| GET  | `/api/stats/resistance` | 🔒 Researcher | R/S/I ratios |
| GET  | `/api/stats/hotspots` | 🔒 Researcher | Location heatmap data |
| GET  | `/api/stats/trends` | 🔒 Researcher | Monthly trends |
| GET  | `/api/pathogens` | 🔒 Any | CLSI pathogen/antibiotic reference |

---

## Role-Based Access Control

| Feature | Technician | Researcher | Admin |
|---------|-----------|------------|-------|
| Submit samples | ✅ | ✅ | ✅ |
| View sample list | ✅ | ✅ | ✅ |
| Analytics dashboard | ❌ | ✅ | ✅ |
| Edit samples | ❌ | ✅ | ✅ |
| Delete samples | ❌ | ❌ | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Styling | Custom CSS with design tokens (no external UI lib) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| Standards | CLSI M100 breakpoints for S/I/R classification |

---

## Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`)

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `REACT_APP_API_URL=https://your-render-url.onrender.com/api`

---

## Portfolio Additions (Roadmap)

- [ ] **Leaflet.js heatmap** — Plot resistance hotspots on a real map
- [ ] **CSV bulk upload** — Let technicians upload Excel sheets
- [ ] **PDF antibiogram export** — jsPDF report generation
- [ ] **PWA / offline mode** — Service worker for intermittent connectivity
- [ ] **WebSocket live updates** — Real-time dashboard refresh

---

## References

- [WHO GLASS Initiative](https://www.who.int/initiatives/glass)
- [CLSI Guidelines](https://clsi.org)
- [WHONET](https://whonet.org)
- [One Health AMR Framework](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9047147/)
