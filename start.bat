@echo off
title Kidvana - Local Server
echo ==========================================
echo    Kidvana - Starting Local Server...
echo ==========================================
echo.

:: Check if Node is available
where node >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Node.js found! Starting server on http://localhost:8080
    echo.
    echo  Open your browser at: http://localhost:8080
    echo  Press Ctrl+C to stop the server
    echo.
    start http://localhost:8080
    call npx -y http-server -p 8080
) else (
    :: Fallback to Python if Node is not found
    where python >nul 2>nul
    if %errorlevel%==0 (
        echo [OK] Python found! Starting server on http://localhost:8000
        echo.
        echo  Open your browser at: http://localhost:8000
        echo  Press Ctrl+C to stop the server
        echo.
        start http://localhost:8000
        python -m http.server 8000
    ) else (
        echo [!] Node.js and Python not found. Opening index.html directly...
        echo.
        start index.html
    )
)

pause
