import * as vscode from "vscode";

/** Strip inline `style` directives from mermaid source so the theme always applies */
export function stripMermaidInlineStyles(src: string): string {
  return src.replace(/^\s*style\s+\S+\s+fill:.*$/gm, "");
}

export type MermaidThemeName = "ocean" | "forest" | "rose" | "slate" | "sunset";

interface ThemeVars {
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  secondaryColor: string;
  secondaryTextColor: string;
  secondaryBorderColor: string;
  tertiaryColor: string;
  tertiaryTextColor: string;
  tertiaryBorderColor: string;
  lineColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  nodeBorder: string;
  mainBkg: string;
  clusterBkg: string;
  clusterBorder: string;
  titleColor: string;
  edgeLabelBackground: string;
  nodeTextColor: string;
}

const THEMES: Record<MermaidThemeName, ThemeVars> = {
  ocean: {
    primaryColor: "#dbeafe",
    primaryTextColor: "#1e3a5f",
    primaryBorderColor: "#3b82f6",
    secondaryColor: "#e0f2fe",
    secondaryTextColor: "#0c4a6e",
    secondaryBorderColor: "#0ea5e9",
    tertiaryColor: "#cffafe",
    tertiaryTextColor: "#155e75",
    tertiaryBorderColor: "#06b6d4",
    lineColor: "#64748b",
    textColor: "#334155",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    nodeBorder: "#3b82f6",
    mainBkg: "#dbeafe",
    clusterBkg: "#f0f9ff",
    clusterBorder: "#7dd3fc",
    titleColor: "#1e293b",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#1e3a5f",
  },
  forest: {
    primaryColor: "#d1fae5",
    primaryTextColor: "#065f46",
    primaryBorderColor: "#10b981",
    secondaryColor: "#fef9c3",
    secondaryTextColor: "#713f12",
    secondaryBorderColor: "#ca8a04",
    tertiaryColor: "#dbeafe",
    tertiaryTextColor: "#1e3a5f",
    tertiaryBorderColor: "#3b82f6",
    lineColor: "#4b5563",
    textColor: "#1f2937",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    nodeBorder: "#10b981",
    mainBkg: "#d1fae5",
    clusterBkg: "#ecfdf5",
    clusterBorder: "#6ee7b7",
    titleColor: "#064e3b",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#065f46",
  },
  rose: {
    primaryColor: "#ffe4e6",
    primaryTextColor: "#881337",
    primaryBorderColor: "#f43f5e",
    secondaryColor: "#fce7f3",
    secondaryTextColor: "#831843",
    secondaryBorderColor: "#ec4899",
    tertiaryColor: "#faf5ff",
    tertiaryTextColor: "#581c87",
    tertiaryBorderColor: "#a855f7",
    lineColor: "#6b7280",
    textColor: "#374151",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    nodeBorder: "#f43f5e",
    mainBkg: "#ffe4e6",
    clusterBkg: "#fff1f2",
    clusterBorder: "#fda4af",
    titleColor: "#4c0519",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#881337",
  },
  slate: {
    primaryColor: "#e2e8f0",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#64748b",
    secondaryColor: "#f1f5f9",
    secondaryTextColor: "#334155",
    secondaryBorderColor: "#94a3b8",
    tertiaryColor: "#f8fafc",
    tertiaryTextColor: "#475569",
    tertiaryBorderColor: "#cbd5e1",
    lineColor: "#475569",
    textColor: "#1e293b",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    nodeBorder: "#64748b",
    mainBkg: "#e2e8f0",
    clusterBkg: "#f8fafc",
    clusterBorder: "#cbd5e1",
    titleColor: "#0f172a",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#1e293b",
  },
  sunset: {
    primaryColor: "#ffedd5",
    primaryTextColor: "#7c2d12",
    primaryBorderColor: "#f97316",
    secondaryColor: "#fef3c7",
    secondaryTextColor: "#92400e",
    secondaryBorderColor: "#f59e0b",
    tertiaryColor: "#fef2f2",
    tertiaryTextColor: "#991b1b",
    tertiaryBorderColor: "#ef4444",
    lineColor: "#78716c",
    textColor: "#292524",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    nodeBorder: "#f97316",
    mainBkg: "#ffedd5",
    clusterBkg: "#fffbeb",
    clusterBorder: "#fdba74",
    titleColor: "#431407",
    edgeLabelBackground: "#ffffff",
    nodeTextColor: "#7c2d12",
  },
};

/** Build Mermaid config for the user-selected theme */
export function getMermaidConfig(): { startOnLoad: false; theme: "base"; themeVariables: ThemeVars } {
  const config = vscode.workspace.getConfiguration("convertMdToPdf");
  const name = config.get<MermaidThemeName>("diagramTheme", "ocean");
  return {
    startOnLoad: false,
    theme: "base",
    themeVariables: THEMES[name] || THEMES.ocean,
  };
}

/** Static config for contexts without vscode API (defaults to ocean) */
export const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "base" as const,
  themeVariables: THEMES.ocean,
};
