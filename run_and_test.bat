@echo off
setlocal EnableDelayedExpansion
title VANGUARD V2 - Run and Verify Master Suite
color 0B

echo ==============================================================================
echo              VANGUARD V2 - Rural Governance ^& Emergency Ecosystem
echo                           Interactive Master Runner
echo ==============================================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js v18 or v20+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

if /i "%1"=="start" goto START_SERVER
if /i "%1"=="test" goto RUN_TESTS
if /i "%1"=="seed" goto SEED_DB
if /i "%1"=="build" goto RUN_BUILD
if /i "%1"=="all" goto FULL_PIPELINE
if /i "%1"=="docs" goto OPEN_DOCS

:MENU
cls
echo ==============================================================================
echo              VANGUARD V2 - Rural Governance ^& Emergency Ecosystem
echo ==============================================================================
echo  [1] Start VANGUARD Local Server ^& Auto-Launch Browser (http://localhost:3000)
echo  [2] Run Master Automated Verification Tests (Triage, GIS, Haversine, Grades)
echo  [3] Reset, Sync ^& Re-Seed Database (SQLite dev.db with multi-district data)
echo  [4] Run Next.js Production Build Test (Compiles all 48 static/dynamic routes)
echo  [5] Run Full Diagnostics ^& Launch (Test + Build + Start Server)
echo  [6] Open Official Documentation ^& Usage Guide
echo  [7] Exit
echo ==============================================================================
set "CHOICE="
set /p CHOICE="Enter choice [1-7]: "

if not defined CHOICE goto MENU
if "%CHOICE%"=="1" goto START_SERVER
if "%CHOICE%"=="2" goto RUN_TESTS
if "%CHOICE%"=="3" goto SEED_DB
if "%CHOICE%"=="4" goto RUN_BUILD
if "%CHOICE%"=="5" goto FULL_PIPELINE
if "%CHOICE%"=="6" goto OPEN_DOCS
if "%CHOICE%"=="7" goto EXIT_SCRIPT

echo Invalid option, please try again.
ping 127.0.0.1 -n 2 >nul
goto MENU

:START_SERVER
cls
echo ==============================================================================
echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing npm dependencies, please wait...
    call npm.cmd install
) else (
    echo Dependencies verified.
)

echo.
echo [2/3] Freeing Port 3000 if occupied...
powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"

echo.
echo [3/3] Launching Next.js server and auto-opening browser...
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

if exist ".next\BUILD_ID" (
    echo Resetting stale production build cache for smooth dev hot-reloading...
    powershell -NoProfile -Command "if (Test-Path .next) { Remove-Item -Recurse -Force .next }"
)

echo.
echo ==============================================================================
echo  VANGUARD is starting on http://localhost:3000
echo  Your browser will open automatically in 3 seconds.
echo  Press Ctrl+C to stop the server at any time.
echo ==============================================================================
echo.
call npm.cmd run dev
pause
goto MENU

:RUN_TESTS
cls
echo ==============================================================================
echo  Running VANGUARD Master Architectural Verification Test Suite
echo ==============================================================================
echo.
call npx.cmd tsx scratch/verify-master-suite.ts
if not "%1"=="" exit /b %errorlevel%
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:SEED_DB
cls
echo ==============================================================================
echo  Synchronizing SQLite Database Schema and Seeding Multi-District Profiles
echo ==============================================================================
echo.
call npx.cmd prisma db push
call npx.cmd tsx prisma/seed.ts
if not "%1"=="" exit /b %errorlevel%
echo.
echo Database is fully synchronized and seeded!
echo Press any key to return to menu...
pause >nul
goto MENU

:RUN_BUILD
cls
echo ==============================================================================
echo  Running Next.js Production Compilation and Static Page Generation Test
echo ==============================================================================
echo.
call npm.cmd run build
echo.
if %errorlevel% equ 0 (
    color 0A
    echo [SUCCESS] Next.js production build succeeded with 0 errors!
) else (
    color 0C
    echo [FAILURE] Build failed. Review error output above.
)
if not "%1"=="" exit /b %errorlevel%
echo.
echo Press any key to return to menu...
pause >nul
color 0B
goto MENU

:FULL_PIPELINE
cls
echo ==============================================================================
echo  STEP 1: Running Automated Architecture Verification Tests
echo ==============================================================================
call npx.cmd tsx scratch/verify-master-suite.ts
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed. Aborting pipeline.
    pause
    goto MENU
)

echo.
echo ==============================================================================
echo  STEP 2: Building Optimized Production Bundle
echo ==============================================================================
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Production build failed. Aborting pipeline.
    pause
    goto MENU
)

echo.
echo ==============================================================================
echo  STEP 3: Starting Production Application Server
echo ==============================================================================
powershell -NoProfile -Command "$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conn) { foreach ($c in $conn) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"
call npm.cmd run start
pause
goto MENU

:OPEN_DOCS
cls
if exist "VANGUARD_V2_USAGE_MANUAL.md" (
    start "" notepad.exe VANGUARD_V2_USAGE_MANUAL.md
) else (
    start "" notepad.exe USAGE_GUIDE.md
)
goto MENU

:EXIT_SCRIPT
echo Exiting VANGUARD runner. Have a productive day!
timeout /t 1 >nul
exit /b 0
