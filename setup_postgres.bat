@echo off
title Initialize PostgreSQL Database - Library Management System
echo ========================================================
echo   Library Management System - PostgreSQL Setup
echo   PostgreSQL 18.6 Detected on Windows
echo ========================================================
echo.
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

if not exist %PSQL% (
    set PSQL=psql
)

echo Creating database and executing schema_and_seed.sql...
echo (You will be prompted for your PostgreSQL master password)
echo.

%PSQL% -U postgres -h localhost -p 5432 -c "CREATE DATABASE library_management;" 2>nul
%PSQL% -U postgres -h localhost -p 5432 -d library_management -f "%~dp0schema_and_seed.sql"

echo.
echo ========================================================
echo   Done! Tables and initial records created in PostgreSQL.
echo ========================================================
pause
