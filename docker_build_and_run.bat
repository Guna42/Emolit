REM ================================
REM BUILD AND RUN DOCKER CONTAINERS
REM ================================

@echo off
echo.
echo ========================================
echo Building Docker Images (This may take 5-10 minutes)
echo ========================================
echo.
docker-compose build --no-cache
echo.

if errorlevel 1 (
    echo ❌ Build failed! Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Containers
echo ========================================
echo.
docker-compose up -d
echo.

if errorlevel 1 (
    echo ❌ Failed to start containers! Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Containers Started Successfully!
echo ========================================
echo.
echo Backend running on: http://localhost:8000
echo Frontend running on: http://localhost
echo.
echo Checking container status...
echo.
docker-compose ps
echo.
echo ========================================
echo Showing Backend Logs (last 20 lines)
echo ========================================
docker-compose logs --tail=20 backend
echo.
echo ========================================
echo Press any key to view live logs (Ctrl+C to exit logs)
echo ========================================
pause
docker-compose logs -f
