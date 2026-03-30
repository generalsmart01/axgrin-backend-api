# Ollama Setup Guide for Axgrin Backend

## 🦙 What is Ollama?

Ollama is a tool that allows you to run large language models locally on your machine. It's perfect for development, testing, and even production if you have sufficient hardware.

## 🚀 Quick Setup

### Step 1: Install Ollama

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

### Step 2: Start Ollama Service

```bash
# Start Ollama (this runs in the background)
ollama serve
```

### Step 3: Install a Model

```bash
# Install Llama2 (recommended for financial advice)
ollama pull llama2

# Or install Mistral (faster, smaller)
ollama pull mistral

# Or install CodeLlama (good for technical queries)
ollama pull codellama
```

### Step 4: Test Ollama

```bash
# Test if Ollama is working
ollama run llama2 "Hello, can you help me with financial advice?"
```

## 🔧 Configure Axgrin for Ollama

### Step 1: Update Environment Variables

Add to your `.env` file:

```env
# AI Configuration for Ollama
AI_PROVIDER=local
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2

# Optional: Configure model parameters
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=1000
```

### Step 2: Update AI Service

The `RealAIService` is already configured for Ollama! It will automatically use the local Ollama instance when `AI_PROVIDER=local`.

### Step 3: Test Integration

```bash
# Start your Axgrin backend
npm run start:dev

# Test the AI endpoint
curl -X POST http://localhost:3300/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I save more money?"}'
```

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama2** | 7B | Medium | Good | General financial advice |
| **mistral** | 7B | Fast | Good | Quick responses |
| **codellama** | 7B | Medium | Good | Technical queries |
| **llama2:13b** | 13B | Slow | Better | Complex financial planning |
| **llama2:70b** | 70B | Very Slow | Excellent | Production use |

## 🛠️ Advanced Configuration

### Custom Model Parameters

Update `src/ai/real-ai.service.ts` to customize Ollama parameters:

```typescript
// In LocalAIProvider class
async generateResponse(prompt: string, context?: any): Promise<string> {
  try {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `${this.getSystemPrompt(context)}\n\nUser Question: ${prompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
        },
      }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    Logger.error('Local AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}
```

### Multiple Models

You can switch between models easily:

```env
# For development (faster)
LOCAL_AI_MODEL=mistral

# For production (better quality)
LOCAL_AI_MODEL=llama2:13b
```

### Model Management

```bash
# List installed models
ollama list

# Remove a model
ollama rm llama2

# Update a model
ollama pull llama2:latest
```

## 🚀 Performance Optimization

### 1. GPU Acceleration

If you have an NVIDIA GPU:

```bash
# Install with CUDA support
curl -fsSL https://ollama.ai/install.sh | sh

# Ollama will automatically use GPU if available
ollama run llama2
```

### 2. Memory Management

```bash
# Set memory limits
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_MAX_QUEUE=512

# Start Ollama with custom settings
ollama serve --host 0.0.0.0 --port 11434
```

### 3. Model Quantization

Use quantized models for better performance:

```bash
# Install quantized version (smaller, faster)
ollama pull llama2:7b-chat-q4_0
```

## 🔍 Monitoring and Debugging

### Check Ollama Status

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check model status
curl http://localhost:11434/api/ps
```

### Debug Mode

Enable debug logging in your Axgrin backend:

```env
DEBUG_AI=true
LOG_LEVEL=debug
```

### Performance Monitoring

```bash
# Monitor Ollama performance
ollama ps

# Check system resources
htop
# or
top
```

## 🐛 Troubleshooting

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

4. **Slow responses:**
   ```bash
   # Check system resources
   htop
   
   # Use a faster model
   ollama pull mistral
   ```

### Logs

```bash
# Check Ollama logs
ollama logs

# Check system logs
journalctl -u ollama
```

## 🚀 Production Deployment

### Docker Setup

```dockerfile
# Dockerfile.ollama
FROM ollama/ollama:latest

# Copy your model files
COPY models/ /root/.ollama/models/

# Expose port
EXPOSE 11434

# Start Ollama
CMD ["ollama", "serve"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_MAX_LOADED_MODELS=2
    restart: unless-stopped

  axgrin-backend:
    build: .
    ports:
      - "3300:3300"
    environment:
      - AI_PROVIDER=local
      - LOCAL_AI_URL=http://ollama:11434
      - LOCAL_AI_MODEL=llama2
    depends_on:
      - ollama

volumes:
  ollama_data:
```

## 📈 Scaling

### Multiple Ollama Instances

```bash
# Run multiple instances on different ports
ollama serve --port 11434
ollama serve --port 11435
ollama serve --port 11436
```

### Load Balancing

Update your Axgrin backend to use multiple Ollama instances:

```typescript
// In RealAIService
private ollamaUrls = [
  'http://localhost:11434',
  'http://localhost:11435',
  'http://localhost:11436',
];

private getRandomOllamaUrl(): string {
  return this.ollamaUrls[Math.floor(Math.random() * this.ollamaUrls.length)];
}
```

## 🎯 Best Practices

1. **Start with Mistral** for development (faster)
2. **Use Llama2** for production (better quality)
3. **Monitor memory usage** regularly
4. **Use quantized models** for better performance
5. **Set up proper logging** for debugging
6. **Test with different models** to find the best fit

## 🔒 Security

### Network Security

```bash
# Bind to localhost only
ollama serve --host 127.0.0.1

# Use reverse proxy for external access
nginx -c /path/to/nginx.conf
```

### Model Security

```bash
# Verify model integrity
ollama verify llama2

# Use trusted model sources only
ollama pull llama2:official
```

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Model Library](https://ollama.ai/library)
- [API Reference](https://github.com/jmorganca/ollama/blob/main/docs/api.md)
- [Community Models](https://huggingface.co/models)

## 🎉 You're Ready!

Your Axgrin backend is now configured to use Ollama for local AI processing. This gives you:

- ✅ **Free AI processing** (no API costs)
- ✅ **Complete privacy** (data stays local)
- ✅ **Fast development** (no rate limits)
- ✅ **Offline capability** (works without internet)
- ✅ **Full control** (customize everything)

Start your Axgrin backend and test the AI features with your local Ollama instance! 🚀
