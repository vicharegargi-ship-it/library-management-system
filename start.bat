@echo off
title Library Management System - DBMS Frontend
echo ========================================================
echo   Library Management System (DBMS Project)
echo   Starting Pure Web Frontend (Zero Python)
echo ========================================================

:: Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Node.js detected. Launching local web server...
    start "" http://localhost:3000
    node server.js
) else (
    echo Node.js not found in PATH. Opening index.html directly in browser...
    start "" "index.html"
)
pause
