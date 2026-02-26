import * as vscode from "vscode";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { getPreviewHtml, getNonce } from "./template";
import { getSettings } from "../config/settings";

const MERMAID_SCALE_VALUES: Record<string, number> = {
  small: 65,
  medium: 80,
  large: 100,
};

function highlight(str: string, lang: string): string {
  if (lang === "mermaid") {
    return `<pre class="mermaid">${MarkdownIt().utils.escapeHtml(str)}</pre>`;
  }
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
    } catch {
      // fall through
    }
  }
  return `<pre class="hljs"><code>${MarkdownIt().utils.escapeHtml(str)}</code></pre>`;
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight,
});

export class PreviewPanel {
  private static instance: PreviewPanel | undefined;
  private panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.languageId === "markdown") {
          this.scheduleUpdate(e.document);
        }
      },
      null,
      this.disposables
    );

    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor?.document.languageId === "markdown") {
          this.update(editor.document);
        }
      },
      null,
      this.disposables
    );
  }

  static show(document: vscode.TextDocument): void {
    if (PreviewPanel.instance) {
      PreviewPanel.instance.panel.reveal(vscode.ViewColumn.Beside);
      PreviewPanel.instance.update(document);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "mdPdfPreview",
      "PDF Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    PreviewPanel.instance = new PreviewPanel(panel);
    PreviewPanel.instance.update(document);
  }

  private scheduleUpdate(document: vscode.TextDocument): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.update(document), 300);
  }

  private update(document: vscode.TextDocument): void {
    const markdown = document.getText();
    const bodyHtml = md.render(markdown);
    const nonce = getNonce();
    const cspSource = this.panel.webview.cspSource;

    const settings = getSettings();
    const scale = settings.mermaidScale === "ask" ? 80 : (MERMAID_SCALE_VALUES[settings.mermaidScale] ?? 100);

    this.panel.webview.html = getPreviewHtml(bodyHtml, cspSource, nonce, scale);
  }

  private dispose(): void {
    PreviewPanel.instance = undefined;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
