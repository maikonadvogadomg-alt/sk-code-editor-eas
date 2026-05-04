import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ error: "Método não permitido" }); return; }

  const { audio, mimeType = "audio/webm" } = req.body || {};
  if (!audio) { res.status(400).json({ error: "Campo 'audio' (base64) obrigatório" }); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "OPENAI_API_KEY não configurado no servidor." });
    return;
  }

  try {
    const buffer = Buffer.from(audio, "base64");
    const ext = mimeType.includes("mp4") ? "m4a"
              : mimeType.includes("ogg")  ? "ogg"
              : mimeType.includes("wav")  ? "wav"
              : "webm";

    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append("file", blob, `audio.${ext}`);
    formData.append("model", "whisper-1");
    formData.append("language", "pt");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: `Erro OpenAI: ${errorText}` });
      return;
    }

    const data = await response.json() as any;
    res.json({ transcript: data.text?.trim() ?? "" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Erro na transcrição" });
  }
}
