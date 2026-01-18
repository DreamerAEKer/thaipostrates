@echo off
cd /d "%~dp0"
echo Starting Thai Post Rates Calculator...
echo.
powershell -ExecutionPolicy Bypass -File ".\server.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start.
    pause
)
pause
