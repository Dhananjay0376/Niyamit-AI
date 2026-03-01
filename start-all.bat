@echo off
echo Starting AI Content Planner...
echo.
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm install && npm start"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Starting Frontend (Vite)...
start "Frontend Server" cmd /k "npm run dev"
echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul
taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Server*" /T /F
