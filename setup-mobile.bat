@echo off
REM Quick Setup Script for MediFlow Mobile App
REM Run this file to set up the mobile app on Windows

echo.
echo ====================================
echo  MediFlow Mobile App - Quick Setup
echo ====================================
echo.

echo [1/5] Installing dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 goto :error

echo.
echo [2/5] Building web app...
call npm run build
if errorlevel 1 goto :error

echo.
echo [3/5] Syncing to mobile platforms...
call npx cap sync
if errorlevel 1 goto :error

echo.
echo [4/5] Running health check...
call npx cap doctor
if errorlevel 1 goto :warning

echo.
echo [5/5] Setup complete!
echo.
echo ====================================
echo  Next Steps:
echo ====================================
echo.
echo For Android development:
echo   npm run mobile:open:android
echo.
echo For iOS development (Mac only):
echo   npm run mobile:open:ios
echo.
echo For more help, see INSTALLATION_GUIDE.md
echo.
goto :end

:error
echo.
echo ❌ Setup failed! Check the error above.
exit /b 1

:warning
echo.
echo ⚠️  Some warnings detected. Check INSTALLATION_GUIDE.md for help.
echo.

:end
echo ✅ All done!
pause
