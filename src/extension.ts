import * as vscode from "vscode";
import { exportPdf } from "./commands/exportPdf";
import { openPreview } from "./commands/openPreview";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("convert-md-to-pdf.export", exportPdf),
    vscode.commands.registerCommand("convert-md-to-pdf.preview", openPreview)
  );
}

export function deactivate(): void {}
