import type * as vscode from "vscode";

export function getPreviewHtml(
  bodyHtml: string,
  cspSource: string,
  nonce: string
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'nonce-${nonce}'; img-src ${cspSource} https: data:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style nonce="${nonce}">
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--vscode-foreground);
      padding: 20px 32px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.4em; margin-bottom: 0.6em; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    a { color: var(--vscode-textLink-foreground); }
    code {
      font-family: var(--vscode-editor-font-family), monospace;
      font-size: 0.9em;
      background-color: var(--vscode-textCodeBlock-background);
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background-color: var(--vscode-textCodeBlock-background);
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
    }
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 4px solid var(--vscode-panel-border);
      margin: 0.8em 0;
      padding: 0.5em 1em;
      color: var(--vscode-descriptionForeground);
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid var(--vscode-panel-border); padding: 8px 12px; text-align: left; }
    th { font-weight: 600; }
    img { max-width: 100%; height: auto; }
    hr { border: none; border-top: 2px solid var(--vscode-panel-border); margin: 2em 0; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

export function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
