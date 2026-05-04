import type { VercelRequest, VercelResponse } from "@vercel/node";

interface DDGResult {
  title: string;
  url: string;
  snippet: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const q = (req.query.q as string || "").trim();
  if (!q) return res.status(400).json({ error: "Parâmetro 'q' obrigatório" });

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "SK-Assistente/1.0",
        Accept: "application/json",
      },
    });

    if (!resp.ok) throw new Error(`DuckDuckGo retornou ${resp.status}`);
    const data = await resp.json();

    const results: DDGResult[] = [];

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.Heading || q,
        url: data.AbstractURL,
        snippet: data.AbstractText.slice(0, 300),
      });
    }

    const related = (data.RelatedTopics || []) as any[];
    for (const item of related) {
      if (results.length >= 8) break;
      if (item.FirstURL && item.Text) {
        results.push({
          title: item.Text.slice(0, 80),
          url: item.FirstURL,
          snippet: item.Text.slice(0, 250),
        });
      } else if (item.Topics) {
        for (const sub of item.Topics) {
          if (results.length >= 8) break;
          if (sub.FirstURL && sub.Text) {
            results.push({
              title: sub.Text.slice(0, 80),
              url: sub.FirstURL,
              snippet: sub.Text.slice(0, 250),
            });
          }
        }
      }
    }

    if (!results.length) {
      const ddgSearch = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
      results.push({
        title: `Buscar "${q}" no DuckDuckGo`,
        url: ddgSearch,
        snippet: "Clique para abrir a busca no DuckDuckGo.",
      });
    }

    return res.status(200).json({ query: q, results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Erro interno" });
  }
}
