import puppeteer from "puppeteer-core";
import type { PdfSettings } from "../config/settings";
import { findChrome } from "./chromeFinder";

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 8.27, height: 11.69 },
  Letter: { width: 8.5, height: 11 },
  Legal: { width: 8.5, height: 14 },
  Tabloid: { width: 11, height: 17 },
};

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

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

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
  }
}
