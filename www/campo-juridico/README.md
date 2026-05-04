# ⚖️ Campo Jurídico — SK

Assistente jurídico com IA para Saulo Kenji. Análise de documentos (PDF, Word, TXT), resumos, identificação de riscos, geração de peças jurídicas.

## ✨ Funcionalidades

- **Importar documentos** — PDF, Word (.docx), TXT, Markdown
- **8 ações jurídicas rápidas** — Resumir, Analisar Riscos, Cláusulas Abusivas, Pontos para Negociar, Base Legal, Gerar Notificação, Minuta de Resposta, Linha do Tempo
- **4 slots de chave de API** — Groq (gratuito!), OpenAI, Gemini, Perplexity, etc.
- **Auto-detecção do provider** — cole a chave, o sistema detecta automaticamente
- **Streaming** de respostas em tempo real
- **Voz (STT)** — ditado por voz em pt-BR
- **Voz (TTS)** — leitura da resposta em voz alta
- **Exportar análise** como .txt
- **PWA instalável** no celular
- **Sem banco de dados** — tudo em localStorage, privado e local

## 🚀 Deploy gratuito

### Vercel
1. Suba esta pasta para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → New Project → importe
3. Clique em Deploy
4. ✅ Sem variáveis de ambiente necessárias

### Netlify
1. Acesse [netlify.com](https://netlify.com) → Add new site → Deploy manually
2. Arraste a pasta `dist/` (após rodar `npm run build`) para a área de upload
3. ✅ Pronto — funciona igual ao Vercel

## 🛠️ Desenvolvimento local

```bash
npm install
npm run dev
```

## 📦 Build para Netlify (arrastar e soltar)

```bash
npm install
npm run build
# Faça upload da pasta dist/ no Netlify
```

## 🔑 Chaves gratuitas recomendadas

| Provider | Onde obter | Observação |
|----------|-----------|------------|
| **Groq** | [console.groq.com](https://console.groq.com) | ✅ Gratuito, muito rápido |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | ✅ Tier gratuito generoso |

## 📄 Formatos de documento suportados

| Formato | Suporte |
|---------|---------|
| PDF | ✅ Extração completa de texto |
| Word (.docx) | ✅ Extração completa |
| TXT / MD | ✅ |
| HTML / CSV / JSON | ✅ |

## 🔒 Privacidade

- Chaves de API ficam **apenas no seu navegador** (localStorage)
- Documentos são processados **localmente** (nunca enviados para servidor próprio)
- Chamadas vão direto para o provider que você configurou
- Exportação salva localmente no seu dispositivo
