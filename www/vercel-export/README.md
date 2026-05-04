# SK Code Editor — Versão Vercel

Editor de código profissional mobile-first com IA (Jasmim), GitHub integration, terminal virtual, live preview, e muito mais. Desenvolvido para Saulo Kenji.

## Como fazer deploy no Vercel

### 1. Pré-requisitos
- Conta no [Vercel](https://vercel.com) (grátis)
- [Node.js 18+](https://nodejs.org) instalado localmente (para testar)
- [Git](https://git-scm.com) instalado

### 2. Preparar o projeto

```bash
# Instalar dependências
npm install

# Testar localmente
npm run dev
```

### 3. Deploy via GitHub (recomendado)

1. Crie um repositório no GitHub e faça push desta pasta
2. Acesse [vercel.com](https://vercel.com) → "New Project"
3. Conecte seu repositório GitHub
4. Vercel detecta automaticamente que é um projeto Vite
5. Configure as variáveis de ambiente (ver abaixo)
6. Clique em "Deploy"

### 4. Deploy via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Para produção
vercel --prod
```

### 5. Variáveis de Ambiente no Vercel

Para que a voz da IA (Jasmim) funcione, configure:

| Variável | Descrição |
|----------|-----------|
| `OPENAI_API_KEY` | Sua chave da OpenAI (para TTS/STT da Jasmim) |

**Como configurar no Vercel:**
1. Acesse seu projeto no dashboard do Vercel
2. Vá em "Settings" → "Environment Variables"
3. Adicione `OPENAI_API_KEY` com sua chave

> **Sem esta chave:** O editor funciona normalmente. Apenas a voz neural da Jasmim (TTS/STT) fica indisponível. A IA ainda funciona por texto com as chaves configuradas no painel de configurações do app.

### 6. O que funciona no Vercel

✅ Monaco Editor completo  
✅ Sistema de arquivos virtual  
✅ IA Jasmim (chat por texto — configure suas chaves no app)  
✅ Voz da Jasmim (precisa de OPENAI_API_KEY no servidor)  
✅ GitHub integration (PAT — configure no painel GitHub do app)  
✅ ZIP import/export  
✅ Live preview HTML/CSS/JS  
✅ Busca web (DuckDuckGo)  
✅ Busca de pacotes npm  
✅ PWA (instalável no celular)  
⚠️ Terminal real — não disponível no Vercel (serverless não suporta PTY)

### 7. Configurando a IA no app

Após o deploy:
1. Abra o app → ícone de configurações
2. Adicione suas chaves de API:
   - **OpenAI** (GPT-4o, etc)
   - **Anthropic** (Claude)
   - **Google** (Gemini)
   - **Custom** (OpenRouter, etc)

---

Feito com ❤️ para Saulo Kenji.
