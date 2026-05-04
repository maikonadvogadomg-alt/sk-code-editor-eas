import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ error: "Método não permitido" }); return; }

  const { text, voice = "nova" } = req.body || {};
  if (!text) { res.status(400).json({ error: "Campo 'text' obrigatório" }); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "OPENAI_API_KEY não configurado no servidor. Configure nas variáveis de ambiente do Vercel." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: `Erro OpenAI: ${errorText}` });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    res.json({ audio: base64, transcript: text });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro na síntese de voz" });
  }
}
