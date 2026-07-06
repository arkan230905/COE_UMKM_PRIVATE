@echo off
echo ========================================
echo   RESTART SIUPIN - Clean Cache
echo ========================================
echo.

echo [1/4] Stopping any running dev server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Cleaning Vite cache...
if exist "node_modules\.vite" (
    rmdir /S /Q "node_modules\.vite"
    echo    - Vite cache deleted
) else (
    echo    - No Vite cache found
)

if exist "dist" (
    rmdir /S /Q "dist"
    echo    - Dist folder deleted
)

echo [3/4] Building application...
call npm run build

echo.
echo [4/4] Starting development server...
echo.
echo ========================================
echo   SERVER STARTING...
echo ========================================
echo.
echo IMPORTANT: After server starts:
echo 1. Open browser in INCOGNITO mode
echo 2. Go to: http://127.0.0.1:3000
echo 3. Or press Ctrl+F5 to hard refresh
echo.
echo ========================================
echo.

call npm run dev
