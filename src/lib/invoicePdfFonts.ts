const FONT_BASE = `${import.meta.env.BASE_URL}fonts`;

let fontCache: { regular: string; bold: string } | null = null;

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export async function loadInvoiceFonts(): Promise<{ regular: string; bold: string }> {
  if (fontCache) return fontCache;

  const [regularRes, boldRes] = await Promise.all([
    fetch(`${FONT_BASE}HindSiliguri-Regular.ttf`),
    fetch(`${FONT_BASE}HindSiliguri-Bold.ttf`),
  ]);

  if (!regularRes.ok || !boldRes.ok) {
    throw new Error("Invoice fonts failed to load");
  }

  const [regularBuf, boldBuf] = await Promise.all([regularRes.arrayBuffer(), boldRes.arrayBuffer()]);
  fontCache = {
    regular: bufferToBase64(regularBuf),
    bold: bufferToBase64(boldBuf),
  };
  return fontCache;
}
