@echo off
REM Quick start script for Ollama with Axgrin backend (Windows)

echo 🦙 Starting Ollama for Axgrin Backend
echo ======================================

REM Check if Ollama is installed
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama is not installed. Please install it first:
    echo    Visit: https://ollama.ai/download
    pause
    exit /b 1
)

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo 🚀 Starting Ollama service...
    start /b ollama serve
    timeout /t 3 /nobreak >nul
)

REM Check if llama2 model is installed
ollama list | findstr "llama2" >nul
if %errorlevel% neq 0 (
    echo 📦 Installing llama2 model (this may take a few minutes)...
    ollama pull llama2
)

REM Test Ollama
echo 🧪 Testing Ollama...
curl -s http://localhost:11434/api/tags >nul
if %errorlevel% equ 0 (
    echo ✅ Ollama is running successfully!
    echo 📦 Available models:
    ollama list
) else (
    echo ❌ Failed to start Ollama. Please check the logs.
    pause
    exit /b 1
)

echo.
echo 🎉 Ollama is ready for Axgrin backend!
echo.
echo Next steps:
echo 1. Add these to your .env file:
echo    AI_PROVIDER=local
echo    LOCAL_AI_URL=http://localhost:11434
echo    LOCAL_AI_MODEL=llama2
echo.
echo 2. Start your Axgrin backend:
echo    npm run start:dev
echo.
echo 3. Test the integration:
echo    node test-ollama.js
echo.
echo 🦙 Ollama is running in the background. Press any key to stop.
pause
