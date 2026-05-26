@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
echo.
echo  AllByRent PWA dev server
echo  Safari / iPhone: use HTTP (this script). Open the Network URL from the terminal.
echo  Example: http://192.168.1.161:5175  (port varies — use the Network URL below)
echo  Geolocation on phone needs HTTPS — use dev-https.cmd on PC only, or enter address manually.
echo.
set VITE_DEV_HTTPS=
node "node_modules\vite\bin\vite.js"
