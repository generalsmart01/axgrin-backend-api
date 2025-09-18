# 🦙 Ollama Integration for Axgrin Backend

This guide helps you set up Ollama (local AI) with your Axgrin backend for free, private AI-powered financial advice.

## 🚀 Quick Start

### 1. Install Ollama

**Windows:**

```bash
# Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

**macOS:**

```bash
# Download from https://ollama.ai/download
# Or use Homebrew
brew install ollama
```

**Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Start Ollama

**Windows:**

```cmd
start-ollama.bat
```

**macOS/Linux:**

```bash
chmod +x start-ollama.sh
./start-ollama.sh
```

**Manual:**

```bash
# Start Ollama service
ollama serve

# Install a model (in another terminal)
ollama pull llama2
```

### 3. Configure Axgrin

Add to your `.env` file:

```env
AI_PROVIDER=local
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2
```

### 4. Test Integration

```bash
# Test Ollama
node test-ollama.js

# Start Axgrin backend
npm run start:dev
```

## 📊 Available Models

| Model         | Size | Speed  | Quality | Best For                 |
| ------------- | ---- | ------ | ------- | ------------------------ |
| **llama2**    | 7B   | Medium | Good    | General financial advice |
| **mistral**   | 7B   | Fast   | Good    | Quick responses          |
| **codellama** | 7B   | Medium | Good    | Technical queries        |

## 🔧 Configuration

### Model Parameters

You can customize the AI behavior by modifying `src/ai/real-ai.service.ts`:

```typescript
// In LocalAIProvider class
body: JSON.stringify({
  model: 'llama2',
  prompt: `${this.getSystemPrompt(context)}\n\nUser Question: ${prompt}`,
  stream: false,
  options: {
    temperature: 0.7,        // Creativity (0.0-1.0)
    top_p: 0.9,             // Diversity (0.0-1.0)
    top_k: 40,              // Vocabulary size
    repeat_penalty: 1.1,    // Avoid repetition
  },
}),
```

### Environment Variables

```env
# Required
AI_PROVIDER=local
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2

# Optional
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=1000
DEBUG_AI=false
```

## 🚀 Usage

### Basic Chat

```bash
curl -X POST http://localhost:3300/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I save more money?"}'
```

### Response Format

```json
{
  "response": "Based on your spending patterns, here are some ways to save more money...",
  "insights": {
    "spendingAnalysis": {
      /* ... */
    },
    "savingsOpportunities": [
      /* ... */
    ]
  },
  "suggestedActions": [
    "Set up automatic savings",
    "Reduce dining out expenses",
    "Create a budget plan"
  ],
  "conversationId": "clx1234567890abcdef",
  "confidence": 0.9,
  "aiGenerated": true
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Ollama not starting:**

   ```bash
   # Check if port 11434 is available
   netstat -an | grep 11434

   # Kill any process using the port
   sudo lsof -ti:11434 | xargs kill -9
   ```

2. **Model not found:**

   ```bash
   # List available models
   ollama list

   # Pull the model
   ollama pull llama2
   ```

3. **Out of memory:**

   ```bash
   # Use a smaller model
   ollama pull mistral

   # Or use quantized version
   ollama pull llama2:7b-chat-q4_0
   ```

### Debug Mode

Enable debug logging:

```env
DEBUG_AI=true
LOG_LEVEL=debug
```

## 📈 Performance Tips

1. **Use GPU acceleration** if available
2. **Start with Mistral** for faster responses
3. **Use quantized models** for better performance
4. **Monitor memory usage** regularly
5. **Set appropriate model parameters**

## 🔒 Security

- **Local processing**: All data stays on your machine
- **No external API calls**: Complete privacy
- **Offline capability**: Works without internet
- **Full control**: Customize everything

## 🎯 Benefits

- ✅ **Free**: No API costs
- ✅ **Private**: Data stays local
- ✅ **Fast**: No rate limits
- ✅ **Offline**: Works without internet
- ✅ **Customizable**: Full control over AI behavior

## 📚 Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Model Library](https://ollama.ai/library)
- [API Reference](https://github.com/jmorganca/ollama/blob/main/docs/api.md)

## 🎉 You're Ready!

Your Axgrin backend now has local AI capabilities powered by Ollama. Enjoy free, private, and powerful financial advice! 🚀💰
