REM ================================
REM DOCKER CLEANUP COMMANDS
REM Run these one by one
REM ================================

@echo off
echo.
echo ========================================
echo STEP 1: Check Existing Emolit Images
echo ========================================
docker images | findstr emolit
echo.
pause

echo.
echo ========================================
echo STEP 2: Check Running Containers
echo ========================================
docker ps -a
echo.
pause

echo.
echo ========================================
echo STEP 3: Stop All Containers
echo ========================================
docker-compose down
echo.
pause

echo.
echo ========================================
echo STEP 4: Remove Emolit Images
echo ========================================
docker rmi emolit-backend emolit-frontend emolit_backend emolit_frontend -f
echo.
pause

echo.
echo ========================================
echo STEP 5: Clean Docker System
echo ========================================
docker system prune -f
echo.
pause

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo Now you can build fresh Docker images
echo ========================================
echo.
pause
