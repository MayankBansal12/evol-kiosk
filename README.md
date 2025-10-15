# Conversational Kiosk for buying jewellery

A Next.js-based conversational jewellery shopping prototype designed for kiosk devices. The experience focuses on simple, theme-aligned design and a multilingual, voice-enabled AI stylist named Evol‑e to guide users through discovery and purchase.

## Getting Started

### Set up API key

First, set up your `.env` from the `.env.example` file:

If you don't have an Gemini API key, you can set `USE_MOCK_DATA="true"` to use simulated responses.

### Install all dependencies

```bash
pnpm i
```

### Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Kiosk-first conversational flow**: Built for touch screens and quick, guided choices
- **Multilingual assistant (Evol‑e)**: Users pick preferred language; dynamic, context-aware dialogue
- **Voice experience**: Female TTS voice and STT input for fast, hands-free interaction
- **Personalized recommendations**: Products matched via AI-returned tags and conversation context
- **Product detail with guidance**: Highlights why to buy, plus in-page chat with Evol‑e to explore more
- **Simple, jewellery-themed UI**: Clean, focused visuals with large tap targets and smooth transitions


## Project Structure

- `/src/app/actions/aiResponse.js` - Server action for Gemini API integration
- `/src/app/actions/prompts.js` - AI prompt for the jewellery stylist
- `/src/components/ConversationalWizard.jsx` - Main conversational interface
- `/src/components/AIRecommendationsPage.jsx` - Displays AI-recommended products

