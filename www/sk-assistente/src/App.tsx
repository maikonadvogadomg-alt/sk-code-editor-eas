import { useState } from "react";
import { MessageSquare, Code2, Search as SearchIcon } from "lucide-react";
import Chat from "./components/Chat";
import Playground from "./components/Playground";
import Search from "./components/Search";

type Tab = "chat" | "playground" | "search";

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingChat, setPendingChat] = useState("");

  const sendToSearch = (q: string) => {
    setPendingSearch(q);
    setTab("search");
  };

  const sendToChat = (q: string) => {
    setPendingChat(q);
    setTab("chat");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#141c0d] text-gray-200" style={{ maxWidth: 600, margin: "0 auto" }}>
      <header className="h-12 flex items-center px-4 bg-[#1c2714] border-b border-gray-700/50 shrink-0 gap-2">
        <span className="text-green-400 text-lg">🌿</span>
        <span className="text-sm font-bold tracking-tight">SK Assistente</span>
        <span className="ml-1 text-[10px] text-gray-600 font-medium">por Saulo Kenji</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-900/40 text-green-500 border border-green-800/40 font-medium">
            IA · Voz · PWA
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className={tab === "chat" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
          <Chat
            onSendToSearch={sendToSearch}
            pendingMessage={tab === "chat" ? pendingChat : ""}
            onPendingConsumed={() => setPendingChat("")}
          />
        </div>
        <div className={tab === "playground" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
          <Playground />
        </div>
        <div className={tab === "search" ? "flex flex-col flex-1 min-h-0" : "hidden"}>
          <Search
            onSendToChat={sendToChat}
            initialQuery={tab === "search" ? pendingSearch : ""}
            onInitialQueryConsumed={() => setPendingSearch("")}
          />
        </div>
      </div>

      <nav className="h-14 flex border-t border-gray-700/50 bg-[#1c2714] shrink-0 safe-area-inset-bottom">
        {([
          { id: "chat" as Tab,       icon: MessageSquare, label: "Chat" },
          { id: "playground" as Tab, icon: Code2,         label: "Código" },
          { id: "search" as Tab,     icon: SearchIcon,    label: "Busca" },
        ]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide transition-colors ${
              tab === id
                ? "text-green-400 border-t-2 border-green-500 -mt-px"
                : "text-gray-600 hover:text-gray-400"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
