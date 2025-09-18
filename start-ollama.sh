#!/bin/bash

# Quick start script for Ollama with Axgrin backend

echo "🦙 Starting Ollama for Axgrin Backend"
echo "======================================"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install it first:"
    echo "   Visit: https://ollama.ai/download"
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "🚀 Starting Ollama service..."
    ollama serve &
    sleep 3
fi

# Check if llama2 model is installed
if ! ollama list | grep -q "llama2"; then
    echo "📦 Installing llama2 model (this may take a few minutes)..."
    ollama pull llama2
fi

# Test Ollama
echo "🧪 Testing Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running successfully!"
    echo "📦 Available models:"
    ollama list
else
    echo "❌ Failed to start Ollama. Please check the logs."
    exit 1
fi

echo ""
echo "🎉 Ollama is ready for Axgrin backend!"
echo ""
echo "Next steps:"
echo "1. Add these to your .env file:"
echo "   AI_PROVIDER=local"
echo "   LOCAL_AI_URL=http://localhost:11434"
echo "   LOCAL_AI_MODEL=llama2"
echo ""
echo "2. Start your Axgrin backend:"
echo "   npm run start:dev"
echo ""
echo "3. Test the integration:"
echo "   node test-ollama.js"
echo ""
echo "🦙 Ollama is running in the background. Press Ctrl+C to stop."
