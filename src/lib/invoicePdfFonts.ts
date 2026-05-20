const FONT_BASE = `${import.meta.env.BASE_URL}fonts`;

export async function loadInvoiceFontBytes(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  const [regularRes, boldRes] = await Promise.all([
    fetch(`${FONT_BASE}HindSiliguri-Regular.ttf`),
    fetch(`${FONT_BASE}HindSiliguri-Bold.ttf`),
  ]);

  if (!regularRes.ok || !boldRes.ok) {
    throw new Error("Invoice fonts failed to load");
  }

  return {
    regular: await regularRes.arrayBuffer(),
    bold: await boldRes.arrayBuffer(),
  };
}
