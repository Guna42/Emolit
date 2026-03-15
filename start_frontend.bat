@echo off
echo ========================================
echo Starting Emolit Frontend
echo ========================================
echo.

cd /d "%~dp0\frontend"
echo Location: %CD%
echo.

echo Starting React development server...
echo Frontend will run on http://localhost:3000
echo Backend proxy points to http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
