import * as vscode from "vscode";

export type PageOrientation = "auto" | "portrait" | "landscape";

export interface PdfSettings {
  chromePath: string;
  pageSize: "A4" | "Letter" | "Legal" | "Tabloid";
  orientation: PageOrientation;
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  fontSize: number;
  customCssPath: string;
  headerTemplate: string;
  footerTemplate: string;
}

export function getSettings(): PdfSettings {
  const config = vscode.workspace.getConfiguration("convertMdToPdf");

  return {
    chromePath: config.get<string>("chromePath", ""),
    pageSize: config.get<PdfSettings["pageSize"]>("pageSize", "A4"),
    orientation: config.get<PageOrientation>("orientation", "auto"),
    margins: config.get<PdfSettings["margins"]>("margins", {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    }),
    fontSize: config.get<number>("fontSize", 14),
    customCssPath: config.get<string>("customCssPath", ""),
    headerTemplate: config.get<string>("headerTemplate", ""),
    footerTemplate: config.get<string>(
      "footerTemplate",
      '<div style="font-size:10px;text-align:center;width:100%"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    ),
  };
}
