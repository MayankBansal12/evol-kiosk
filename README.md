# AI-Driven Jewellery Kiosk

This is a Next.js-based conversational AI jewellery kiosk that uses Gemini 2.5 Flash lite model to create an intelligent assistant experience.

## Getting Started

### Set up API key

First, set up your `.env` from the `.env.example` file:

If you don't have an Gemini API key, you can set `USE_MOCK_DATA="true"` to use simulated responses.

### Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Conversational AI Interface**: Natural dialogue flow using Gemini 2.5 Flash model
- **Dynamic Question Generation**: Questions adapt based on previous answers
- **Personalized Product Recommendations**: Curated based on conversation context
- **Elegant Animations**: Smooth transitions using Framer Motion
- **Kiosk-Optimized UI**: Large touch targets and fullscreen layout
- **AI Integration**: Server actions for Gemini API integration

## Project Structure

- `/src/app/actions/aiResponse.js` - Server action for Gemini API integration
- `/src/app/actions/prompts.js` - AI prompt for the jewellery stylist
- `/src/components/ConversationalWizard.jsx` - Main conversational interface
- `/src/components/AIRecommendationsPage.jsx` - Displays AI-recommended products

## AI Integration Details

### How the AI Works

1. **Conversation Initialization**: When the kiosk starts, it sends an initial request to the Gemini API.

2. **Context Tracking**: Each user response is added to the conversation context, allowing the AI to remember previous choices.

3. **Dynamic Response Generation**: The AI analyzes the context to decide whether to ask another question or provide product recommendations.

4. **Personalization**: The AI incorporates the user's name and preferences into its responses.
