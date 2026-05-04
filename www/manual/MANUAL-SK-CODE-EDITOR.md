# MANUAL DO SK CODE EDITOR
### Guia completo em português — Para você saber tudo sobre seu app

---

## O QUE É ESSE APLICATIVO

O **SK Code Editor** é um aplicativo profissional que roda no celular (PWA — pode instalar como app). Ele tem três ambientes dentro de um só:

1. **Editor de Código** — para criar e editar arquivos HTML, JS, Python, etc.
2. **Campo Livre** — chat com IA para conversar sobre qualquer assunto
3. **Assistente Jurídico (Jamile)** — IA especializada para criar documentos jurídicos

---

## PARTE 1 — ASSISTENTE JURÍDICO (JAMILE)

### O que faz:
- Gera documentos jurídicos completos (petições, minutas, análises)
- Segue formatação ABNT
- Você pode importar o texto do processo
- Você pode ditar por voz
- Exporta o resultado em .txt e .rtf (abre no Word)
- Permite pedir modificações após gerar

### Como usar (passo a passo):
1. Na tela inicial, toque em **"Jurídico"** (botão amarelo no canto superior)
2. Cole o texto do processo no campo de texto grande
   - OU toque em **"Importar .txt"** para importar um arquivo de texto
   - OU toque em **"Ditar"** para falar e o app transcreve
3. Se quiser usar ementas, toque em **"Jurisprudência"** e cole
4. Escolha uma ação:
   - **Corrigir Texto** — corrige erros do texto
   - **Redação Jurídica** — melhora a linguagem para padrão jurídico
   - **Verificar Lacunas** — mostra o que está faltando
   - **Resumir, Revisar, Refinar, Simplificar, Gerar Minuta, Analisar**
5. Aguarde a Jamile gerar o resultado
6. Use os botões: **Copiar**, **Baixar .txt**, ou **Baixar .rtf**
7. Se quiser ajustar, escreva no campo de chat abaixo e envie

### O que PRECISA de chave de API:
| Função | Precisa de chave? |
|--------|------------------|
| Gerar documentos | ❌ NÃO — tem IA gratuita |
| Importar .txt | ❌ NÃO |
| Ditar por voz | ❌ NÃO |
| Copiar/Exportar | ❌ NÃO |
| Importar Áudio (transcrição automática) | ✅ SIM — Groq ou OpenAI |

### Voz da Jamile (TTS):
- A voz configurada é a **Francisca** (Google, gratuita)
- Velocidade: ligeiramente mais rápida que o padrão (1.15x)
- Se soar robótica: feche o app e reabra (problema de cache)
- O botão de voz fica no cabeçalho (ícone de alto-falante)

---

## PARTE 2 — CAMPO LIVRE

### O que faz:
- Chat com IA para qualquer assunto (sem restrição de tema)
- Voz: você fala, ela responde, ela também fala
- Blocos de código com botão de copiar
- Salva o histórico da conversa
- Importa arquivos .txt para o chat

### Como usar:
1. Na tela inicial, toque em **"Campo Livre"** (botão verde)
2. Digite no campo de texto e toque Enviar
   - OU toque no **microfone** para ditar
3. Quando a IA responder com código: aparece caixinha preta com botão Copiar
4. Quando responder com texto: tem botão Copiar no final da mensagem

### O que PRECISA de chave:
| Função | Precisa de chave? |
|--------|------------------|
| Chat básico | ❌ NÃO — tem IA gratuita |
| Voz (ditar) | ❌ NÃO |
| Usar modelo melhor (GPT, Claude, etc.) | ✅ SIM — opcional |

### Como colocar sua chave (opcional):
1. Toque no ícone de engrenagem (⚙️) no canto superior direito
2. Cole sua chave (começa com gsk_, sk-, AIza, etc.)
3. O app detecta o provedor automaticamente
4. Toque em Salvar para guardar a chave

---

## PARTE 3 — EDITOR DE CÓDIGO

### O que faz:
- Editor profissional Monaco (mesmo do VS Code)
- Terminal real (bash) — roda comandos de verdade
- Preview para ver HTML/CSS funcionando
- IA integrada para criar e corrigir código
- Importar/Exportar projetos em ZIP
- Clonar repositórios do GitHub (público, sem chave)
- Salva projetos automaticamente

### Como usar:
1. Na tela inicial, vá em **"Criar"** ou abra um projeto existente
2. Na tela do editor:
   - **Menu** (☰) — acessa arquivos do projeto
   - **Rodar** (▶) — executa o arquivo atual
   - **Terminal** (ícone terminal) — abre o terminal bash
   - **Preview** (ícone olho) — abre visualização
   - **Mic vermelho** 🎤 — fala com a IA diretamente por voz
   - **IA** (roxo) — abre o chat da IA no editor

### Como usar o botão de voz no editor:
1. Toque no **botão de microfone vermelho** na barra inferior
2. A tela de voz abre automaticamente
3. Toque no círculo grande e fale: "crie uma página HTML com formulário de contato"
4. A IA cria o código e você pode aplicar direto no editor

