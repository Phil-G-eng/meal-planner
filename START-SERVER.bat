@echo off
echo.
echo  ============================================
echo   Meal Planner - Local Server
echo  ============================================
echo.
echo  Starting server...
echo  Your Meal Planner will open in your browser.
echo.
echo  On your iPad, open Safari and go to:
echo  (Your IP address will be shown below)
echo.

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo  http://%IP%:8080
echo.
echo  Keep this window open while using the app.
echo  Press Ctrl+C to stop the server.
echo.

:: Try Python 3 first, then Python 2, then PowerShell
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Using Python - server running...
    start "" "http://%IP%:8080"
    python -m http.server 8080
    goto :end
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Using Python3 - server running...
    start "" "http://%IP%:8080"
    python3 -m http.server 8080
    goto :end
)

:: Fallback: PowerShell built-in server
echo  Using PowerShell - server running...
start "" "http://%IP%:8080"
powershell -Command "& { $listener = [System.Net.HttpListener]::new(); $listener.Prefixes.Add('http://*:8080/'); $listener.Start(); Write-Host ' Server is running. Press Ctrl+C to stop.'; while ($listener.IsListening) { $context = $listener.GetContext(); $path = $context.Request.Url.LocalPath.TrimStart('/'); if ($path -eq '' -or $path -eq '/') { $path = 'index.html' }; $file = Join-Path (Get-Location) $path; if (Test-Path $file) { $bytes = [System.IO.File]::ReadAllBytes($file); $context.Response.ContentLength64 = $bytes.Length; $context.Response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $context.Response.StatusCode = 404 }; $context.Response.Close() } }"

:end
