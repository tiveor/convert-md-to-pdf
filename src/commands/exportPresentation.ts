import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Marp } from "@marp-team/marp-core";
import puppeteer from "puppeteer-core";
import { findChrome } from "../pdf/chromeFinder";
import { getSettings } from "../config/settings";
import { getMermaidConfig } from "../config/mermaidTheme";

export function hasMarpFrontMatter(markdown: string): boolean {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return false;
  }
  return /^\s*marp\s*:\s*true\s*$/m.test(match[1]);
}

function buildPresentationHtml(markdown: string, baseDirUrl: string): string {
  const marp = new Marp({ html: true });
  const { html, css } = marp.render(markdown);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <base href="${baseDirUrl}">
  <style>
    @page { size: 1280px 720px; margin: 0; }
    body { margin: 0; padding: 0; background: white; }
    svg[data-marpit-svg] { display: block; break-after: page; }
    ${css}
  </style>
</head>
<body>${html}</body>
</html>`;
}

const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
const EXCALIDRAW_CDN = "https://cdn.jsdelivr.net/npm/@excalidraw/utils@0.1.2/dist/excalidraw-utils.min.js";

async function generatePresentationPdf(markdown: string, outputPath: string, mdDir: string): Promise<void> {
  const settings = getSettings();
  const executablePath = settings.chromePath || findChrome();

  if (!executablePath) {
    throw new Error(
      "Chrome/Chromium not found. Please install Chrome or set the path in settings (convertMdToPdf.chromePath)."
    );
  }

  const baseDirUrl = `file://${mdDir}/`;
  const html = buildPresentationHtml(markdown, baseDirUrl);
  const tmpFile = path.join(os.tmpdir(), `marp-pdf-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(30_000);
    await page.goto(`file://${tmpFile}`, { waitUntil: "networkidle0" });

    const hasMermaid = await page.evaluate(() => document.querySelectorAll("pre.mermaid, code.language-mermaid").length > 0);
    const hasExcalidraw = await page.evaluate(() => document.querySelectorAll("pre.excalidraw, code.language-excalidraw").length > 0);

    if (hasMermaid) {
      // Marp wraps code blocks differently — unwrap mermaid content into renderable divs
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>("pre.mermaid, code.language-mermaid").forEach((el) => {
          const text = el.textContent || "";
          const target = el.tagName === "CODE" ? el.parentElement! : el;
          const div = document.createElement("div");
          div.className = "mermaid";
          div.textContent = text;
          div.style.background = "none";
          target.replaceWith(div);
        });
      });

      await page.addScriptTag({ url: MERMAID_CDN });
      await page.evaluate(async (cfg: any) => {
        const m = (window as any).mermaid;
        m.initialize(cfg);
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(".mermaid"));
        for (const node of nodes) {
          try {
            node.textContent = (node.textContent || "").replace(/^\s*style\s+\S+\s+fill:.*$/gm, "");
            await m.run({ nodes: [node] });
          } catch {
            node.innerHTML = `<pre style="color:#c00;font-size:12px;">Mermaid render error</pre>`;
          }
        }
      }, { ...getMermaidConfig() });
    }

    if (hasExcalidraw) {
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>("pre.excalidraw, code.language-excalidraw").forEach((el) => {
          const text = el.textContent || "";
          const target = el.tagName === "CODE" ? el.parentElement! : el;
          const div = document.createElement("div");
          div.className = "excalidraw";
          div.textContent = text;
          div.style.background = "none";
          target.replaceWith(div);
        });
      });

      await page.addScriptTag({ url: EXCALIDRAW_CDN });
      await page.evaluate(async () => {
        const { exportToSvg } = (window as any).ExcalidrawUtils;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(".excalidraw"));
        for (const node of nodes) {
          try {
            const json = JSON.parse(node.textContent || "{}");
            const svg = await exportToSvg({
              elements: json.elements || [],
              appState: {
                exportWithDarkMode: false,
                exportBackground: true,
                viewBackgroundColor: json.appState?.viewBackgroundColor || "#ffffff",
                ...(json.appState || {}),
              },
              files: json.files || {},
            });
            node.innerHTML = "";
            node.appendChild(svg);
          } catch (e: any) {
            node.innerHTML = `<pre style="color:#c00;font-size:12px;">Excalidraw render error: ${e?.message || e}</pre>`;
          }
        }
      });
    }

    await (page as any).pdf({
      path: outputPath,
      width: "1280px",
      height: "720px",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
  } finally {
    const proc = browser.process();
    try {
      await Promise.race([
        browser.close(),
        new Promise((r) => setTimeout(r, 5_000)),
      ]);
    } catch { /* ignore */ }
    if (proc && !proc.killed) { proc.kill("SIGKILL"); }
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

export async function exportPresentation(uri?: vscode.Uri): Promise<void> {
  let document: vscode.TextDocument;

  if (uri) {
    document = await vscode.workspace.openTextDocument(uri);
  } else {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "markdown") {
      vscode.window.showWarningMessage("No Markdown file is open.");
      return;
    }
    document = editor.document;
  }

  const markdown = document.getText();
  const mdPath = document.uri.fsPath;
  const defaultOutputPath = mdPath.replace(/\.md$/i, ".pdf");

  const outputUri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultOutputPath),
    filters: { PDF: ["pdf"] },
  });

  if (!outputUri) {
    return;
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Exporting Presentation PDF...",
        cancellable: false,
      },
      () => Promise.race([
        generatePresentationPdf(markdown, outputUri.fsPath, path.dirname(mdPath)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Presentation export timed out (60s)")), 60_000)
        ),
      ])
    );

    if (!fs.existsSync(outputUri.fsPath)) {
      throw new Error("PDF file was not created");
    }

    const action = await vscode.window.showInformationMessage(
      `Presentation PDF saved: ${path.basename(outputUri.fsPath)}`,
      "Open PDF",
      "Open Folder"
    );

    if (action === "Open PDF") {
      await vscode.env.openExternal(outputUri);
    } else if (action === "Open Folder") {
      await vscode.env.openExternal(
        vscode.Uri.file(path.dirname(outputUri.fsPath))
      );
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    vscode.window.showErrorMessage(`Presentation export failed: ${message}`);
  }
}
