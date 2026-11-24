@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  py -m venv .venv
  .venv\Scripts\python.exe -m pip install -r requirements.txt
)
if not exist "config.json" (
  .venv\Scripts\python.exe setup_device.py
)
.venv\Scripts\python.exe presence_qr.py
pause