### Terminal:
- Roda comandos reais de bash
- Tem git 2.50.1, node v24, npm instalados
- Para clonar repositório GitHub: `git clone https://github.com/usuario/repo`
- Se der problema, cai automaticamente para terminal simulado

---

## PARTE 4 — INFORMAÇÕES TÉCNICAS

### Versão atual do app:
- Service Worker: sk-editor-v12
- Publicado em: 11 de abril de 2026

### Onde os dados ficam salvos:
| Dado | Onde fica |
|------|-----------|
| Projetos do editor | localStorage do navegador |
| Histórico do Campo Livre | localStorage (cl_chat_history) |
| Chaves de API | localStorage (cl_api_key, aj_api_key) |
| Configuração de voz | localStorage (tts-config) |

### Pontos de restauração desta conversa:
Se algo quebrar, você pode voltar a estes pontos:

1. **Início desta conversa** — app como estava antes de hoje
2. **Voz da Francisca corrigida** — commit 0374911
3. **Botão de enviar Campo Livre corrigido** — commit bdd76d1
4. **Botão de voz adicionado no editor** — commit 1593c71
5. **Versão publicada atual** ← você está aqui — commit f26054f

---

## PARTE 5 — O QUE FUNCIONA E O QUE NÃO FUNCIONA

### ✅ FUNCIONA (confirmado):
- Abrir Assistente Jurídico
- Importar .txt no Jurídico
- Ditar por voz no Jurídico
- Gerar documentos com IA gratuita
- Pedir modificações (chat de refinamento)
- Exportar .txt e .rtf (Word)
- Abrir Campo Livre
- Enviar mensagens no Campo Livre
- Blocos de código com copiar
- Chat com IA gratuita no Campo Livre
- Ditar por voz no Campo Livre
- Criar projetos no editor
- Terminal bash real
- Preview de HTML/CSS
- IA no editor (chat)
- Botão de voz no editor
- Clonar repositório GitHub público
- Importar/Exportar ZIP

### ⚠️ PRECISA DE CHAVE:
- Importar áudio (transcrição Whisper) — Groq ou OpenAI
- Usar modelos premium (GPT-4, Claude, etc.) — chave do provedor

### ❌ NÃO EXISTE NESTE APP:
- Importar do YouTube (nunca foi implementado)
- Seção "previdenciário" (nunca foi implementada aqui)
- Qualquer outra função do app antigo que quebrou

---

## PARTE 6 — SE ALGO QUEBRAR (COMO VOLTAR)

### Passos para voltar a uma versão anterior:
1. No Replit, olhe o lado esquerdo — há um ícone de relógio (histórico)
2. Clique em "History" ou "Checkpoints"
3. Escolha o ponto pelo nome (ex: "Fix error when sending messages")
4. Clique em Restore/Restaurar

### Quando vale a pena recomeçar do zero:
- Quando mais de 3 funções principais pararam de funcionar ao mesmo tempo
- Quando você não sabe mais o que está funcionando e o que não está
- Quando os problemas vieram de muitas mudanças em sequência

### Plano para reconstruir (se precisar):
Se um dia precisar refazer do zero, use este resumo como briefing:

```
APP: SK Code Editor — PWA mobile-first em português brasileiro
COR: Fundo #141c0d, painel #1c2714 (verde escuro)
IDIOMA: Todo em português do Brasil

TELAS:
1. Tela inicial (Projetos) — lista de projetos + botões Jurídico e Campo Livre
2. Editor de código — Monaco Editor + terminal bash real (WebSocket) + preview + IA
3. Campo Livre — chat IA livre, voz, blocos de código, IA gratuita no /api/ai/chat
4. Assistente Jurídico — IA jurídica com prompt ABNT, importar .txt, ditar, exportar RTF

VOZ:
- TTS: Web Speech API, voz Francisca (Google), rate 1.15, pitch 0.95
- STT: webkitSpeechRecognition, pt-BR

API GRATUITA:
- Endpoint: /api/ai/chat (POST)
- Servidor: porta 8080 (api-server)
- Modelo gratuito configurado no servidor

TERMINAL REAL:
- WebSocket em /api/ws/terminal
- child_process.spawn com bash
- Fallback para terminal simulado se WebSocket falhar

PWA:
- Service worker em /public/sw.js
- manifest.json com ícones
```

---

## DICAS PARA NÃO QUEBRAR O APP

1. **Teste antes de pedir mudanças em cadeia** — teste uma coisa, confirme que funciona, aí pede a próxima

2. **Peça uma coisa de cada vez** — mudanças simples e isoladas são mais seguras

3. **Descreva o problema, não a solução** — em vez de "coloca um botão X", diga "quero conseguir fazer Y" — a IA encontra a forma mais segura

4. **Quando algo funcionar bem: pare** — a tentação de melhorar ainda mais é o que quebra projetos

5. **Use o relatório de diagnóstico** — antes de qualquer mudança grande, peça um diagnóstico primeiro

6. **Checkpoints são seus aliados** — o Replit salva automaticamente. Se algo quebrar, você sempre pode voltar

---

*Manual gerado em 11 de abril de 2026 — SK Code Editor*
