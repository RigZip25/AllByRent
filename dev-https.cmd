@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
echo.
echo  HTTPS mode — Safari on iPhone often BLOCKS this (self-signed certificate).
echo  Prefer dev.cmd (HTTP) on iPhone; enter your street address manually.
echo.
set VITE_DEV_HTTPS=true
node "node_modules\vite\bin\vite.js"
