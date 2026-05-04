export interface DocResult {
  text: string;
  name: string;
  type: string;
  pages?: number;
  wordCount: number;
}

async function readPDF(file: File): Promise<DocResult> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: any) => "str" in item)
      .map((item: any) => item.str)
      .join(" ");
    text += pageText + "\n";
  }
  return {
    text: text.trim(),
    name: file.name,
    type: "PDF",
    pages: pdf.numPages,
    wordCount: text.trim().split(/\s+/).length,
  };
}

async function readDOCX(file: File): Promise<DocResult> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return {
    text: result.value.trim(),
    name: file.name,
    type: "Word",
    wordCount: result.value.trim().split(/\s+/).length,
  };
}

async function readText(file: File): Promise<DocResult> {
  const text = await file.text();
  return {
    text: text.trim(),
    name: file.name,
    type: file.name.endsWith(".md") ? "Markdown" : "Texto",
    wordCount: text.trim().split(/\s+/).length,
  };
}

export async function readDocument(file: File): Promise<DocResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return readPDF(file);
  if (ext === "docx") return readDOCX(file);
  if (["txt", "md", "rtf", "csv", "json", "html"].includes(ext)) return readText(file);
  return readText(file);
}
