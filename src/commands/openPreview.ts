import * as vscode from "vscode";
import { PreviewPanel } from "../preview/previewPanel";

export function openPreview(extensionUri: vscode.Uri): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.document.languageId !== "markdown") {
    vscode.window.showWarningMessage("No Markdown file is open.");
    return;
  }

  PreviewPanel.show(editor.document, extensionUri);
}
