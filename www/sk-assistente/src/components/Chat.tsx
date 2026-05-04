import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send, Mic, MicOff, Volume2, VolumeX, Settings, Trash2,
  ClipboardCopy, Check, StopCircle, Download, Upload,
  Eye, EyeOff, Search,
} from "lucide-react";

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

function detectProvider(key: string): { url: string; model: string; name: string } | null {
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
  try { return JSON.parse(localStorage.getItem("ska_slots") || "null") || defaultSlots(); }
  catch { return defaultSlots(); }
}

// ─── Message ──────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  slotLabel?: string;
}

// ─── TTS (Web Speech API) ─────────────────────────────────────────────────────

let ttsChunks: string[] = [];

function splitIntoChunks(text: string): string[] {
  const clean = text
    .replace(/```[\s\S]*?```/g, " (código omitido) ")
    .replace(/`[^`]+`/g, m => m.slice(1, -1))
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
  const parts: string[] = [];
  const sentences = clean.match(/[^.!?…]+[.!?…]+|[^.!?…]{20,}/g) || [clean];
  let cur = "";
  for (const s of sentences) {
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
  const utt = new SpeechSynthesisUtterance(chunks[idx]);
  utt.lang = "pt-BR"; utt.rate = 1.0; utt.pitch = 0.95;
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.find(v => v.lang.toLowerCase().startsWith("pt") && /francisca|luciana/i.test(v.name))
          || voices.find(v => v.lang.toLowerCase().startsWith("pt"));
  if (pt) utt.voice = pt;
  utt.onend = () => speakChunk(idx + 1, chunks, onDone);
  utt.onerror = e => { if (e.error !== "interrupted") speakChunk(idx + 1, chunks, onDone); else onDone?.(); };
  window.speechSynthesis.speak(utt);
}

function speakText(text: string, onDone?: () => void) {
  if (!window.speechSynthesis) { onDone?.(); return; }
  window.speechSynthesis.cancel();
  ttsChunks = splitIntoChunks(text);
  if (!ttsChunks.length) { onDone?.(); return; }
  setTimeout(() => speakChunk(0, ttsChunks, onDone), 80);
}

function stopSpeaking() {
  ttsChunks = [];
  window.speechSynthesis?.cancel();
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative my-2 rounded-xl overflow-hidden border border-gray-700/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a1008] text-[10px] font-mono text-gray-500">
        <span>{lang || "código"}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1 hover:text-gray-300 transition-colors"
        >
          {copied ? <><Check size={10} className="text-green-400" /> Copiado!</> : <><ClipboardCopy size={10} /> Copiar</>}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] text-gray-200 bg-[#141c0d] leading-relaxed">
        <code style={{ fontFamily: "var(--font-mono)" }}>{code}</code>
      </pre>
    </div>
  );
}

// ─── Render message content ───────────────────────────────────────────────────

function RenderContent({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      {parts.map((part, i) => {
        const m = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (m) return <CodeBlock key={i} lang={m[1]} code={m[2].trimEnd()} />;
        if (part.trim()) {
          const urlRe = /(https?:\/\/[^\s<>"']+)/g;
          return (
            <p key={i} className="text-[12px] leading-relaxed whitespace-pre-wrap my-1 text-gray-200">
              {part.split(urlRe).map((chunk, j) =>
                urlRe.test(chunk)
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

// ─── Chat component ───────────────────────────────────────────────────────────

interface ChatProps {
  onSendToSearch?: (q: string) => void;
  pendingMessage?: string;
  onPendingConsumed?: () => void;
}

export default function Chat({ onSendToSearch, pendingMessage, onPendingConsumed }: ChatProps) {
  const [slots, setSlots]           = useState<KeySlot[]>(loadSlots);
  const [activeSlot, setActiveSlot] = useState(() => Number(localStorage.getItem("ska_active_slot") || "0"));
  const [messages, setMessages]     = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem("ska_messages") || "[]"); } catch { return []; }
  });
  const [prompt,       setPrompt]       = useState("");
  const [streaming,    setStreaming]     = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening,  setIsListening]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [ttsEnabled,   setTtsEnabled]   = useState(() => localStorage.getItem("ska_tts") !== "false");
  const [showConfig,   setShowConfig]   = useState(false);
  const [configSlot,   setConfigSlot]   = useState(0);
  const [showKey,      setShowKey]      = useState(false);

  const abortRef     = useRef<AbortController | null>(null);
  const endRef       = useRef<HTMLDivElement>(null);
  const importRef    = useRef<HTMLInputElement>(null);
  const recRef       = useRef<any>(null);
  const sendMsgRef   = useRef<((text?: string) => Promise<void>) | null>(null);

  useEffect(() => { localStorage.setItem("ska_slots",        JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem("ska_active_slot",  String(activeSlot)); },   [activeSlot]);
  useEffect(() => { localStorage.setItem("ska_messages",     JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("ska_tts",          String(ttsEnabled)); },    [ttsEnabled]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); },          [messages, streaming]);
  useEffect(() => () => { recRef.current?.stop(); }, []);

  useEffect(() => {
    if (pendingMessage && pendingMessage.trim()) {
      setPrompt(pendingMessage);
      onPendingConsumed?.();
    }
  }, [pendingMessage]);

  const slot = slots[activeSlot];

  const updateSlot = (idx: number, patch: Partial<KeySlot>) => {
    setSlots(prev => {
      const next = [...prev];
      const updated = { ...next[idx], ...patch };
      if (patch.key !== undefined && patch.key) {
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
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsProcessing(true);
    setStreaming("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const cleanKey = (slot.key || "").trim();
      if (!cleanKey) throw new Error("Configure uma chave de API no Slot " + (activeSlot + 1) + " para enviar mensagens.");

      const cleanUrl = slot.url.trim().replace(/\/$/, "");
      const resp = await fetch(`${cleanUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
          "HTTP-Referer": "https://sk-assistente.vercel.app",
          "X-Title": "SK Assistente",
        },
        body: JSON.stringify({
          model: slot.model,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
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
        const aMsg: Message = { role: "assistant", content: full, slotLabel: slot.label };
        setMessages(prev => [...prev, aMsg]);
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
  }, [prompt, slot, activeSlot, messages, ttsEnabled, isProcessing]);

  useEffect(() => { sendMsgRef.current = sendMessage; }, [sendMessage]);

  const stop = () => { abortRef.current?.abort(); };
  const clear = () => { stop(); stopSpeaking(); setIsSpeaking(false); setMessages([]); setStreaming(""); localStorage.removeItem("ska_messages"); };

  const exportChat = () => {
    if (!messages.length) return;
    const d = new Date().toLocaleString("pt-BR");
    const lines = ["=== SK Assistente — Conversa ===", `Data: ${d}`, ""];
    messages.forEach(m => { lines.push(`[${m.role === "user" ? "VOCÊ" : `IA · ${m.slotLabel || "Slot"}`}]`); lines.push(m.content); lines.push(""); });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `conversa-sk-${Date.now()}.txt`; a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const t = ev.target?.result as string; if (t) setPrompt(p => p ? p + "\n\n" + t : t); };
    reader.readAsText(file); e.target.value = "";
  };

  const startVoice = useCallback(() => {
    if (isListening) { recRef.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome ou Edge para ditado por voz."); return; }
    stopSpeaking(); setIsSpeaking(false);
    const rec = new SR(); rec.lang = "pt-BR"; rec.continuous = true; rec.interimResults = true;
    let silTimer: ReturnType<typeof setTimeout> | null = null;
    let fullText = "";

    rec.onresult = (e: any) => {
      let fin = ""; let int_ = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else int_ += e.results[i][0].transcript;
      }
      fullText = fin || int_;
      setPrompt(fullText);
      if (fullText) {
        if (silTimer) clearTimeout(silTimer);
        silTimer = setTimeout(() => {
          try { rec.stop(); } catch { }
          if (fullText.trim()) { setPrompt(""); sendMsgRef.current?.(fullText.trim()); }
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
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Slot selector ─────────────────────────────────────── */}
      <div className="flex gap-1 p-2 shrink-0">
        {slots.map((s, i) => {
          const hasKey = !!s.key.trim();
          const d = hasKey ? detectProvider(s.key) : null;
          return (
            <button
              key={i}
              onClick={() => { setActiveSlot(i); setShowConfig(false); }}
              className={`flex-1 text-center px-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                activeSlot === i
                  ? "bg-green-800/40 border border-green-600/50 text-green-300"
                  : "bg-white/4 border border-gray-700/40 text-gray-500 hover:border-gray-600/50 hover:text-gray-400"
              }`}
            >
              <div>{s.label}</div>
              <div className="text-[9px] font-normal mt-0.5 truncate opacity-80">
                {hasKey ? (d?.name || "Custom") : "sem chave"}
              </div>
            </button>
          );
        })}
        <button
          onClick={() => { setConfigSlot(activeSlot); setShowConfig(v => !v); }}
          className={`w-9 flex items-center justify-center rounded-xl border transition-colors ${
            showConfig
              ? "bg-white/10 border-gray-500 text-gray-200"
              : "bg-white/4 border-gray-700/40 text-gray-600 hover:border-gray-600/50 hover:text-gray-400"
          }`}
        >
          <Settings size={14} />
        </button>
      </div>

      {/* ── Config panel ──────────────────────────────────────── */}
      {showConfig && (
        <div className="mx-2 mb-1 p-3 rounded-2xl bg-[#1c2714] border border-gray-700/40 shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configurar chave</span>
            <div className="flex gap-1 ml-auto">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setConfigSlot(i)}
                  className={`w-7 h-6 rounded-lg text-[10px] font-bold transition-colors ${
                    configSlot === i ? "bg-green-800/50 text-green-300 border border-green-700/50" : "bg-white/5 text-gray-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <input
            value={slots[configSlot]?.label || ""}
            onChange={e => updateSlot(configSlot, { label: e.target.value })}
            placeholder="Nome do slot"
            className="w-full h-7 px-2 text-[11px] bg-[#141c0d] border border-gray-700/40 rounded-lg text-gray-300 outline-none"
          />

          <div className="flex gap-1">
            <input
              type={showKey ? "text" : "password"}
              value={slots[configSlot]?.key || ""}
              onChange={e => updateSlot(configSlot, { key: e.target.value.trim() })}
              placeholder="gsk_..., AIza..., sk-..., pplx-..., xai-..., sk-or-..."
              className="flex-1 h-8 px-2 text-[11px] font-mono bg-[#141c0d] border border-gray-700/50 rounded-xl text-gray-200 outline-none focus:border-green-600/60"
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-500"
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <input
              value={slots[configSlot]?.url || ""}
              onChange={e => updateSlot(configSlot, { url: e.target.value })}
              placeholder="URL da API"
              className="h-7 px-2 text-[10px] font-mono bg-[#141c0d] border border-gray-700/40 rounded-lg text-gray-400 outline-none"
            />
            <input
              value={slots[configSlot]?.model || ""}
              onChange={e => updateSlot(configSlot, { model: e.target.value })}
              placeholder="Modelo"
              className="h-7 px-2 text-[10px] font-mono bg-[#141c0d] border border-gray-700/40 rounded-lg text-gray-400 outline-none"
            />
          </div>

          {slots[configSlot]?.key && detectProvider(slots[configSlot].key) && (
            <p className="text-[10px] text-green-400 flex items-center gap-1">
              ✓ Detectado: <strong>{detectProvider(slots[configSlot].key)?.name}</strong>
              &nbsp;·&nbsp;{slots[configSlot].model}
            </p>
          )}

          <p className="text-[9px] text-gray-700 mt-1">
            Prefixos: gsk_ = Groq · sk- = OpenAI · AIza = Google · pplx- = Perplexity · xai- = Grok · sk-ant = Anthropic · sk-or- = OpenRouter
          </p>
        </div>
      )}

      {/* ── Messages ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-0">
        {allMsgs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700/30 flex items-center justify-center text-3xl select-none">🌿</div>
            <div>
              <p className="text-gray-300 text-sm font-semibold">SK Assistente</p>
              <p className="text-gray-600 text-[11px] mt-1 leading-relaxed">
                Configure um slot com sua chave de API.<br/>
                Você pode usar Groq (gratuito), OpenAI, Gemini,<br/>
                Perplexity, xAI ou OpenRouter.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mt-1">
              {["Me ajude a planejar algo", "Analise este texto:", "Resuma isso para mim:", "O que você consegue fazer?"].map(s => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-gray-700/50 text-gray-500 hover:border-green-700/50 hover:text-green-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {allMsgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-3 py-2.5 ${
                msg.role === "user"
                  ? "bg-green-800/40 border border-green-700/30 text-gray-100 rounded-br-sm"
                  : "bg-[#1c2714] border border-gray-700/30 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  <RenderContent text={msg.content} />
                  {(msg as any).isStreaming ? (
                    <span className="inline-block w-1.5 h-3.5 bg-green-400 animate-pulse ml-0.5 rounded-sm" />
                  ) : (
                    <div className="flex items-center gap-2.5 mt-2 pt-1.5 border-t border-gray-700/20">
                      <MsgCopyBtn text={msg.content} />
                      {ttsEnabled && (
                        <button
                          onClick={() => { setIsSpeaking(true); speakText(msg.content, () => setIsSpeaking(false)); }}
                          className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-green-400 transition-colors"
                        >
                          <Volume2 size={10} /> Ouvir
                        </button>
                      )}
                      {onSendToSearch && (
                        <button
                          onClick={() => onSendToSearch(msg.content.slice(0, 100).replace(/[^\w\sáéíóúãõâêôàüç]/g, " ").trim())}
                          className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-blue-400 transition-colors"
                        >
                          <Search size={10} /> Buscar
                        </button>
                      )}
                    </div>
                  )}
                  {!((msg as any).isStreaming) && (msg as Message).slotLabel && (
                    <div className="text-[9px] text-gray-700 mt-1">{(msg as Message).slotLabel}</div>
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

      {/* ── Input area ────────────────────────────────────────── */}
      <div className="border-t border-gray-700/40 bg-[#1c2714] px-2 pt-1.5 pb-2 shrink-0">
        <div className="flex items-center gap-1 mb-1.5">
          <button onClick={exportChat} disabled={!messages.length} title="Exportar conversa (.txt)"
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 disabled:opacity-30 transition-colors">
            <Download size={13} />
          </button>
          <button onClick={() => importRef.current?.click()} title="Importar arquivo de texto"
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors">
            <Upload size={13} />
          </button>
          <input ref={importRef} type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={handleImport} />
          <button
            onClick={() => { setTtsEnabled(v => { const n = !v; if (!n) { stopSpeaking(); setIsSpeaking(false); } return n; }); }}
            title={ttsEnabled ? "Voz ativada — clique para desativar" : "Voz desativada — clique para ativar"}
            className={`p-1.5 rounded-lg transition-colors ${ttsEnabled ? "text-green-400" : "text-gray-600 hover:text-gray-400"}`}
          >
            {ttsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          {isSpeaking && (
            <button onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-red-400 bg-red-900/20 border border-red-800/30 animate-pulse">
              <StopCircle size={11} /> Parar voz
            </button>
          )}
          <div className="flex-1" />
          <button onClick={clear} title="Limpar conversa"
            className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-900/15 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex gap-1.5 items-end">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Digite ou fale sua mensagem… (Enter envia · Shift+Enter nova linha)"
            rows={1}
            className="flex-1 resize-none bg-[#141c0d] border border-gray-700/50 rounded-2xl px-3 py-2.5 text-[12px] text-gray-200 placeholder-gray-600 outline-none focus:border-green-600/60 transition-colors leading-relaxed"
            style={{ minHeight: 44, maxHeight: 160 }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <button
            onClick={startVoice}
            title="Ditar por voz"
            className={`w-11 h-11 flex items-center justify-center rounded-2xl shrink-0 transition-all ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-[#141c0d] border border-gray-700/50 text-gray-500 hover:text-green-400 hover:border-green-700/50"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          {isProcessing ? (
            <button onClick={stop}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-red-900/30 border border-red-700/40 text-red-400 shrink-0">
              <StopCircle size={16} />
            </button>
          ) : (
            <button onClick={() => sendMessage()} disabled={!prompt.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-green-700/30 border border-green-600/40 text-green-400 hover:bg-green-700/50 disabled:opacity-30 shrink-0 transition-all">
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MsgCopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
    >
      {copied ? <><Check size={10} className="text-green-400" /> Copiado</> : <><ClipboardCopy size={10} /> Copiar</>}
    </button>
  );
}
