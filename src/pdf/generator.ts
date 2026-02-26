import puppeteer from "puppeteer-core";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { PdfSettings } from "../config/settings";
import { findChrome } from "./chromeFinder";

const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 8.27, height: 11.69 },
  Letter: { width: 8.5, height: 11 },
  Legal: { width: 8.5, height: 14 },
  Tabloid: { width: 11, height: 17 },
};

export async function generatePdf(
  html: string,
  outputPath: string,
  settings: PdfSettings,
  mermaidWidthPercent?: number
): Promise<void> {
  const executablePath = settings.chromePath || findChrome();

  if (!executablePath) {
    throw new Error(
      "Chrome/Chromium not found. Please install Chrome or set the path in settings (convertMdToPdf.chromePath)."
    );
  }

  // Write HTML to a temp file so page.goto() can load external scripts
  const tmpFile = path.join(os.tmpdir(), `md-pdf-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0" });

    // Render mermaid diagrams if any exist
    const hasMermaid = await page.evaluate(() => document.querySelectorAll(".mermaid").length > 0);
    if (hasMermaid) {
      await page.addScriptTag({ url: MERMAID_CDN });
      await page.evaluate(async () => {
        const m = (window as any).mermaid;
        m.initialize({ startOnLoad: false, theme: "default" });
        await m.run();
      });

      // Scale diagrams proportionally (both width and height) using CSS transform
      if (mermaidWidthPercent && mermaidWidthPercent < 100) {
        await page.evaluate((widthPct: number) => {
          const scale = widthPct / 100;
          document.querySelectorAll<SVGSVGElement>(".mermaid svg").forEach((svg) => {
            const { width, height } = svg.getBoundingClientRect();
            svg.style.transform = `scale(${scale})`;
            svg.style.transformOrigin = "top left";
            const container = svg.closest(".mermaid") as HTMLElement | null;
            if (container) {
              container.style.width = `${width * scale}px`;
              container.style.height = `${height * scale}px`;
              container.style.overflow = "hidden";
              container.style.padding = "0";
              container.style.background = "none";
            }
          });
        }, mermaidWidthPercent);
      }
    }

    const size = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4;
    const hasHeaderOrFooter = !!(settings.headerTemplate || settings.footerTemplate);

    await page.pdf({
      path: outputPath,
      width: `${size.width}in`,
      height: `${size.height}in`,
      margin: settings.margins,
      printBackground: true,
      displayHeaderFooter: hasHeaderOrFooter,
      headerTemplate: settings.headerTemplate || "<span></span>",
      footerTemplate: settings.footerTemplate || "<span></span>",
    });
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}
