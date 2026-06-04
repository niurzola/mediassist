@echo off
title MediAssist - Instalacija i pokretanje
cd /d "%~dp0"

echo ============================================
echo   MediAssist - Instalacija i pokretanje
echo ============================================
echo.

REM === Provjera Node.js ===
echo [1/4] Provjeravam Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js nije instaliran.
    echo Instaliraj Node.js 20+ s: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%a
if "%NODE_MAJOR%"=="" set NODE_MAJOR=0
if %NODE_MAJOR% lss 20 (
    echo ERROR: Node.js 20+ je potreban. Trenutna verzija: %NODE_MAJOR%
    pause
    exit /b 1
)
echo Node.js verzija: %NODE_MAJOR% - OK
echo.

REM === Instalacija backend dependencies ===
echo [2/4] Instaliram backend dependencies...
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo ERROR: Mapa 'backend' nije pronadjena.
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Neuspjela instalacija backend dependencies.
    pause
    exit /b 1
)
echo Backend dependencies instalirani.
echo.

REM === Instalacija frontend dependencies ===
echo [3/4] Instaliram frontend (Quasar) dependencies...
cd /d "%~dp0mediassist"
if %errorlevel% neq 0 (
    echo ERROR: Mapa 'mediassist' nije pronadjena.
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Neuspjela instalacija frontend dependencies.
    pause
    exit /b 1
)
echo Frontend dependencies instalirani.
echo.

REM === Pokretanje servera ===
echo [4/4] Pokrecem servere...

cd /d "%~dp0backend"
start "MediAssist Backend" cmd /c "node app.js"

timeout /t 3 /nobreak >nul

cd /d "%~dp0mediassist"
start "MediAssist Frontend" cmd /c "npx quasar dev"

echo.
echo ============================================
echo   MediAssist je pokrenut!
echo   Backend: http://localhost:3000
echo   Frontend: http://localhost:9000
echo ============================================
echo.
echo Prozor se zatvara za 5 sekundi...
timeout /t 5 /nobreak >nul
