@echo off
echo.
echo  ============================================
echo   Meal Planner - Local Server (HTTPS)
echo  ============================================
echo.

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo  Your Meal Planner address for iPad Safari:
echo.
echo     https://%IP%:8443
echo.
echo  IMPORTANT - first time only on iPad:
echo  Safari will warn "not secure" - tap
echo  Show Details then Visit Website to proceed.
echo  This is normal for a local network server.
echo.
echo  Keep this window open while using the app.
echo  Press Ctrl+C to stop.
echo.

:: Write Caddyfile
echo {>Caddyfile
echo     local_certs>>Caddyfile
echo     auto_https off>>Caddyfile
echo }>>Caddyfile
echo.>>Caddyfile
echo https://0.0.0.0:8443 {>>Caddyfile
echo     tls internal>>Caddyfile
echo     root * .>>Caddyfile
echo     file_server>>Caddyfile
echo }>>Caddyfile

:: Check caddy is present
if not exist caddy.exe (
    echo  ERROR: caddy.exe not found in this folder.
    echo  Download from: https://caddyserver.com/download
    echo  Choose: Windows amd64
    echo  Place caddy.exe in this folder and try again.
    echo.
    pause
    goto :end
)

caddy run --config Caddyfile

:end
