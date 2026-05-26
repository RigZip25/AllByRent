@echo off
cd /d "%~dp0"
echo Installing PWA support for AllByRent...
call pnpm add -D vite-plugin-pwa
if errorlevel 1 (
  echo Trying npm instead...
  call npm install -D vite-plugin-pwa --legacy-peer-deps
)
echo.
echo Done. Now double-click dev.cmd to start the app.
pause
