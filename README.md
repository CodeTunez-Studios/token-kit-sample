# token-kit-sample

[![npm](https://img.shields.io/npm/v/@codetunezstudios/token-kit?label=%40codetunezstudios%2Ftoken-kit&color=emerald)](https://www.npmjs.com/package/@codetunezstudios/token-kit)

A minimal React + TypeScript playground for the [`@codetunezstudios/token-kit`](https://www.npmjs.com/package/@codetunezstudios/token-kit) SDK. Intentionally simple — written to be read and copied, not to be a production app.

## What's in here

| File | What it shows |
|---|---|
| `src/hooks/useChat.ts` | **How to call the SDK** — instantiate `TokenKit`, send a chat request, handle the response |
| `src/context/TokenKitContext.tsx` | A `useReducer` pattern for storing credentials, messages, and stats |
| `src/components/ConfigPanel.tsx` | Collecting credentials and request options from the user |
| `src/components/ChatPanel.tsx` | Rendering a chat history and sending prompts, with a system instructions tab |
| `src/components/StatsPanel.tsx` | Surfacing per-session token usage and balance |
| `src/components/ContextPanel.tsx` | Visualising the full conversation context window sent with each request (visible when multi-turn is on) |

## Getting started

The SDK is published on npm — install it separately if you're pulling this into your own project:

```bash
npm install @codetunezstudios/token-kit
```

To run the sample app:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## How to use the app

1. Enter your **Developer API Key** (`dev_xxxxxxxx`)
2. Enter a **User Token** (`ut_xxxxxxxx`)
3. Optionally pick an **Environment** or set a custom **Base URL**
4. Choose a **Model** and tune **Temperature** / **Max Tokens** if needed
5. Toggle **Multi-turn** on to send the full conversation history with each request — a context window panel appears on the right showing exactly what gets sent to the model
6. Optionally add **System Instructions** via the tab in the chat panel
7. Type a message and press **Enter** or click **Send**

Per-message stats (model, prompt ↑ / completion ↓ tokens, TK cost, latency) appear below each assistant reply. Session totals appear in the stats bar at the bottom.

## The key integration pattern

Everything that matters for SDK integration is in `src/hooks/useChat.ts`:

```ts
import TokenKit from '@codetunezstudios/token-kit';

const tk = new TokenKit({ apiKey });

const response = await tk.chat(userToken, messages, {
  model,
  maxTokens,
  temperature,
});

// response.message.content  — the reply text
// response.tokensUsed       — { prompt, completion, total }
// response.tokensDeducted   — tokens taken from the user's balance
// response.userBalance      — remaining balance after the call
// response.model            — model that was actually used
```

## Project structure

```
src/
├── App.tsx                       # App shell and layout
├── App.css                       # All styles (rem-based units)
├── index.tsx                     # React entry point
├── index.css                     # Global reset and CSS variables
├── types.ts                      # Shared TypeScript types and AVAILABLE_MODELS
├── context/
│   └── TokenKitContext.tsx       # Global state with useReducer
├── hooks/
│   └── useChat.ts                # SDK integration — start here
└── components/
    ├── Header.tsx                # Top bar with links
    ├── ConfigPanel.tsx           # Credentials and request options
    ├── ChatPanel.tsx             # Chat UI with system instructions tab
    ├── StatsPanel.tsx            # Session statistics
    └── ContextPanel.tsx          # Context window viewer (multi-turn mode)
```

## Available models

| Model | ID | Tier |
|---|---|---|
| GPT-4o Mini | `gpt-4o-mini` | Economy (1.0×) |
| GPT-4o | `gpt-4o` | Mid-tier (2.0×) |
| Claude 3.5 Haiku | `claude-3.5-haiku` | Economy (1.0×) |
| Claude Sonnet 4 | `claude-sonnet-4` | Premium (3.0×) |
| Amazon Nova Micro | `nova-micro` | Economy (1.0×) |
| Amazon Nova Lite | `nova-lite` | Economy (1.0×) |

## License

MIT
