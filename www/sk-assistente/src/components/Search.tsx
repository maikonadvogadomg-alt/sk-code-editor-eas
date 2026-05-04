import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, Loader2, ExternalLink, MessageSquare, X } from "lucide-react";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchProps {
  onSendToChat?: (q: string) => void;
  initialQuery?: string;
  onInitialQueryConsumed?: () => void;
}

export default function Search({ onSendToChat, initialQuery, onInitialQueryConsumed }: SearchProps) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery.trim());
      onInitialQueryConsumed?.();
      doSearch(initialQuery.trim());
    }
  }, [initialQuery]);

  const doSearch = async (q?: string) => {
    const searchQ = (q ?? query).trim();
    if (!searchQ) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`);
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `Erro ${resp.status}`);
      }
      const data = await resp.json();
      if (data.results?.length) setResults(data.results);
      else setError("Nenhum resultado encontrado.");
    } catch (err: any) {
      setError(err.message || "Erro na busca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setQuery(""); setResults([]); setError(""); inputRef.current?.focus(); };

  return (
    <div className="flex flex-col flex-1 min-h-0 p-2 gap-2">
      {/* Search bar */}
      <div className="flex gap-1.5 shrink-0">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") doSearch(); }}
            placeholder="Pesquisar na internet…"
            className="w-full h-10 pl-3 pr-8 text-[12px] bg-[#141c0d] border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-600 outline-none focus:border-green-600/60 transition-colors"
          />
          {query && (
            <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => doSearch()}
          disabled={!query.trim() || loading}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-700/30 border border-green-600/40 text-green-400 hover:bg-green-700/50 disabled:opacity-40 transition-all shrink-0"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <SearchIcon size={15} />}
        </button>
      </div>

      {/* Quick suggestions */}
      {!results.length && !loading && !error && (
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {["direito do trabalho", "planejamento jurídico", "prazo processual", "jurisprudência STJ", "modelo de petição"].map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); doSearch(s); }}
              className="text-[10px] px-2.5 py-1 rounded-full border border-gray-700/40 text-gray-600 hover:border-green-700/50 hover:text-green-400 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400 px-1 shrink-0">{error}</p>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {results.map((r, i) => (
          <div key={i} className="p-3 rounded-2xl bg-[#1c2714] border border-gray-700/30 space-y-1.5">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 text-blue-400 hover:text-blue-300 text-[12px] font-medium hover:underline"
            >
              <span className="flex-1 leading-snug">{r.title}</span>
              <ExternalLink size={10} className="shrink-0 mt-0.5" />
            </a>
            <p className="text-[10px] text-gray-600 break-all">{new URL(r.url).hostname}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">{r.snippet}</p>
            <div className="flex items-center gap-2 pt-1">
              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(`Encontrei este resultado:\n\n**${r.title}**\n${r.snippet}\n\nFonte: ${r.url}\n\nAnalise e me explique de forma prática.`)}
                  className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-green-400 transition-colors"
                >
                  <MessageSquare size={10} /> Enviar para chat
                </button>
              )}
            </div>
          </div>
        ))}

        {!loading && !error && results.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-10">
            <SearchIcon size={28} className="text-gray-700" />
            <p className="text-gray-600 text-[11px]">Digite algo e pressione Enter<br />para buscar na internet.</p>
            <p className="text-gray-700 text-[10px]">Os resultados aparecem com link clicável<br />e botão para enviar ao chat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
