# AI Dependencies for Real AI Integration

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    // Existing dependencies...

    // For OpenAI integration
    "openai": "^4.20.0",

    // For Anthropic Claude integration
    "@anthropic-ai/sdk": "^0.9.1",

    // For configuration management
    "@nestjs/config": "^3.1.1"
  }
}
```

## Installation Commands

```bash
# Install OpenAI SDK
npm install openai

# Install Anthropic Claude SDK
npm install @anthropic-ai/sdk

# Install NestJS Config (if not already installed)
npm install @nestjs/config
```

## Environment Variables

Add to your `.env` file:

```env
# AI Provider Selection
AI_PROVIDER=openai  # Options: openai, claude, local

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic Claude Configuration
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here

# Local AI Configuration (Ollama)
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=llama2
```

## Quick Start

1. **Choose your AI provider** (OpenAI recommended for beginners)
2. **Get an API key** from your chosen provider
3. **Add the environment variable** to your `.env` file
4. **Install the required dependency**
5. **Update your AI service** to use the real AI integration

## Cost Estimates

### OpenAI GPT-3.5-turbo

- **Cost**: ~$0.001 per 1K tokens
- **Typical response**: 200-500 tokens
- **Cost per response**: ~$0.0002-0.0005

### OpenAI GPT-4

- **Cost**: ~$0.03 per 1K tokens
- **Typical response**: 200-500 tokens
- **Cost per response**: ~$0.006-0.015

### Anthropic Claude-3-Haiku

- **Cost**: ~$0.00025 per 1K tokens
- **Typical response**: 200-500 tokens
- **Cost per response**: ~$0.00005-0.000125

### Local AI (Ollama)

- **Cost**: Free (runs on your hardware)
- **Setup**: Requires local installation
- **Performance**: Depends on your hardware

## Recommended Setup for Production

1. **Start with OpenAI GPT-3.5-turbo** for cost efficiency
2. **Implement response caching** to reduce API calls
3. **Add rate limiting** to control costs
4. **Set up monitoring** to track usage
5. **Use fallback system** for reliability

## Testing

Test your AI integration:

```bash
# Test OpenAI connection
curl -X POST http://localhost:3300/ai/test-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test AI chat
curl -X POST http://localhost:3300/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I save more money?"}'
```
