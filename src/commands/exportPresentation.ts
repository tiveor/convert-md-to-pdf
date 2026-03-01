import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";

function runMarp(inputFile: string, outputFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      ["--yes", "@marp-team/marp-cli", inputFile, "--pdf", "--output", outputFile, "--allow-local-files"],
      { shell: true }
    );

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `marp-cli exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to run npx: ${err.message}. Make sure Node.js is installed.`));
    });
  });
}

export function hasMarpFrontMatter(markdown: string): boolean {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return false;
  }
  return /^\s*marp\s*:\s*true\s*$/m.test(match[1]);
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

  const mdPath = document.uri.fsPath;
  const defaultOutputPath = mdPath.replace(/\.md$/i, ".pdf");

  const outputUri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultOutputPath),
    filters: { PDF: ["pdf"] },
  });

  if (!outputUri) {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Exporting Presentation PDF...",
      cancellable: false,
    },
    async () => {
      try {
        await runMarp(mdPath, outputUri.fsPath);

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
  );
}
