import { useState, useRef, useCallback, useEffect } from "react";
import {
  Scale, Settings, Send, Trash2, Mic, MicOff, Volume2, VolumeX,
  ClipboardCopy, Check, StopCircle, Download, Upload, FileText,
  Eye, EyeOff, ChevronDown, ChevronUp, Loader2, X, Sparkles,
} from "lucide-react";
import { readDocument, type DocResult } from "./lib/docReader";

// ─── Provider auto-detect ─────────────────────────────────────────────────────

const AUTO_DETECT: [string, string, string, string][] = [
  ["gsk_",   "https://api.groq.com/openai/v1",                          "llama-3.3-70b-versatile",  "Groq"],
  ["sk-or-", "https://openrouter.ai/api/v1",                            "openai/gpt-4o-mini",       "OpenRouter"],
  ["pplx-",  "https://api.perplexity.ai",                              "sonar-pro",                "Perplexity"],
  ["AIza",   "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-2.0-flash",         "Gemini"],
  ["xai-",   "https://api.x.ai/v1",                                     "grok-2-latest",            "xAI Grok"],
  ["sk-ant", "https://api.anthropic.com/v1",                            "claude-haiku-4-20250514",  "Anthropic"],
  ["sk-",    "https://api.openai.com/v1",                               "gpt-4o-mini",              "OpenAI"],
];

function detectProvider(key: string) {
  const k = (key || "").trim();
  for (const [prefix, url, model, name] of AUTO_DETECT) {
    if (k.startsWith(prefix)) return { url, model, name };
  }
  return null;
}

// ─── Key Slot ─────────────────────────────────────────────────────────────────

interface KeySlot {
  label: string;
  key: string;
  url: string;
  model: string;
  provider: string;
}

function defaultSlots(): KeySlot[] {
  return [
    { label: "Slot 1", key: "", url: "https://api.groq.com/openai/v1",                          model: "llama-3.3-70b-versatile", provider: "Groq" },
    { label: "Slot 2", key: "", url: "https://api.openai.com/v1",                               model: "gpt-4o-mini",             provider: "OpenAI" },
    { label: "Slot 3", key: "", url: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash",        provider: "Gemini" },
    { label: "Slot 4", key: "", url: "https://openrouter.ai/api/v1",                            model: "openai/gpt-4o-mini",      provider: "OpenRouter" },
  ];
}

function loadSlots(): KeySlot[] {
  try { return JSON.parse(localStorage.getItem("cj_slots") || "null") || defaultSlots(); }
  catch { return defaultSlots(); }
}

// ─── Message ──────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  slotLabel?: string;
}

// ─── Legal presets ────────────────────────────────────────────────────────────

const PRESETS = [
  { icon: "📋", label: "Resumir documento", prompt: "Faça um resumo executivo e estruturado deste documento, destacando: partes envolvidas, objeto principal, datas e prazos importantes, obrigações de cada parte e pontos de atenção." },
  { icon: "⚠️", label: "Analisar riscos",    prompt: "Analise os riscos jurídicos deste documento. Identifique cláusulas problemáticas, lacunas, inconsistências e potenciais conflitos legais. Apresente em formato de lista ordenada por nível de risco." },
  { icon: "🔍", label: "Cláusulas abusivas", prompt: "Identifique eventuais cláusulas abusivas ou desproporcionais neste documento, conforme o Código de Defesa do Consumidor (CDC) e a jurisprudência dominante. Explique o fundamento legal de cada apontamento." },
  { icon: "📝", label: "Pontos para negociar", prompt: "Quais pontos deste documento poderiam ser renegociados para melhor proteger meus interesses? Liste as sugestões de alteração com justificativa jurídica." },
  { icon: "⚖️", label: "Base legal",          prompt: "Indique a legislação e jurisprudência aplicáveis ao conteúdo deste documento (leis, artigos, súmulas, precedentes do STJ/STF relevantes)." },
  { icon: "✉️", label: "Gerar notificação",   prompt: "Com base neste documento, redija uma notificação extrajudicial formal, com linguagem jurídica adequada, pedindo cumprimento das obrigações identificadas. Use formato completo com qualificação das partes, fundamento e prazo." },
  { icon: "📄", label: "Minuta de resposta",  prompt: "Elabore uma minuta de resposta/contestação a este documento, refutando os principais pontos de forma técnica e fundamentada juridicamente." },
  { icon: "🗒️", label: "Linha do tempo",      prompt: "Extraia e organize cronologicamente todos os fatos, datas, prazos e obrigações mencionados neste documento em formato de linha do tempo." },
];

