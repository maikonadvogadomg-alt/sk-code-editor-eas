import { useState } from "react";
import { Plus, Trash2, Download, ClipboardCopy, Check, FileCode, Save } from "lucide-react";

interface Snippet {
  id: string;
  name: string;
  lang: string;
  code: string;
  created: number;
}

const LANGS = ["javascript", "typescript", "python", "html", "css", "json", "bash", "rust", "go", "java", "sql", "markdown", "text"];

const EXT: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", html: "html", css: "css",
  json: "json", bash: "sh", rust: "rs", go: "go", java: "java", sql: "sql",
  markdown: "md", text: "txt",
};

function loadSnippets(): Snippet[] {
  try { return JSON.parse(localStorage.getItem("ska_snippets") || "[]"); }
  catch { return []; }
}

export default function Playground() {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [name, setName]           = useState("");
  const [lang, setLang]           = useState("javascript");
  const [code, setCode]           = useState("");
  const [copied, setCopied]       = useState(false);

  const persist = (next: Snippet[]) => {
    setSnippets(next);
    localStorage.setItem("ska_snippets", JSON.stringify(next));
  };

  const createNew = () => { setActiveId(null); setName(""); setCode(""); setLang("javascript"); };

  const save = () => {
    if (!name.trim() || !code.trim()) return;
    if (activeId) {
      persist(snippets.map(s => s.id === activeId ? { ...s, name, lang, code } : s));
    } else {
      const s: Snippet = { id: Date.now().toString(), name: name.trim(), lang, code, created: Date.now() };
      persist([...snippets, s]);
      setActiveId(s.id);
    }
  };

  const loadSnippet = (s: Snippet) => {
    setActiveId(s.id); setName(s.name); setLang(s.lang); setCode(s.code);
  };

  const deleteSnippet = (id: string) => {
    persist(snippets.filter(s => s.id !== id));
    if (activeId === id) createNew();
  };

  const download = () => {
    if (!code.trim()) return;
    const ext = EXT[lang] || lang;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (name.trim() || "snippet") + "." + ext;
    a.click();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 p-2 gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <FileCode size={14} className="text-green-500" />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Playground de Código</span>
        <button
          onClick={createNew}
          className="flex items-center gap-1 ml-auto text-[10px] px-2.5 py-1 rounded-lg bg-green-700/30 border border-green-600/40 text-green-400 hover:bg-green-700/50 transition-colors"
        >
          <Plus size={11} /> Novo
        </button>
      </div>

      {/* Saved snippets tabs */}
      {snippets.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-1 shrink-0" style={{ scrollbarWidth: "none" }}>
          {snippets.map(s => (
            <div
              key={s.id}
              className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-[10px] border shrink-0 cursor-pointer transition-colors ${
                activeId === s.id
                  ? "bg-green-800/40 border-green-700/40 text-green-300"
                  : "bg-white/4 border-gray-700/40 text-gray-500 hover:border-gray-600/50 hover:text-gray-400"
              }`}
              onClick={() => loadSnippet(s)}
            >
              <FileCode size={10} />
              <span>{s.name}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteSnippet(s.id); }}
                className="ml-1 text-gray-700 hover:text-red-400 transition-colors"
                title="Excluir snippet"
              >
                <Trash2 size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Name + lang row */}
      <div className="flex gap-1 shrink-0">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); }}
          placeholder="Nome do arquivo (ex: meu-script)"
          className="flex-1 h-9 px-3 text-[11px] bg-[#141c0d] border border-gray-700/50 rounded-xl text-gray-200 outline-none focus:border-green-600/60 transition-colors placeholder-gray-700"
        />
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="h-9 px-2 text-[10px] bg-[#141c0d] border border-gray-700/50 rounded-xl text-gray-400 outline-none appearance-none cursor-pointer"
        >
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Code area */}
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder={"Cole ou escreva seu código aqui…\n\nDica: você pode pedir ao chat para gerar código,\ne depois copiar e colar aqui para salvar e baixar."}
        spellCheck={false}
        className="flex-1 resize-none bg-[#141c0d] border border-gray-700/50 rounded-2xl px-3 py-3 text-[11px] text-gray-200 placeholder-gray-700 outline-none focus:border-green-600/60 transition-colors leading-relaxed min-h-0"
        style={{ fontFamily: "var(--font-mono)" }}
      />

      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={save}
          disabled={!name.trim() || !code.trim()}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 text-[11px] font-semibold rounded-xl bg-green-700/30 border border-green-600/40 text-green-400 hover:bg-green-700/50 disabled:opacity-30 transition-all"
        >
          <Save size={13} /> {activeId ? "Atualizar" : "Salvar"}
        </button>
        <button
          onClick={copyCode}
          disabled={!code.trim()}
          className="flex items-center gap-1.5 h-9 px-3 text-[11px] rounded-xl bg-white/4 border border-gray-700/40 text-gray-400 hover:border-gray-600/50 disabled:opacity-30 transition-colors"
        >
          {copied
            ? <><Check size={12} className="text-green-400" /> Copiado</>
            : <><ClipboardCopy size={12} /> Copiar</>
          }
        </button>
        <button
          onClick={download}
          disabled={!code.trim()}
          className="flex items-center gap-1.5 h-9 px-3 text-[11px] rounded-xl bg-white/4 border border-gray-700/40 text-gray-400 hover:border-gray-600/50 disabled:opacity-30 transition-colors"
        >
          <Download size={12} /> Baixar
        </button>
      </div>

      {snippets.length === 0 && !code && (
        <p className="text-[10px] text-gray-700 text-center shrink-0 pb-1">
          Snippets salvos ficam aqui. Tudo fica armazenado localmente no seu dispositivo.
        </p>
      )}
    </div>
  );
}
