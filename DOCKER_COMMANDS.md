# 🚀 DOCKER COMMANDS - COPY AND PASTE

## PHASE 1: CLEANUP (Run these first)

### 1️⃣ Check existing Emolit images
```
docker images | findstr emolit
```

### 2️⃣ Check all containers
```
docker ps -a
```

### 3️⃣ Stop containers
```
docker-compose down
```

### 4️⃣ Remove Emolit images (after seeing Step 1 output)
```
docker rmi emolit-backend emolit-frontend emolit_backend emolit_frontend -f
```

### 5️⃣ Clean Docker system
```
docker system prune -f
```

---

## PHASE 2: BUILD & RUN

### 6️⃣ Build fresh images (takes 5-10 min)
```
docker-compose build --no-cache
```

### 7️⃣ Start containers
```
docker-compose up -d
```

### 8️⃣ Check if running
```
docker-compose ps
```

### 9️⃣ View backend logs
```
docker-compose logs backend
```

### 🔟 View frontend logs
```
docker-compose logs frontend
```

---

## QUICK ACCESS

### View live logs (all services)
```
docker-compose logs -f
```

### Restart everything
```
docker-compose restart
```

### Stop everything
```
docker-compose down
```

---

## OR USE THE BATCH FILES:

1. **Double-click** `docker_cleanup.bat` - Cleans old images
2. **Double-click** `docker_build_and_run.bat` - Builds and starts everything

---

## WHAT TO SHARE WITH ME:

After running each command, copy and paste the output here so I can verify everything is working correctly!

Start with Step 1 👆