// ─── TTS ──────────────────────────────────────────────────────────────────────

let ttsChunks: string[] = [];

function splitSpeech(text: string): string[] {
  const clean = text
    .replace(/```[\s\S]*?```/g, " (código omitido) ")
    .replace(/`[^`]+`/g, m => m.slice(1, -1))
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ").trim().slice(0, 1500);
  const parts: string[] = [];
  const sents = clean.match(/[^.!?…]+[.!?…]+|[^.!?…]{20,}/g) || [clean];
  let cur = "";
  for (const s of sents) {
    const t = s.trim();
    if (!t) continue;
    if ((cur + " " + t).trim().length <= 220) cur = (cur + " " + t).trim();
    else { if (cur) parts.push(cur); cur = t; }
  }
  if (cur) parts.push(cur);
  return parts.filter(Boolean);
}

function speakChunk(idx: number, chunks: string[], onDone?: () => void) {
  if (!window.speechSynthesis || idx >= chunks.length) { onDone?.(); return; }
  const u = new SpeechSynthesisUtterance(chunks[idx]);
  u.lang = "pt-BR"; u.rate = 0.95;
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.find(v => v.lang.toLowerCase().startsWith("pt") && /francisca|luciana/i.test(v.name))
          || voices.find(v => v.lang.toLowerCase().startsWith("pt"));
  if (pt) u.voice = pt;
  u.onend = () => speakChunk(idx + 1, chunks, onDone);
  u.onerror = e => { if (e.error !== "interrupted") speakChunk(idx + 1, chunks, onDone); else onDone?.(); };
  window.speechSynthesis.speak(u);
}

function speakText(text: string, onDone?: () => void) {
  if (!window.speechSynthesis) { onDone?.(); return; }
  window.speechSynthesis.cancel();
  ttsChunks = splitSpeech(text);
  if (!ttsChunks.length) { onDone?.(); return; }
  setTimeout(() => speakChunk(0, ttsChunks, onDone), 80);
}

function stopSpeaking() { ttsChunks = []; window.speechSynthesis?.cancel(); }

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-blue-900/50">
      <div className="flex items-center justify-between px-3 py-1 bg-[#071020] text-[10px] font-mono text-slate-500">
        <span>{lang || "código"}</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1 hover:text-slate-300">
          {copied ? <><Check size={10} className="text-blue-400" /> Copiado!</> : <><ClipboardCopy size={10} /> Copiar</>}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] text-slate-200 bg-[#0a1628] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}><code>{code}</code></pre>
    </div>
  );
}

// ─── Render message ───────────────────────────────────────────────────────────

function RenderContent({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      {parts.map((part, i) => {
        const m = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (m) return <CodeBlock key={i} lang={m[1]} code={m[2].trimEnd()} />;
        if (part.trim()) {
          return (
            <p key={i} className="text-[12px] leading-relaxed whitespace-pre-wrap my-1 text-slate-200">
              {part.split(/(https?:\/\/[^\s<>"']+)/g).map((chunk, j) =>
                /^https?:\/\//.test(chunk)
                  ? <a key={j} href={chunk} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{chunk}</a>
                  : <span key={j}>{chunk}</span>
              )}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
      {copied ? <><Check size={10} className="text-blue-400" /> Copiado</> : <><ClipboardCopy size={10} /> Copiar</>}
    </button>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [slots,        setSlots]        = useState<KeySlot[]>(loadSlots);
  const [activeSlot,   setActiveSlot]   = useState(() => Number(localStorage.getItem("cj_active_slot") || "0"));
  const [messages,     setMessages]     = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem("cj_messages") || "[]"); } catch { return []; }
  });
  const [doc,          setDoc]          = useState<DocResult | null>(null);
  const [docLoading,   setDocLoading]   = useState(false);
  const [docError,     setDocError]     = useState("");
  const [showDoc,      setShowDoc]      = useState(false);
  const [prompt,       setPrompt]       = useState("");
  const [streaming,    setStreaming]     = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening,  setIsListening]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [ttsEnabled,   setTtsEnabled]   = useState(() => localStorage.getItem("cj_tts") !== "false");
  const [showConfig,   setShowConfig]   = useState(false);
  const [configSlot,   setConfigSlot]   = useState(0);
  const [showKey,      setShowKey]      = useState(false);

  const abortRef   = useRef<AbortController | null>(null);
  const endRef     = useRef<HTMLDivElement>(null);
  const importRef  = useRef<HTMLInputElement>(null);
  const docRef     = useRef<HTMLInputElement>(null);
  const recRef     = useRef<any>(null);
  const sendRef    = useRef<((text?: string) => Promise<void>) | null>(null);

  useEffect(() => { localStorage.setItem("cj_slots",        JSON.stringify(slots)); },    [slots]);
  useEffect(() => { localStorage.setItem("cj_active_slot",  String(activeSlot)); },       [activeSlot]);
  useEffect(() => { localStorage.setItem("cj_messages",     JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("cj_tts",          String(ttsEnabled)); },       [ttsEnabled]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); },            [messages, streaming]);
  useEffect(() => () => { recRef.current?.stop(); }, []);

  const slot = slots[activeSlot];

  const updateSlot = (idx: number, patch: Partial<KeySlot>) => {
    setSlots(prev => {
      const next = [...prev];
      const updated = { ...next[idx], ...patch };
      if (patch.key) {
        const d = detectProvider(patch.key);
        if (d) { updated.url = d.url; updated.model = d.model; updated.provider = d.name; }
      }
      next[idx] = updated;
      return next;
    });
  };

  const sendMessage = useCallback(async (textOverride?: string) => {
    const userMsg = (textOverride ?? prompt).trim();
    if (!userMsg || isProcessing) return;

    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(" "); u.volume = 0; u.lang = "pt-BR";
      window.speechSynthesis.speak(u);
    }

    setPrompt("");
    const docContext = doc
      ? `\n\n[DOCUMENTO IMPORTADO: "${doc.name}" — ${doc.pages ? doc.pages + " páginas, " : ""}${doc.wordCount} palavras]\n\n${doc.text.slice(0, 28000)}`
      : "";

    const systemMsg = {
      role: "system" as const,
      content: `Você é um assistente jurídico especializado brasileiro. Responda sempre em português do Brasil. Use linguagem técnica jurídica quando necessário, mas seja claro e objetivo. Quando houver documento anexado, analise-o conforme solicitado.${docContext ? "\n\nDocumento disponível para análise:" + docContext : ""}`,
    };

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsProcessing(true);
    setStreaming("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const cleanKey = (slot.key || "").trim();
      if (!cleanKey) throw new Error("Configure uma chave de API no Slot " + (activeSlot + 1) + ".\n\nDica: Groq (gsk_...) é gratuito e muito rápido.");

      const cleanUrl = slot.url.trim().replace(/\/$/, "");
      const apiMessages = [
        systemMsg,
        ...newMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const resp = await fetch(`${cleanUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
          "HTTP-Referer": "https://campo-juridico.vercel.app",
          "X-Title": "Campo Jurídico SK",
        },
        body: JSON.stringify({
          model: slot.model,
          messages: apiMessages,
          stream: true,
          max_tokens: 16384,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) { const e = await resp.text(); throw new Error(e.slice(0, 400)); }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("Sem stream de resposta");
      const decoder = new TextDecoder();
      let full = ""; let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") continue;
          try {
            const p = JSON.parse(j);
            const delta = p.choices?.[0]?.delta?.content || "";
            if (delta) { full += delta; setStreaming(full); }
          } catch { }
        }
      }

      if (full.trim()) {
        setMessages(prev => [...prev, { role: "assistant", content: full, slotLabel: slot.label }]);
        if (ttsEnabled) { setIsSpeaking(true); speakText(full, () => setIsSpeaking(false)); }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => [...prev, { role: "assistant", content: `❌ ${err.message || "Erro desconhecido"}` }]);
    } finally {
      setIsProcessing(false);
      setStreaming("");
      abortRef.current = null;
    }
  }, [prompt, slot, activeSlot, messages, doc, ttsEnabled, isProcessing]);

  useEffect(() => { sendRef.current = sendMessage; }, [sendMessage]);

  const stop = () => { abortRef.current?.abort(); };
  const clear = () => { stop(); stopSpeaking(); setIsSpeaking(false); setMessages([]); setStreaming(""); localStorage.removeItem("cj_messages"); };

  const handleDocImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setDocLoading(true); setDocError(""); setDoc(null);
    try {
      const result = await readDocument(file);
      setDoc(result);
      setShowDoc(true);
    } catch (err: any) {
      setDocError(err.message || "Erro ao ler o arquivo");
    } finally {
      setDocLoading(false);
    }
  };

  const handleTxtImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const t = ev.target?.result as string; if (t) setPrompt(p => p ? p + "\n\n" + t : t); };
    reader.readAsText(file); e.target.value = "";
  };

  const exportConversation = () => {
    if (!messages.length) return;
    const d = new Date().toLocaleString("pt-BR");
    const lines = [
      "=== CAMPO JURÍDICO — ANÁLISE E CONSULTA ===",
      `Data: ${d}`,
      doc ? `Documento: ${doc.name} (${doc.wordCount} palavras)` : "",
      "",
      ...messages.flatMap(m => [
        `[${m.role === "user" ? "SOLICITAÇÃO" : `ANÁLISE · ${m.slotLabel || "IA"}`}]`,
        m.content,
        "",
      ]),
    ].filter(l => l !== undefined);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `analise-juridica-${Date.now()}.txt`; a.click();
  };

  const usePreset = (p: typeof PRESETS[0]) => {
    if (!doc) {
      setPrompt(p.prompt);
    } else {
      sendRef.current?.(p.prompt);
    }
  };

  const startVoice = useCallback(() => {
    if (isListening) { recRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome ou Edge para ditado por voz."); return; }
    stopSpeaking(); setIsSpeaking(false);
    const rec = new SR(); rec.lang = "pt-BR"; rec.continuous = true; rec.interimResults = true;
    let silTimer: ReturnType<typeof setTimeout> | null = null;
    let full = "";
    rec.onresult = (e: any) => {
      let fin = ""; let int_ = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else int_ += e.results[i][0].transcript;
      }
      full = fin || int_; setPrompt(full);
      if (full) {
        if (silTimer) clearTimeout(silTimer);
        silTimer = setTimeout(() => {
          try { rec.stop(); } catch { }
          if (full.trim()) { setPrompt(""); sendRef.current?.(full.trim()); }
        }, 1800);
      }
    };
    rec.onerror = () => { if (silTimer) clearTimeout(silTimer); recRef.current = null; setIsListening(false); };
    rec.onend   = () => { if (silTimer) clearTimeout(silTimer); recRef.current = null; setIsListening(false); };
    recRef.current = rec;
    try { rec.start(); setIsListening(true); } catch { setIsListening(false); }
  }, [isListening]);

  const allMsgs = [
    ...messages,
    ...(streaming ? [{ role: "assistant" as const, content: streaming, isStreaming: true }] : []),
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0a1628] text-slate-200" style={{ maxWidth: 640, margin: "0 auto" }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="h-12 flex items-center px-4 bg-[#0d1f3c] border-b border-blue-900/50 shrink-0 gap-2">
        <Scale size={16} className="text-blue-400 shrink-0" />
        <span className="text-sm font-bold tracking-tight">Campo Jurídico</span>
        <span className="text-[10px] text-slate-600 ml-1">por Saulo Kenji</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => { setConfigSlot(activeSlot); setShowConfig(v => !v); }}
            className={`p-1.5 rounded-lg text-[11px] transition-colors ${showConfig ? "bg-white/10 text-slate-200 border border-slate-600" : "text-slate-500 hover:text-slate-400"}`}
            title="Configurar chaves de API"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* ── Config panel ────────────────────────────────────────── */}
      {showConfig && (
        <div className="mx-2 mt-2 p-3 rounded-2xl bg-[#0d1f3c] border border-blue-900/50 shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chaves de API</span>
            <div className="flex gap-1 ml-auto">
              {[0,1,2,3].map(i => (
                <button key={i} onClick={() => setConfigSlot(i)}
                  className={`w-7 h-6 rounded-lg text-[10px] font-bold transition-colors ${configSlot === i ? "bg-blue-800/50 text-blue-300 border border-blue-700/50" : "bg-white/5 text-slate-500"}`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
          <input value={slots[configSlot]?.label || ""} onChange={e => updateSlot(configSlot, { label: e.target.value })}
            placeholder="Nome do slot" className="w-full h-7 px-2 text-[11px] bg-[#0a1628] border border-blue-900/40 rounded-lg text-slate-300 outline-none" />
          <div className="flex gap-1">
            <input type={showKey ? "text" : "password"} value={slots[configSlot]?.key || ""}
              onChange={e => updateSlot(configSlot, { key: e.target.value.trim() })}
              placeholder="gsk_..., AIza..., sk-..., pplx-..., xai-..., sk-or-..."
              className="flex-1 h-8 px-2 text-[11px] font-mono bg-[#0a1628] border border-blue-900/40 rounded-xl text-slate-200 outline-none focus:border-blue-500/60" />
            <button onClick={() => setShowKey(v => !v)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-500">
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <input value={slots[configSlot]?.url || ""} onChange={e => updateSlot(configSlot, { url: e.target.value })}
              placeholder="URL da API" className="h-7 px-2 text-[10px] font-mono bg-[#0a1628] border border-blue-900/40 rounded-lg text-slate-500 outline-none" />
            <input value={slots[configSlot]?.model || ""} onChange={e => updateSlot(configSlot, { model: e.target.value })}
              placeholder="Modelo" className="h-7 px-2 text-[10px] font-mono bg-[#0a1628] border border-blue-900/40 rounded-lg text-slate-500 outline-none" />
          </div>
          {slots[configSlot]?.key && detectProvider(slots[configSlot].key) && (
            <p className="text-[10px] text-blue-400">✓ {detectProvider(slots[configSlot].key)?.name} · {slots[configSlot].model}</p>
          )}
          <p className="text-[9px] text-slate-700">Groq (gsk_) é gratuito · cole a chave e o provider é detectado automaticamente</p>

          {/* Slot tabs for quick switch */}
          <div className="flex gap-1 pt-1">
            {slots.map((s, i) => {
              const hasKey = !!s.key.trim();
              const d = hasKey ? detectProvider(s.key) : null;
              return (
                <button key={i} onClick={() => { setActiveSlot(i); setShowConfig(false); }}
                  className={`flex-1 text-center px-1 py-1.5 rounded-xl text-[9px] font-semibold border transition-all ${
                    activeSlot === i ? "bg-blue-800/40 border-blue-600/50 text-blue-300" : "bg-white/4 border-blue-900/30 text-slate-600"
                  }`}>
                  <div>{s.label}</div>
                  <div className="font-normal opacity-80 truncate">{hasKey ? (d?.name || "Custom") : "—"}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Active slot pill ─────────────────────────────────────── */}
      {!showConfig && (
        <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
          <div className="flex gap-1">
            {slots.map((s, i) => {
              const hasKey = !!s.key.trim();
              const d = hasKey ? detectProvider(s.key) : null;
              return (
                <button key={i} onClick={() => setActiveSlot(i)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    activeSlot === i ? "bg-blue-800/40 border-blue-600/50 text-blue-300" : "bg-white/4 border-blue-900/30 text-slate-600 hover:border-blue-800/50"
                  }`}>
                  {s.label}{hasKey ? ` · ${d?.name || "Custom"}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Document panel ───────────────────────────────────────── */}
      <div className="mx-2 mb-1 shrink-0">
        <div
          onClick={() => docRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl px-4 py-3 cursor-pointer transition-all ${
            doc ? "border-blue-700/40 bg-[#0d1f3c]/50" : "border-blue-900/40 hover:border-blue-700/50 bg-[#0d1f3c]/30"
          }`}
        >
          <input ref={docRef} type="file" accept=".pdf,.docx,.txt,.md,.rtf,.csv,.json,.html" className="hidden" onChange={handleDocImport} />
          {docLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Loader2 size={14} className="animate-spin text-blue-400" /> Lendo documento…
            </div>
          ) : doc ? (
            <div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-400 shrink-0" />
                <span className="text-[12px] font-semibold text-slate-200 truncate flex-1">{doc.name}</span>
                <span className="text-[10px] text-slate-500">{doc.type}{doc.pages ? ` · ${doc.pages}p` : ""} · {doc.wordCount.toLocaleString()} palavras</span>
                <button
                  onClick={e => { e.stopPropagation(); setDoc(null); setShowDoc(false); }}
                  className="p-1 rounded-lg hover:bg-red-900/20 text-slate-600 hover:text-red-400 transition-colors"
                  title="Remover documento"
                >
                  <X size={13} />
                </button>
              </div>
              {showDoc && (
                <div className="mt-2 max-h-28 overflow-y-auto rounded-xl bg-[#0a1628] border border-blue-900/30 p-2 text-[10px] font-mono text-slate-500 leading-relaxed">
                  {doc.text.slice(0, 1500)}{doc.text.length > 1500 ? "…" : ""}
                </div>
              )}
              <button
                onClick={e => { e.stopPropagation(); setShowDoc(v => !v); }}
                className="mt-1 flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showDoc ? <><ChevronUp size={10} /> Ocultar texto</> : <><ChevronDown size={10} /> Ver texto extraído</>}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Upload size={16} className="text-blue-700 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Importar documento para análise</p>
                <p className="text-[10px] text-slate-600">PDF, Word (.docx), TXT, MD — clique para selecionar</p>
              </div>
            </div>
          )}
        </div>
        {docError && <p className="text-[10px] text-red-400 mt-1 px-1">{docError}</p>}
      </div>

      {/* ── Presets ───────────────────────────────────────────────── */}
      {(doc || messages.length === 0) && (
        <div className="px-2 mb-1 shrink-0">
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => usePreset(p)}
                className={`whitespace-nowrap flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-medium shrink-0 transition-all ${
                  doc
                    ? "bg-blue-900/20 border-blue-800/40 text-blue-300 hover:bg-blue-900/40"
                    : "bg-white/4 border-slate-700/40 text-slate-500 hover:border-slate-600/50 hover:text-slate-400"
                }`}
                title={doc ? "Aplicar ao documento" : "Adicionar ao campo de texto"}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-0">
        {allMsgs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
              <Scale size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-slate-300 text-sm font-semibold">Assistente Jurídico</p>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Configure um slot com sua chave de API.<br />
                Importe um documento e use os botões acima<br />
                ou faça uma consulta diretamente.
              </p>
            </div>
            <div className="mt-1 p-3 rounded-2xl bg-[#0d1f3c]/60 border border-blue-900/30 text-left max-w-xs">
              <p className="text-[10px] text-blue-400 font-semibold mb-1">💡 Início rápido gratuito:</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                1. Crie uma chave gratuita em <strong className="text-slate-400">console.groq.com</strong><br />
                2. Cole no Slot 1 (⚙️ Configurações)<br />
                3. Importe seu documento e analise
              </p>
            </div>
          </div>
        )}

        {allMsgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-2xl px-3 py-2.5 ${
              msg.role === "user"
                ? "bg-blue-800/30 border border-blue-700/30 text-slate-100 rounded-br-sm"
                : "bg-[#0d1f3c] border border-blue-900/40 rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <>
                  <RenderContent text={msg.content} />
                  {(msg as any).isStreaming ? (
                    <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse ml-0.5 rounded-sm" />
                  ) : (
                    <div className="flex items-center gap-2.5 mt-2 pt-1.5 border-t border-blue-900/20">
                      <CopyBtn text={msg.content} />
                      {ttsEnabled && (
                        <button onClick={() => { setIsSpeaking(true); speakText(msg.content, () => setIsSpeaking(false)); }}
                          className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-blue-400 transition-colors">
                          <Volume2 size={10} /> Ouvir
                        </button>
                      )}
                    </div>
                  )}
                  {!((msg as any).isStreaming) && (msg as Message).slotLabel && (
                    <div className="text-[9px] text-slate-700 mt-1">{(msg as Message).slotLabel}</div>
                  )}
                </>
              ) : (
                <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* ── Input area ────────────────────────────────────────────── */}
      <div className="border-t border-blue-900/40 bg-[#0d1f3c] px-2 pt-1.5 pb-2 shrink-0">
        <div className="flex items-center gap-1 mb-1.5">
          <button onClick={exportConversation} disabled={!messages.length} title="Exportar análise (.txt)"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 disabled:opacity-30 transition-colors">
            <Download size={13} />
          </button>
          <button onClick={() => importRef.current?.click()} title="Colar texto no campo"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-colors">
            <Upload size={13} />
          </button>
          <input ref={importRef} type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={handleTxtImport} />
          <button onClick={() => { setTtsEnabled(v => { const n = !v; if (!n) { stopSpeaking(); setIsSpeaking(false); } return n; }); }}
            title={ttsEnabled ? "Voz ativada" : "Voz desativada"}
            className={`p-1.5 rounded-lg transition-colors ${ttsEnabled ? "text-blue-400" : "text-slate-600 hover:text-slate-400"}`}>
            {ttsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          {isSpeaking && (
            <button onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-red-400 bg-red-900/20 border border-red-800/30 animate-pulse">
              <StopCircle size={11} /> Parar
            </button>
          )}
          <div className="flex-1" />
          <button onClick={clear} title="Limpar conversa"
            className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-900/15 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex gap-1.5 items-end">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={doc ? `Pergunte sobre "${doc.name}"… ou use os botões acima` : "Consulta jurídica… (Enter envia · Shift+Enter nova linha)"}
            rows={1}
            className="flex-1 resize-none bg-[#0a1628] border border-blue-900/40 rounded-2xl px-3 py-2.5 text-[12px] text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/60 transition-colors leading-relaxed"
            style={{ minHeight: 44, maxHeight: 160 }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <button onClick={startVoice} title="Ditar por voz"
            className={`w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-all ${
              isListening ? "bg-red-600 text-white animate-pulse" : "bg-[#0a1628] border border-blue-900/40 text-slate-500 hover:text-blue-400 hover:border-blue-700/50"
            }`}>
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          {isProcessing ? (
            <button onClick={stop}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-red-900/30 border border-red-700/40 text-red-400 shrink-0">
              <StopCircle size={16} />
            </button>
          ) : (
            <button onClick={() => sendMessage()} disabled={!prompt.trim() && !doc}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-700/30 border border-blue-600/40 text-blue-400 hover:bg-blue-700/50 disabled:opacity-30 shrink-0 transition-all">
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
