/**
 * Manual do SK Code Editor
 * Guia completo de uso: terminal, banco de dados, Neon DB, credenciais, comandos.
 */

import { useState } from "react";

type Section = {
  id: string;
  icon: string;
  title: string;
  content: React.ReactNode;
};

export default function Manual() {
  const [active, setActive] = useState<string>("inicio");
  const [copied, setCopied] = useState<string>("");

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const Code = ({
    children,
    copyKey,
  }: {
    children: string;
    copyKey?: string;
  }) => (
    <div className="relative group my-2">
      <pre
        className="bg-[#0d1309] border border-[#2d4a1e] rounded-lg p-3 text-sm text-[#a8d5a2] overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed"
      >
        {children}
      </pre>
      {copyKey && (
        <button
          onClick={() => copy(children, copyKey)}
          className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded bg-[#2d4a1e] text-[#7ec87a] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#3d5e2a]"
        >
          {copied === copyKey ? "✓ Copiado" : "Copiar"}
        </button>
      )}
    </div>
  );

  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[#7ec87a] font-bold text-base mt-5 mb-2 flex items-center gap-2">
      {children}
    </h2>
  );

  const H3 = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[#5aab56] font-semibold text-sm mt-4 mb-1">{children}</h3>
  );

  const P = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[#8cba89] text-sm leading-relaxed mb-2">{children}</p>
  );

  const Li = ({ children }: { children: React.ReactNode }) => (
    <li className="text-[#8cba89] text-sm leading-relaxed list-none flex gap-2 mb-1">
      <span className="text-[#5aab56] shrink-0">›</span>
      <span>{children}</span>
    </li>
  );

  const Badge = ({
    color,
    children,
  }: {
    color: "green" | "blue" | "yellow" | "red";
    children: React.ReactNode;
  }) => {
    const colors = {
      green:  "bg-[#1a3d14] text-[#7ec87a] border-[#3d6e2a]",
      blue:   "bg-[#0d1e3d] text-[#6ab4ff] border-[#1e4080]",
      yellow: "bg-[#2d2200] text-[#d4aa40] border-[#5a4500]",
      red:    "bg-[#2d0d0d] text-[#d47070] border-[#5a1e1e]",
    };
    return (
      <span
        className={`inline-block text-xs px-2 py-0.5 rounded border font-mono ${colors[color]}`}
      >
        {children}
      </span>
    );
  };

  const sections: Section[] = [
    {
      id: "inicio",
      icon: "🏠",
      title: "Início Rápido",
      content: (
        <div>
          <P>
            Bem-vindo ao <strong className="text-[#7ec87a]">SK Code Editor</strong> — editor
            profissional com terminal real, IA integrada (Jasmim), GitHub, banco de dados e
            muito mais. Este manual é seu guia completo.
          </P>

          <H2>⚡ O que você pode fazer agora</H2>
          <ul className="space-y-1 mb-3">
            <Li>Escrever código em qualquer linguagem com Monaco Editor (VS Code no browser)</Li>
            <Li>Executar comandos reais no terminal (npm install, python, git, etc.)</Li>
            <Li>Pedir ajuda para a Jasmim (IA) para criar, corrigir e melhorar código</Li>
            <Li>Conectar seu repositório GitHub e fazer push/pull direto no editor</Li>
            <Li>Configurar banco de dados PostgreSQL (Neon) gratuitamente</Li>
            <Li>Ver preview ao vivo do seu projeto HTML/React</Li>
            <Li>Importar/exportar projetos como ZIP ou TAR.GZ</Li>
            <Li>Instalar o app no celular como PWA (funciona offline)</Li>
          </ul>

          <H2>🎯 Primeira vez? Faça isso</H2>
          <ol className="space-y-2">
            {[
              "Toque no ícone 🤖 (Jasmim) na barra inferior",
              "Digite: \"Crie um projeto Node.js Express com conexão Neon DB\"",
              "A Jasmim cria tudo automaticamente — você só aplica os arquivos",
              "Rode npm install e npm start no terminal",
              "Veja o preview no ícone 👁️",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#8cba89]">
                <span className="text-[#7ec87a] font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <H2>📱 Instalar como App (PWA)</H2>
          <ul className="space-y-1">
            <Li>Android/Chrome: Menu ⋮ → "Adicionar à tela inicial"</Li>
            <Li>iOS/Safari: Compartilhar → "Adicionar à Tela de Início"</Li>
            <Li>Desktop/Chrome: Ícone ⬇ na barra de endereço</Li>
          </ul>
        </div>
      ),
    },

    {
      id: "terminal",
      icon: "🖥️",
      title: "Terminal",
      content: (
        <div>
          <P>
            O terminal do SK Code Editor é um bash <strong className="text-[#7ec87a]">real</strong> —
            todos os comandos rodam no servidor e retornam saída verdadeira.
          </P>

          <H2>📂 Diretório de trabalho</H2>
          <Code copyKey="cwd">/home/runner/sk-user-workspace/</Code>
          <P>Todo projeto fica dentro desta pasta. Use paths relativos normalmente.</P>

          <H2>🔧 Comandos mais usados</H2>

          <H3>Gerenciamento de pacotes Node.js</H3>
          <Code copyKey="npm-install">npm install express axios cors dotenv</Code>
          <Code copyKey="npm-run">npm run dev
npm start
npm run build</Code>

          <H3>Gerenciamento de pacotes Python</H3>
          <Code copyKey="pip">pip install flask requests pandas sqlalchemy</Code>
          <Code copyKey="python-run">python app.py
python -m pytest
python -m py_compile arquivo.py</Code>

          <H3>Navegação e arquivos</H3>
          <Code copyKey="nav">ls -la           # listar arquivos
pwd              # diretório atual
cd meu-projeto   # entrar na pasta
mkdir nova-pasta # criar pasta
cat package.json # ler arquivo</Code>

          <H3>Processos</H3>
          <Code copyKey="proc">ps aux | grep node    # ver processos Node rodando
kill -9 PID          # matar processo pelo ID
lsof -i :3000        # ver quem usa a porta 3000</Code>

          <H3>Git no terminal</H3>
          <Code copyKey="git-terminal">git status
git add .
git commit -m "minha mensagem"
git push origin main</Code>

          <H2>⚙️ Variáveis de ambiente</H2>
          <P>Crie um arquivo <Badge color="green">.env</Badge> na raiz do projeto:</P>
          <Code copyKey="env-file">DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
PORT=3000
JWT_SECRET=minha-chave-secreta-longa-aqui
NODE_ENV=development</Code>
          <P>
            Instale o dotenv e use <Badge color="green">require('dotenv').config()</Badge> no início do
            seu script para carregar as variáveis.
          </P>

          <H2>🚀 Rodar um servidor</H2>
          <Code copyKey="server">node index.js           # Node puro
npm run dev             # com nodemon (auto-restart)
npx ts-node src/main.ts # TypeScript direto
uvicorn main:app --reload # FastAPI/Python</Code>

          <H2>💡 Dicas</H2>
          <ul className="space-y-1">
            <Li>Use Ctrl+C para parar qualquer processo rodando</Li>
            <Li>Se travar, feche e reabra o terminal (ícone ✕ → ▶)</Li>
            <Li>O terminal salva histórico — use ↑ para repetir comandos</Li>
            <Li>Peça para a Jasmim rodar comandos: "rode npm install e mostre o resultado"</Li>
          </ul>
        </div>
      ),
    },

    {
      id: "neon",
      icon: "🗄️",
      title: "Banco de Dados (Neon)",
      content: (
        <div>
          <P>
            <strong className="text-[#7ec87a]">Neon DB</strong> é PostgreSQL serverless gratuito —
            a melhor opção para projetos profissionais. Sem cartão de crédito.
          </P>

          <H2>🚀 Setup em 5 minutos</H2>
          <ol className="space-y-3 mb-4">
            {[
              { step: "Crie conta gratuita em", link: "https://neon.tech", detail: "plano Free, sem cartão" },
              { step: "Clique em \"New Project\"", link: null, detail: "dê um nome ao banco (ex: meu-app)" },
              { step: "Copie a Connection String", link: null, detail: "começa com postgresql://..." },
              { step: "Cole no painel 🗄️ do editor", link: null, detail: "ícone de banco na barra inferior" },
              { step: "Pronto!", link: null, detail: "a Jasmim já tem acesso ao seu banco" },
            ].map(({ step, link, detail }, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#7ec87a] font-bold shrink-0 w-5">{i + 1}.</span>
                <div>
                  <span className="text-[#8cba89] text-sm">{step} </span>
                  {link && (
                    <span className="text-[#6ab4ff] text-sm">{link}</span>
                  )}
                  <div className="text-[#5aab56] text-xs mt-0.5">{detail}</div>
                </div>
              </li>
            ))}
          </ol>

          <H2>🔑 Obter Neon API Key (para automação)</H2>
          <P>Com a API Key, a Jasmim pode criar o banco automaticamente para você:</P>
          <ol className="space-y-1">
            <Li>Entre em https://console.neon.tech</Li>
            <Li>Vá em Settings → API Keys → Create API Key</Li>
            <Li>A chave começa com neon_api_...</Li>
            <Li>Envie a chave para a Jasmim: "Crie um banco chamado meu-app"</Li>
          </ol>

          <H2>📦 Instalar dependências</H2>
          <Code copyKey="neon-install">npm install @neondatabase/serverless dotenv</Code>

          <H2>🔌 Arquivo de conexão</H2>
          <Code copyKey="neon-connect">{`// db/neon.js
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function initDb() {
  await sql\`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW()
    )
  \`;
  console.log('✅ Banco inicializado!');
}

module.exports = { sql, initDb };`}</Code>

          <H2>📄 Arquivo .env</H2>
          <Code copyKey="neon-env">{`DATABASE_URL=postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=3000
NODE_ENV=development`}</Code>

          <H2>⚡ Comandos SQL úteis</H2>
          <H3>Criar tabela</H3>
          <Code copyKey="sql-create">{`CREATE TABLE IF NOT EXISTS tarefas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  concluida BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);`}</Code>

          <H3>Inserir dados</H3>
          <Code copyKey="sql-insert">{`INSERT INTO tarefas (titulo) 
VALUES ('Primeira tarefa'), ('Segunda tarefa');`}</Code>

          <H3>Consultar</H3>
          <Code copyKey="sql-select">{`SELECT * FROM tarefas ORDER BY criado_em DESC LIMIT 10;`}</Code>

          <H3>Alterar tabela</H3>
          <Code copyKey="sql-alter">{`ALTER TABLE tarefas ADD COLUMN descricao TEXT;
ALTER TABLE tarefas ADD COLUMN prioridade INTEGER DEFAULT 1;`}</Code>

          <H2>🔐 Com Prisma ORM (recomendado para projetos maiores)</H2>
          <Code copyKey="prisma-install">npm install prisma @prisma/client dotenv
npx prisma init</Code>
          <Code copyKey="prisma-schema">{`// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Tarefa {
  id        Int      @id @default(autoincrement())
  titulo    String
  concluida Boolean  @default(false)
  criadoEm DateTime @default(now())
  @@map("tarefas")
}`}</Code>
          <Code copyKey="prisma-migrate">npx prisma migrate dev --name init
npx prisma studio   # abre interface visual do banco</Code>

          <H2>⚠️ Regras importantes</H2>
          <ul className="space-y-1">
            <Li>NUNCA commite o .env com dados reais no git</Li>
            <Li>SEMPRE crie .gitignore com .env listado</Li>
            <Li>SEMPRE crie .env.example com valores de exemplo</Li>
            <Li>Use sslmode=require para Neon (já vem na connection string)</Li>
          </ul>
        </div>
      ),
    },

    {
      id: "jasmim",
      icon: "🤖",
      title: "Jasmim (IA)",
      content: (
        <div>
          <P>
            <strong className="text-[#7ec87a]">Jasmim</strong> é sua assistente de IA — desenvolvedora
            sênior com autonomia total para criar projetos completos, corrigir erros e configurar
            banco de dados automaticamente.
          </P>

          <H2>💬 Como conversar com a Jasmim</H2>
          <ul className="space-y-1 mb-3">
            <Li>Seja direto: "Crie um CRUD de clientes com Node.js e Neon DB"</Li>
            <Li>Ela gera arquivos completos — você aplica com 1 clique</Li>
            <Li>Ela vê o terminal automaticamente e já prepara a solução para erros</Li>
            <Li>Ela continua sem parar até a tarefa estar 100% concluída</Li>
            <Li>Peça revisões: "Adicione autenticação JWT nesse projeto"</Li>
          </ul>

          <H2>🎯 O que a Jasmim faz sem precisar de permissão</H2>
          <ul className="space-y-1 mb-3">
            <Li>Criar projeto do zero (qualquer linguagem/framework)</Li>
            <Li>Instalar dependências (npm, pip, qualquer gerenciador)</Li>
            <Li>Criar e modificar qualquer arquivo</Li>
            <Li>Configurar banco de dados completo (schema, tabelas, migrations)</Li>
            <Li>Adicionar autenticação, rotas, APIs REST</Li>
            <Li>Corrigir erros de compilação automaticamente</Li>
            <Li>Fazer push para GitHub quando você pedir</Li>
          </ul>

          <H2>📋 Exemplos de comandos eficientes</H2>

          <H3>Criar projeto completo</H3>
          <Code copyKey="jasmim-1">"Crie um app de lista de tarefas com React, Node.js/Express, Neon DB PostgreSQL e autenticação JWT. Interface em português."</Code>

          <H3>Configurar banco automaticamente</H3>
          <Code copyKey="jasmim-2">"Minha Neon API Key é neon_api_xxx. Crie um banco chamado meu-app e já configure tudo no projeto."</Code>

          <H3>Corrigir erro</H3>
          <Code copyKey="jasmim-3">"Tem um erro no terminal acima, corrija."</Code>

          <H3>Adicionar funcionalidade</H3>
          <Code copyKey="jasmim-4">"Adicione upload de arquivos PDF nesse projeto usando multer. Salve os arquivos na pasta uploads/."</Code>

          <H3>Refatorar</H3>
          <Code copyKey="jasmim-5">"Reorganize a estrutura de pastas desse projeto seguindo as boas práticas do Express (routes/, controllers/, models/, middleware/)."</Code>

          <H2>🔍 Escopo de arquivo</H2>
          <P>
            No topo do chat, selecione quais arquivos a Jasmim pode ver.
            Quanto mais arquivos você selecionar, melhor ela entende o contexto do projeto.
          </P>

          <H2>📜 Histórico</H2>
          <P>
            O histórico de conversa fica salvo automaticamente. Use o botão 🗑️ para limpar
            e começar uma nova sessão quando mudar de projeto.
          </P>
        </div>
      ),
    },

    {
      id: "github",
      icon: "🐙",
      title: "GitHub",
      content: (
        <div>
          <P>
            Conecte seu repositório GitHub ao SK Code Editor para fazer push, pull e gerenciar
            branches diretamente no editor.
          </P>

          <H2>🔑 Criar Personal Access Token (PAT)</H2>
          <ol className="space-y-2 mb-4">
            {[
              { step: "Acesse", link: "github.com → Settings → Developer Settings" },
              { step: "Vá em", link: "Personal access tokens → Tokens (classic) → Generate new token" },
              { step: "Permissões necessárias:", link: "repo (todas), workflow (se usar Actions)" },
              { step: "Copie o token", link: "começa com ghp_..." },
              { step: "Cole no painel 🐙 do editor", link: "ícone GitHub na barra inferior" },
            ].map(({ step, link }, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#7ec87a] font-bold shrink-0">{i + 1}.</span>
                <div className="text-sm text-[#8cba89]">
                  <strong>{step}</strong>{" "}
                  <span className="text-[#6ab4ff]">{link}</span>
                </div>
              </li>
            ))}
          </ol>

          <H2>📦 Operações disponíveis no painel</H2>
          <ul className="space-y-1">
            <Li>Clonar repositório existente para o workspace</Li>
            <Li>Fazer commit e push de arquivos modificados</Li>
            <Li>Pull para atualizar o workspace com o remote</Li>
            <Li>Ver diff dos arquivos modificados</Li>
            <Li>Criar e trocar de branch</Li>
          </ul>

          <H2>🖥️ Git no terminal</H2>
          <Code copyKey="git-full">{`# Configurar identidade (primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Clonar repositório
git clone https://github.com/usuario/repo.git

# Fazer commit e push
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin main

# Criar e usar nova branch
git checkout -b minha-feature
git push -u origin minha-feature`}</Code>

          <H2>⚠️ Segurança</H2>
          <ul className="space-y-1">
            <Li>NUNCA commite arquivos .env com senhas</Li>
            <Li>Adicione .env ao .gitignore ANTES do primeiro commit</Li>
            <Li>Seu PAT fica criptografado no editor — nunca é exposto</Li>
          </ul>
        </div>
      ),
    },

    {
      id: "preview",
      icon: "👁️",
      title: "Preview ao Vivo",
      content: (
        <div>
          <P>
            O preview ao vivo renderiza HTML, CSS, JS e React diretamente no editor —
            sem precisar abrir o navegador.
          </P>

          <H2>🖥️ Como abrir o preview</H2>
          <ol className="space-y-1 mb-3">
            <Li>Toque no ícone 👁️ na barra inferior</Li>
            <Li>O preview abre mostrando o index.html do projeto atual</Li>
            <Li>Clique em "Tela Cheia" (ícone de expandir) para ver em tela grande</Li>
            <Li>Clique em "Recarregar" para atualizar após mudanças</Li>
          </ol>

          <H2>✅ Para o preview funcionar</H2>
          <ul className="space-y-1 mb-3">
            <Li>O arquivo index.html precisa estar na raiz do projeto</Li>
            <Li>CSS e JS referenciados no HTML são carregados automaticamente</Li>
            <Li>Projetos React/Vite: rode npm run dev no terminal primeiro</Li>
          </ul>

          <H2>🚀 Preview de um projeto Node.js/React</H2>
          <Code copyKey="preview-node">{`# 1. Instale as dependências
npm install

# 2. Rode o servidor de desenvolvimento
npm run dev      # ou: npm start

# 3. O preview vai aparecer na porta configurada`}</Code>

          <H2>📱 Preview responsivo</H2>
          <P>
            Use o botão de dimensões no preview para simular telas de smartphone, tablet
            e desktop sem precisar de DevTools.
          </P>
        </div>
      ),
    },

    {
      id: "importexport",
      icon: "📦",
      title: "Importar / Exportar",
      content: (
        <div>
          <P>
            O SK Code Editor permite importar e exportar projetos como ZIP ou TAR.GZ
            para transferir entre dispositivos ou fazer backup.
          </P>

          <H2>📥 Importar projeto</H2>
          <ul className="space-y-1 mb-3">
            <Li>Toque no ícone 📁 na barra inferior → "Importar ZIP/TAR.GZ"</Li>
            <Li>Selecione o arquivo .zip ou .tar.gz do seu projeto</Li>
            <Li>O editor extrai e carrega todos os arquivos automaticamente</Li>
            <Li>Projetos do VS Code, Replit, Glitch e outros são compatíveis</Li>
          </ul>

          <H2>📤 Exportar projeto</H2>
          <ul className="space-y-1 mb-3">
            <Li>Toque no ícone 📁 → "Exportar como ZIP"</Li>
            <Li>Um arquivo .zip com todos os arquivos é baixado</Li>
            <Li>Use para backup ou para abrir em outro editor</Li>
          </ul>

          <H2>📦 Backup no Google Drive</H2>
          <P>Com Google Drive conectado (ícone ☁️):</P>
          <ul className="space-y-1">
            <Li>Backup automático do projeto atual</Li>
            <Li>Restaurar versões anteriores</Li>
            <Li>Sincronizar entre dispositivos</Li>
          </ul>

          <H2>💡 Dicas</H2>
          <ul className="space-y-1">
            <Li>Antes de importar, o projeto atual fica salvo no histórico</Li>
            <Li>node_modules é ignorado na exportação (muito pesado)</Li>
            <Li>Arquivos .env são incluídos — cuidado ao compartilhar</Li>
            <Li>Para projetos grandes, prefira exportar TAR.GZ (menor)</Li>
          </ul>
        </div>
      ),
    },

    {
      id: "credenciais",
      icon: "🔑",
      title: "Credenciais e API Keys",
      content: (
        <div>
          <P>
            O SK Code Editor usa credenciais para conectar serviços externos.
            Todas são salvas localmente e nunca enviadas para servidores externos.
          </P>

          <H2>🔑 Onde configurar cada credencial</H2>

          <div className="space-y-3 mb-4">
            {[
              { icon: "🤖", name: "API Key de IA (OpenAI, Gemini, Groq...)", where: "Painel da Jasmim → ⚙️ Configurações", detail: "sk- (OpenAI), AIza (Gemini), gsk_ (Groq), sk-ant (Anthropic), xai- (Grok), sk-or- (OpenRouter)" },
              { icon: "🐙", name: "GitHub Personal Access Token", where: "Painel GitHub → Inserir credenciais", detail: "ghp_... (Token clássico, permissões: repo, workflow)" },
              { icon: "🗄️", name: "Connection String do Banco", where: "Painel Banco de Dados → Cole a URL", detail: "postgresql://user:pass@host/db?sslmode=require" },
              { icon: "☁️", name: "Google Drive", where: "Painel Backup → Conectar com Google", detail: "Login OAuth — não requer chave manual" },
            ].map(({ icon, name, where, detail }) => (
              <div key={name} className="bg-[#0d1309] border border-[#2d4a1e] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <strong className="text-[#7ec87a] text-sm">{name}</strong>
                </div>
                <div className="text-[#5aab56] text-xs mb-1">📍 {where}</div>
                <div className="text-[#6b8f68] text-xs font-mono">{detail}</div>
              </div>
            ))}
          </div>

          <H2>🔒 Segurança</H2>
          <ul className="space-y-1">
            <Li>Credenciais ficam no localStorage do navegador — só você tem acesso</Li>
            <Li>API keys de IA são enviadas apenas ao backend deste editor (nunca expostas)</Li>
            <Li>Para trocar uma credencial, simplesmente cole a nova no mesmo campo</Li>
            <Li>Para revogar acesso, delete a key no serviço externo (GitHub, OpenAI, etc.)</Li>
          </ul>

          <H2>⚡ Detecção automática de provedor de IA</H2>
          <P>A Jasmim detecta automaticamente qual provedor usar pela sua API key:</P>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["gsk_", "Groq"],
              ["sk-or-", "OpenRouter"],
              ["pplx-", "Perplexity"],
              ["AIza", "Gemini"],
              ["xai-", "Grok (xAI)"],
              ["sk-ant", "Anthropic"],
              ["neon_api_", "Neon DB API"],
              ["sk-", "OpenAI"],
            ].map(([prefix, name]) => (
              <div key={prefix} className="flex items-center gap-2 bg-[#0d1309] border border-[#2d4a1e] rounded p-2">
                <Badge color="green">{prefix}</Badge>
                <span className="text-[#8cba89] text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    {
      id: "juridico",
      icon: "⚖️",
      title: "Assistente Jurídico",
      content: (
        <div>
          <P>
            O <strong className="text-[#7ec87a]">Assistente Jurídico</strong> (Jamile) é
            especializado em Direito brasileiro — gera peças processuais, analisa ementas e
            responde perguntas jurídicas.
          </P>

          <H2>📋 Abas disponíveis</H2>
          <ul className="space-y-1 mb-3">
            <Li><strong className="text-[#7ec87a]">Processar</strong> — gera petições, contratos, pareceres com base no prompt</Li>
            <Li><strong className="text-[#7ec87a]">Ementas</strong> — biblioteca de ementas jurisprudenciais que alimentam o contexto da IA</Li>
            <Li><strong className="text-[#7ec87a]">Histórico</strong> — últimas 15 gerações, com opção de restaurar e reeditar</Li>
            <Li><strong className="text-[#7ec87a]">Ações</strong> — ações personalizadas que você define e reutiliza</Li>
          </ul>

          <H2>⚡ Nível de Esforço (1–5)</H2>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {[
              ["1", "Rápido", "8k tokens"],
              ["2", "Básico", "16k tokens"],
              ["3", "Normal", "32k tokens"],
              ["4", "Detalhado", "64k tokens"],
              ["5", "Exaustivo", "131k tokens"],
            ].map(([n, label, tokens]) => (
              <div key={n} className="bg-[#0d1309] border border-[#2d4a1e] rounded p-2 text-center">
                <div className="text-[#7ec87a] font-bold text-sm">{n}</div>
                <div className="text-[#8cba89] text-xs">{label}</div>
                <div className="text-[#5aab56] text-xs">{tokens}</div>
              </div>
            ))}
          </div>

          <H2>📝 Verbosidade</H2>
          <ul className="space-y-1 mb-3">
            <Li><strong>Concisa</strong> — peça objetiva, sem redundâncias, mais curta</Li>
            <Li><strong>Completa</strong> — peça completa com fundamentação aprofundada</Li>
          </ul>

          <H2>📚 Ementas (biblioteca jurisprudencial)</H2>
          <P>
            Na aba Ementas, você cadastra suas próprias ementas de jurisprudência.
            Elas são inseridas automaticamente no contexto quando você gera uma peça,
            enriquecendo a fundamentação jurídica da IA.
          </P>
          <ul className="space-y-1 mb-3">
            <Li>Cole a ementa completa no campo de texto</Li>
            <Li>Dê um título para identificar facilmente</Li>
            <Li>Marque as ementas que quer usar antes de gerar a peça</Li>
            <Li>Você pode ter até 50 ementas na biblioteca</Li>
          </ul>

          <H2>🎯 Ações personalizadas</H2>
          <P>
            Na aba Ações, crie prompts reutilizáveis para tipos de peça que você usa
            frequentemente. Exemplos:
          </P>
          <Code copyKey="acao-exemplo">"Elabore uma petição inicial de ação de indenização por danos morais decorrentes de negativação indevida, fundamentada no CDC e CC. Inclua pedido de tutela de urgência para exclusão imediata do nome dos cadastros de restrição ao crédito."</Code>
        </div>
      ),
    },
  ];

  const activeSection = sections.find((s) => s.id === active) || sections[0];

  return (
    <div className="flex h-full bg-[#141c0d] text-white overflow-hidden">
      {/* Sidebar de navegação */}
      <div className="w-36 shrink-0 border-r border-[#2d4a1e] flex flex-col py-2 overflow-y-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 text-xs transition-colors ${
              active === s.id
                ? "bg-[#1c2714] text-[#7ec87a] border-r-2 border-[#5aab56]"
                : "text-[#5a7a56] hover:text-[#7ec87a] hover:bg-[#1a2412]"
            }`}
          >
            <span className="text-lg">{s.icon}</span>
            <span className="text-center leading-tight">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d4a1e]">
            <span className="text-2xl">{activeSection.icon}</span>
            <h1 className="text-[#7ec87a] font-bold text-lg">{activeSection.title}</h1>
          </div>
          {activeSection.content}
        </div>
      </div>
    </div>
  );
}
