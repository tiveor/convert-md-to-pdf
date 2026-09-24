import * as vscode from "vscode";
import { getPreviewHtml, getNonce } from "./template";
import { renderMarkdown } from "../markdown/renderer";
import { getSettings } from "../config/settings";

export class PreviewPanel {
  private static instance: PreviewPanel | undefined;
  private panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  private constructor(panel: vscode.WebviewPanel, private readonly vendorUri: vscode.Uri) {
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

  static show(document: vscode.TextDocument, extensionUri: vscode.Uri): void {
    if (PreviewPanel.instance) {
      PreviewPanel.instance.panel.reveal(vscode.ViewColumn.Beside);
      PreviewPanel.instance.update(document);
      return;
    }

    const vendorUri = vscode.Uri.joinPath(extensionUri, "dist", "vendor");
    const panel = vscode.window.createWebviewPanel(
      "mdPdfPreview",
      "PDF Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true, localResourceRoots: [vendorUri] }
    );

    PreviewPanel.instance = new PreviewPanel(panel, vendorUri);
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
    const bodyHtml = renderMarkdown(markdown);
    const nonce = getNonce();
    const webview = this.panel.webview;
    const asset = (file: string) => webview.asWebviewUri(vscode.Uri.joinPath(this.vendorUri, file)).toString();

    webview.html = getPreviewHtml(
      bodyHtml,
      webview.cspSource,
      nonce,
      {
        mermaidJs: asset("mermaid.min.js"),
        excalidrawJs: asset("excalidraw-utils.min.js"),
        katexCss: asset("katex/katex.min.css"),
      },
      getSettings().keepDiagramStyles
    );
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
