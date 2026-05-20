import regularFont from "@/assets/fonts/HindSiliguri-Regular.ttf?arraybuffer";
import boldFont from "@/assets/fonts/HindSiliguri-Bold.ttf?arraybuffer";

/** Fonts bundled at build time — no network fetch (avoids Netlify /fonts 404/500). */
export function loadInvoiceFontBytes(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  return Promise.resolve({
    regular: regularFont,
    bold: boldFont,
  });
}
