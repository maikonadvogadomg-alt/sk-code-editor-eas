import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = String(req.query["q"] || "").trim();
  if (!q) { res.status(400).json({ error: "Parâmetro q obrigatório" }); return; }

  try {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=15`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await resp.json() as any;
    const results = (data.objects || []).map((o: any) => ({
      name: o.package?.name,
      description: o.package?.description,
      version: o.package?.version,
      links: o.package?.links,
      score: o.score?.final,
      downloads: o.downloads?.monthly,
    }));
    res.json({ query: q, results });
  } catch (err: any) {
    res.status(503).json({ error: "Erro ao buscar no npm", details: err.message });
  }
}
