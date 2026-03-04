@echo off
title NordPool Monitor
cls

echo.
echo ========================================
echo    NordPool Monitor v4.0
echo ========================================
echo.
echo Starting server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

REM Start the server
node server.js

pause
