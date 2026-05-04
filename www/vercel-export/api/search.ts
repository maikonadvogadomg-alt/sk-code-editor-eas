import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = String(req.query["q"] || "").trim();
  if (!q) { res.status(400).json({ error: "Parâmetro q obrigatório" }); return; }

  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "SK-Code-Editor/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const data = await resp.json() as any;

    const results: { title: string; url: string; snippet: string }[] = [];

    if (data.AbstractText) {
      results.push({ title: data.Heading || q, url: data.AbstractURL || "", snippet: data.AbstractText });
    }

    for (const t of (data.RelatedTopics || [])) {
      if (results.length >= 8) break;
      if (t.Text && t.FirstURL) {
        results.push({ title: t.Text.split(" - ")[0] || t.Text, url: t.FirstURL, snippet: t.Text });
      }
    }

    res.json({ query: q, results });
  } catch (err: any) {
    res.status(503).json({ error: "Serviço de busca temporariamente indisponível", details: err.message });
  }
}
