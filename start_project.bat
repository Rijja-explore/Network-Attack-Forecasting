@echo off
title Network Attack Forecasting
echo ==========================================================
echo   Starting Network Attack Forecasting (SIH-153)
echo ==========================================================

start "FastAPI Backend" "C:\Users\rijja\AppData\Local\Programs\Python\Python311\python.exe" -m uvicorn app.api:app --host 127.0.0.1 --port 8000
timeout /t 2 /nobreak > nul
start http://localhost:5173
cd dashboard
npm run dev
