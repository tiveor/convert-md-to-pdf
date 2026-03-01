import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getSettings, type PageOrientation } from "../config/settings";
import { buildHtml } from "../pdf/htmlBuilder";
import { generatePdf } from "../pdf/generator";
import { hasMarpFrontMatter, exportPresentation } from "./exportPresentation";

function hasMermaidBlocks(markdown: string): boolean {
  return /```mermaid/i.test(markdown);
}

async function askOrientation(): Promise<PageOrientation | undefined> {
  const pick = await vscode.window.showQuickPick(
    [
      { label: "Auto (Recommended)", description: "Wide diagrams get landscape pages, rest stays portrait", value: "auto" as PageOrientation },
      { label: "Portrait", description: "All pages vertical", value: "portrait" as PageOrientation },
      { label: "Landscape", description: "All pages horizontal", value: "landscape" as PageOrientation },
    ],
    {
      placeHolder: "Mermaid diagrams detected — choose page orientation",
    }
  );
  return pick?.value;
}

export async function exportPdf(uri?: vscode.Uri): Promise<void> {
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

  // If the file is a Marp presentation, suggest the dedicated export
  if (hasMarpFrontMatter(markdown)) {
    const pick = await vscode.window.showQuickPick(
      [
        { label: "Export as Presentation PDF", description: "Uses Marp CLI — respects slide layout and themes", value: "marp" },
        { label: "Export as regular PDF", description: "Uses Chrome — renders as a document", value: "pdf" },
      ],
      { placeHolder: "Marp front matter detected — choose export format" }
    );
    if (!pick) {
      return;
    }
    if (pick.value === "marp") {
      return exportPresentation(uri);
    }
  }

  const settings = getSettings();

  let customCss: string | undefined;
  if (settings.customCssPath) {
    try {
      const cssPath = settings.customCssPath.startsWith("/")
        ? settings.customCssPath
        : path.resolve(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "",
            settings.customCssPath
          );
      customCss = fs.readFileSync(cssPath, "utf-8");
    } catch {
      vscode.window.showWarningMessage(
        `Custom CSS file not found: ${settings.customCssPath}`
      );
    }
  }

  // Ask for orientation when mermaid diagrams are detected
  if (hasMermaidBlocks(markdown)) {
    const chosen = await askOrientation();
    if (chosen === undefined) {
      return; // user cancelled
    }
    settings.orientation = chosen;
  }

  const html = buildHtml(markdown, settings, customCss);

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
      title: "Exporting PDF...",
      cancellable: false,
    },
    async () => {
      try {
        await generatePdf(html, outputUri.fsPath, settings);

        const action = await vscode.window.showInformationMessage(
          `PDF saved: ${path.basename(outputUri.fsPath)}`,
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
        vscode.window.showErrorMessage(`PDF export failed: ${message}`);
      }
    }
  );
}
