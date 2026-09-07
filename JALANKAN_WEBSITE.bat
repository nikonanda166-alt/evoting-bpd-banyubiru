@echo off
title E-VOTING BPD DESA BANYUBIRU (2027-2034)
color 1F

echo ========================================================
echo   PELUNCURAN APLIKASI E-VOTING BPD DESA BANYUBIRU
echo   Kabupaten Semarang - Periode 2027-2034
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa modul dependensi...
if not exist "node_modules\" (
    echo Mengunduh modul yang diperlukan (hanya sekali saat pertama kali)...
    call npm install
)

echo [2/3] Memulai server E-Voting...
start "" http://localhost:3000
start "" http://localhost:3000/admin

echo [3/3] Server aktif di:
echo       - Halaman Pemilih: http://localhost:3000
echo       - Dashboard Admin: http://localhost:3000/admin
echo.
echo ========================================================
echo   JANGAN TUTUP JENDELA INI SELAMA APLIKASI DIGUNAKAN
echo ========================================================
echo.

node backend/server.js
pause
