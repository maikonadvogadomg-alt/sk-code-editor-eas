# 🌿 SK Assistente

Assistente de IA para Saulo Kenji — Chat com 4 slots de API, voz, playground de código e busca web.

## ✨ Funcionalidades

- **4 slots de chave de API** — configure Groq, OpenAI, Gemini, OpenRouter, Perplexity, xAI ou qualquer API compatível
- **Auto-detecção de provider** — cole a chave e o app detecta automaticamente o provider e modelo ideal
- **Streaming de respostas** — respostas aparecem em tempo real
- **Blocos de código** com botão copiar e syntax highlighting
- **Links clicáveis** nas respostas
- **Voz entrada (STT)** — ditado via Web Speech API (Chrome/Edge)
- **Voz saída (TTS)** — leitura em voz alta via Web Speech API (sem custo)
- **Importar/Exportar** conversa em .txt
- **Playground de código** — salvar, copiar, baixar snippets localmente
- **Busca na web** — resultados com links clicáveis e botão "enviar ao chat"
- **PWA instalável** — funciona como app no celular (offline parcial)
- **100% localStorage** — sem banco de dados, sem conta

## 🚀 Deploy no Vercel (gratuito)

1. Faça upload desta pasta para um repositório GitHub (ou ZIP direto no Vercel)
2. Acesse [vercel.com](https://vercel.com) → New Project → importe o repositório
3. **Sem variáveis de ambiente necessárias** — tudo roda direto no navegador
4. Clique em Deploy — pronto!

## 🛠️ Desenvolvimento local

```bash
npm install
npm run dev
```

Abrir em: http://localhost:3333

## 📦 Build

```bash
npm install
npm run build
```

## 🔑 Chaves de API suportadas (gratuitas ou com tier gratuito)

| Provider | Prefixo da chave | Observação |
|----------|-----------------|------------|
| **Groq** | `gsk_` | **Gratuito** — llama-3.3-70b muito rápido |
| OpenAI | `sk-` | Pago (tem trial) |
| Google Gemini | `AIza` | Tier gratuito generoso |
| Perplexity | `pplx-` | Com busca na web embutida |
| xAI Grok | `xai-` | |
| Anthropic | `sk-ant` | |
| OpenRouter | `sk-or-` | Acesso a vários modelos |

**Dica gratuita:** Groq oferece velocidade excepcional sem custo — obtenha uma chave em [console.groq.com](https://console.groq.com).

## 🎙️ Voz

- **Entrada por voz**: Clique no botão 🎤 e fale em português. Silêncio de 1.8s envia automaticamente.
- **Saída por voz**: Ative o botão 🔊 para ouvir as respostas. Usa Web Speech API — gratuito, sem API key.
- Funciona em Chrome e Edge (Android e Desktop).

## 📁 Estrutura

```
sk-assistente/
├── src/
│   ├── App.tsx           — Container principal com tabs
│   ├── components/
│   │   ├── Chat.tsx      — Chat com 4 slots + voz + streaming
│   │   ├── Playground.tsx — Editor de código local
│   │   └── Search.tsx    — Busca web com DuckDuckGo
│   ├── index.css
│   └── main.tsx
├── api/
│   └── search.ts         — Proxy para DuckDuckGo (Vercel serverless)
├── public/
│   ├── manifest.json     — PWA manifest
│   └── sw.js             — Service worker
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json
```

## 🔒 Privacidade

- Chaves de API ficam apenas no seu navegador (localStorage)
- Conversas ficam apenas no seu dispositivo
- Nenhum dado é enviado para servidores externos além das chamadas à IA que você configurar
