@echo off
echo ===================================
echo Multi-Country Visa Evaluation Tool
echo ===================================
echo.
echo Starting Backend and Frontend Servers...
echo.

:: Start backend in a new window
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend in a new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================
echo Servers are starting...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Press Ctrl+C in each window to stop the servers
echo ===================================
