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

const MIN_READABLE_SCALE = 0.45;

function parseMargin(value: string): number {
  const num = parseFloat(value);
  if (value.endsWith("mm")) return num * 3.7795;
  if (value.endsWith("cm")) return num * 37.795;
  if (value.endsWith("in")) return num * 96;
  return num;
}

interface PageArea { width: number; height: number; }

function getContentArea(
  pageSize: { width: number; height: number },
  margins: PdfSettings["margins"],
  landscape: boolean
): PageArea {
  const w = landscape ? pageSize.height : pageSize.width;
  const h = landscape ? pageSize.width : pageSize.height;
  return {
    width: w * 96 - parseMargin(margins.left) - parseMargin(margins.right),
    height: h * 96 - parseMargin(margins.top) - parseMargin(margins.bottom),
  };
}

export async function generatePdf(
  html: string,
  outputPath: string,
  settings: PdfSettings
): Promise<void> {
  const executablePath = settings.chromePath || findChrome();
  if (!executablePath) {
    throw new Error(
      "Chrome/Chromium not found. Please install Chrome or set the path in settings (convertMdToPdf.chromePath)."
    );
  }

  const tmpFile = path.join(os.tmpdir(), `md-pdf-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const size = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4;

    // Use uniform orientation — "auto" defaults to portrait (no mixed pages = no blank pages)
    const useLandscape = settings.orientation === "landscape";
    const contentArea = getContentArea(size, settings.margins, useLandscape);

    // Viewport = content width so mermaid fills the page width with max text size
    const viewportW = Math.round(contentArea.width);

    await page.setViewport({ width: viewportW, height: 800 });
    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0" });

    const hasMermaid = await page.evaluate(() => document.querySelectorAll(".mermaid").length > 0);

    if (hasMermaid) {
      // Zero out mermaid container padding BEFORE rendering so SVGs use full content width
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>(".mermaid").forEach((el) => {
          el.style.padding = "0";
          el.style.background = "none";
        });
      });

      await page.addScriptTag({ url: MERMAID_CDN });
      await page.evaluate(async () => {
        const m = (window as any).mermaid;
        m.initialize({ startOnLoad: false, theme: "default" });
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(".mermaid"));
        for (const node of nodes) {
          try {
            await m.run({ nodes: [node] });
          } catch {
            node.innerHTML = `<pre style="color:#c00;font-size:12px;">Mermaid render error</pre>`;
          }
        }
      });
    }

    // Single @page rule — uniform orientation for entire document (no mixed pages)
    const pageW = useLandscape ? size.height : size.width;
    const pageH = useLandscape ? size.width : size.height;
    const { top, bottom, left, right } = settings.margins;

    await page.evaluate(
      (pw: number, ph: number, mT: string, mB: string, mL: string, mR: string) => {
        const style = document.createElement("style");
        style.textContent = `
          @page { size: ${pw}in ${ph}in; margin: ${mT} ${mR} ${mB} ${mL}; }
          .split-cont { break-before: page; }
        `;
        document.head.appendChild(style);
      },
      pageW, pageH, top, bottom, left, right
    );

    if (hasMermaid) {
      // Remove <hr> elements that create unwanted spacing
      await page.evaluate(() => {
        document.querySelectorAll("hr").forEach((hr) => hr.remove());
      });

      await page.evaluate(
        (cW: number, cH: number, minScale: number) => {
          document.querySelectorAll<HTMLElement>(".mermaid").forEach((container) => {
            const svg = container.querySelector("svg") as SVGSVGElement | null;
            if (!svg) return;

            const svgW = svg.getBoundingClientRect().width;
            const svgH = svg.getBoundingClientRect().height;
            if (svgW === 0 || svgH === 0) return;

            const prev = container.previousElementSibling as HTMLElement | null;
            const hasHeading = prev && /^H[1-6]$/.test(prev.tagName);

            // Measure actual heading space (height + margins + gap to diagram)
            let headingSpace = 0;
            if (hasHeading && prev) {
              const cs = getComputedStyle(prev);
              const mt = parseFloat(cs.marginTop) || 0;
              const mb = parseFloat(cs.marginBottom) || 0;
              headingSpace = mt + prev.getBoundingClientRect().height + Math.max(mb, 14);
            }
            const diagH = cH - headingSpace - 2; // 2px safety buffer

            let scale = Math.min(cW / svgW, diagH / svgH, 1);

            // Trailing content accommodation: if small non-diagram content
            // follows this diagram, shrink slightly to fit on the same page
            let trailingH = 0;
            let sib = container.nextElementSibling as HTMLElement | null;
            while (sib) {
              if (sib.classList.contains("mermaid")) break;
              if (/^H[1-6]$/.test(sib.tagName)) {
                const afterH = sib.nextElementSibling;
                if (afterH && afterH.classList.contains("mermaid")) break;
              }
              const cs = getComputedStyle(sib);
              trailingH += sib.getBoundingClientRect().height
                + (parseFloat(cs.marginTop) || 0)
                + (parseFloat(cs.marginBottom) || 0);
              sib = sib.nextElementSibling as HTMLElement | null;
            }

            if (trailingH > 0 && trailingH < cH * 0.20) {
              const adjustedScale = Math.min(cW / svgW, (diagH - trailingH) / svgH, 1);
              if (adjustedScale >= scale * 0.75 && adjustedScale >= minScale) {
                scale = adjustedScale;
              }
            }

            let splitPages = false;

            // If below readable threshold, try splitting across 2 pages
            if (scale < minScale) {
              const splitScale = Math.min(cW / svgW, 1);
              const splitFits = svgH * splitScale <= diagH * 2;
              if (splitFits && splitScale > scale) {
                scale = splitScale;
                splitPages = true;
              }
            }

            const applyScale = (s: SVGSVGElement, sc: number) => {
              if (sc < 1) {
                s.style.transform = `scale(${sc})`;
                s.style.transformOrigin = "top left";
              }
            };

            if (splitPages) {
              const totalH = svgH * scale;
              const headingH = hasHeading ? prev!.getBoundingClientRect().height : 0;
              // Balanced split: equalize content across both pages
              const page1H = Math.min(
                Math.ceil((totalH - headingH) / 2),
                diagH
              );
              const page2H = totalH - page1H;

              // Page 1: heading + top clip
              const w1 = document.createElement("div");
              if (hasHeading) {
                container.parentNode!.insertBefore(w1, prev!);
                w1.appendChild(prev!);
              } else {
                container.parentNode!.insertBefore(w1, container);
              }

              const clip1 = document.createElement("div");
              clip1.style.width = `${svgW * scale}px`;
              clip1.style.height = `${page1H}px`;
              clip1.style.overflow = "hidden";
              applyScale(svg, scale);
              container.style.padding = "0";
              container.style.background = "none";
              w1.appendChild(clip1);
              clip1.appendChild(container);

              // Page 2: bottom clip
              const w2 = document.createElement("div");
              w2.className = "split-cont";

              const clip2 = document.createElement("div");
              clip2.style.width = `${svgW * scale}px`;
              clip2.style.height = `${page2H}px`;
              clip2.style.overflow = "hidden";

              const svgClone = svg.cloneNode(true) as SVGSVGElement;
              applyScale(svgClone, scale);
              svgClone.style.marginTop = `-${page1H}px`;

              const c2 = document.createElement("div");
              c2.className = "mermaid";
              c2.style.padding = "0";
              c2.style.background = "none";
              c2.appendChild(svgClone);
              clip2.appendChild(c2);
              w2.appendChild(clip2);
              w1.parentNode!.insertBefore(w2, w1.nextSibling);

            } else {
              // Scale inline — let CSS flow handle page breaks naturally
              applyScale(svg, scale);
              if (scale < 1) {
                container.style.width = `${svgW * scale}px`;
                container.style.height = `${svgH * scale}px`;
                container.style.overflow = "hidden";
                container.style.padding = "0";
                container.style.background = "none";
                // Center height-limited diagrams horizontally
                if (svgW * scale < cW * 0.98) {
                  container.style.marginLeft = "auto";
                  container.style.marginRight = "auto";
                }
              }
            }
          });
        },
        contentArea.width, contentArea.height,
        MIN_READABLE_SCALE
      );
    }

    await page.pdf({
      path: outputPath,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: !!(settings.headerTemplate || settings.footerTemplate),
      headerTemplate: settings.headerTemplate || "<span></span>",
      footerTemplate: settings.footerTemplate || "<span></span>",
    });
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}
