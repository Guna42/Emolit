@echo off
echo ========================================
echo Starting Emolit Backend Server
echo ========================================
echo.

cd /d "%~dp0"
echo Location: %CD%
echo.

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting backend on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --port 8000
