# 🐳 Docker Deployment Guide for Emolit

## 📋 Pre-Deployment Checklist

### ✅ What We Fixed for Docker:
1. **Frontend Proxy** - Now environment-aware (localhost for dev, backend:8000 for Docker)
2. **Backend Environment** - Uses MongoDB Atlas from .env file
3. **Removed Local MongoDB** - Not needed since we use MongoDB Atlas
4. **Port Mapping** - Backend on 8000, Frontend on 80
5. **Container Names** - For easier management

---

## 🚀 Step-by-Step Docker Deployment

### **Step 1: Clean Up Old Docker Artifacts**

Run these commands one by one and share the output:

```bash
# 1. Check existing Docker images
docker images | findstr emolit

# 2. Check running containers
docker ps -a

# 3. Stop all containers
docker-compose down

# 4. Remove old Emolit images (wait for Step 1 output first)
docker rmi emolit-backend emolit-frontend -f

# 5. Or force remove by container name if needed
docker rmi emolit-backend emolit-frontend emolit_backend emolit_frontend -f

# 6. Clean up unused Docker resources
docker system prune -f
```

---

### **Step 2: Verify Environment Configuration**

Make sure your `.env` file in the root has:
```env
MONGODB_URI="mongodb+srv://gunavardhanbyraju:gunavardhanbyraju744@cluster0.sa65lk4.mongodb.net/"
MONGODB_DB="emolit"
OPENAI_API_KEY=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
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

---

### **Step 3: Build Docker Images**

```bash
# Build both frontend and backend
docker-compose build --no-cache

# This will:
# - Build backend image with Python dependencies
# - Build frontend image with React production build
# - Take 5-10 minutes depending on your internet speed
```

---

### **Step 4: Start the Containers**

```bash
# Start all services in detached mode
docker-compose up -d

# Expected output:
# Creating emolit-backend ... done
# Creating emolit-frontend ... done
```

---

### **Step 5: Verify Services are Running**

```bash
# Check container status
docker-compose ps

# Should show:
# Name                  State    Ports
# emolit-backend        Up       0.0.0.0:8000->8000/tcp
# emolit-frontend       Up       0.0.0.0:80->80/tcp
```

---

### **Step 6: Check Backend Logs**

```bash
# View backend logs
docker-compose logs backend

# You should see:
# ✅ MongoDB connected successfully
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### **Step 7: Check Frontend Logs**

```bash
# View frontend logs
docker-compose logs frontend

# Should show nginx started successfully
```

---

### **Step 8: Test the Application**

1. **Open browser**: `http://localhost`
2. **Login** with: `gunavardhan779@gmail.com`
3. **Should work!** ✅

---

## 🔍 Troubleshooting Commands

### View live logs:
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart services:
```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend

# Restart frontend only
docker-compose restart frontend
```

### Stop services:
```bash
docker-compose down
```

### Rebuild after code changes:
```bash
# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## 📊 Docker Architecture

```
┌─────────────────────────────────────────┐
│           Your Machine                  │
│                                         │
│  ┌────────────────────────────────┐    │
│  │   Frontend Container           │    │
│  │   (nginx)                      │    │
│  │   Port: 80                     │    │
│  │   Routes /api -> backend:8000  │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│             ▼                           │
│  ┌────────────────────────────────┐    │
│  │   Backend Container            │    │
│  │   (FastAPI)                    │    │
│  │   Port: 8000                   │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│             ▼                           │
│     MongoDB Atlas (Cloud)               │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Commands Reference

```bash
# START: Build and run
docker-compose up -d --build

# VIEW: Check status
docker-compose ps

# LOGS: View backend logs
docker-compose logs -f backend

# STOP: Stop all services
docker-compose down

# CLEAN: Remove everything including volumes
docker-compose down -v
docker system prune -a -f
```

---

## ✨ What's Different in Docker vs Local?

| Aspect | Local Development | Docker |
|--------|------------------|---------|
| Backend URL | `localhost:8000` | `backend:8000` (service name) |
| Frontend URL | `localhost:3000` | `localhost:80` |
| MongoDB | MongoDB Atlas | MongoDB Atlas (same) |
| Hot Reload | ✅ Yes | ❌ No (need rebuild) |
| Isolation | ❌ Shares host | ✅ Isolated containers |

---

## 🚨 Common Issues & Solutions

### Issue 1: "port is already allocated"
**Solution:**
```bash
# Stop existing services using those ports
docker-compose down
# Or change ports in docker-compose.yml
```

### Issue 2: MongoDB connection failed
**Solution:** Check your .env file has correct MongoDB Atlas URI

### Issue 3: Frontend can't reach backend
**Solution:** Make sure both containers are running:
```bash
docker-compose ps
```

### Issue 4: Code changes not reflected
**Solution:** Rebuild the images:
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📝 Next Steps After Deployment

1. Test all features (login, journal, search)
2. Check both container logs for errors
3. If everything works, you can deploy to cloud!
4. For production, consider using environment-specific .env files

---

**Start with Step 1 commands and share the output!** 🚀
