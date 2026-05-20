import { jsPDF } from "jspdf";

async function loadImageAsDataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Failed to load image: ${src}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

/** Clone invoice node with inlined logo so html2canvas never taints the canvas. */
async function prepareClone(source: HTMLElement): Promise<HTMLElement> {
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.position = "fixed";
  clone.style.left = "-10000px";
  clone.style.top = "0";
  clone.style.zIndex = "-1";
  clone.style.width = `${source.offsetWidth}px`;
  clone.style.maxWidth = `${source.offsetWidth}px`;
  clone.style.boxShadow = "none";

  const srcImg = source.querySelector("img");
  const cloneImg = clone.querySelector("img");
  if (srcImg && cloneImg && srcImg.src) {
    try {
      cloneImg.src = await loadImageAsDataUrl(srcImg.src);
    } catch {
      cloneImg.remove();
    }
  }

  document.body.appendChild(clone);
  await document.fonts.ready;
  await waitForImages(clone);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return clone;
}

export async function downloadInvoicePdf(element: HTMLElement, orderRef: string): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");

  const clone = await prepareClone(element);
  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: clone.offsetWidth,
      height: clone.scrollHeight,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(`Amerbari-Invoice-${orderRef}.pdf`);
  } finally {
    clone.remove();
  }
}
