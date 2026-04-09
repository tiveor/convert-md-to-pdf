import { describe, it, expect, beforeEach } from "vitest";
import { __setConfigValues } from "../__mocks__/vscode";
import { getMermaidConfig, type MermaidThemeName } from "./mermaidTheme";

beforeEach(() => {
  __setConfigValues({});
});

describe("getMermaidConfig", () => {
  it("returns ocean theme by default", () => {
    const cfg = getMermaidConfig();
    expect(cfg.theme).toBe("base");
    expect(cfg.startOnLoad).toBe(false);
    expect(cfg.themeVariables.primaryColor).toBe("#dbeafe");
    expect(cfg.themeVariables.primaryBorderColor).toBe("#3b82f6");
  });

  const themes: MermaidThemeName[] = ["ocean", "forest", "rose", "slate", "sunset"];

  for (const name of themes) {
    it(`returns valid config for "${name}" theme`, () => {
      __setConfigValues({ diagramTheme: name });
      const cfg = getMermaidConfig();
      expect(cfg.theme).toBe("base");
      expect(cfg.startOnLoad).toBe(false);
      expect(cfg.themeVariables).toBeDefined();
      expect(cfg.themeVariables.primaryColor).toBeTruthy();
      expect(cfg.themeVariables.primaryTextColor).toBeTruthy();
      expect(cfg.themeVariables.primaryBorderColor).toBeTruthy();
      expect(cfg.themeVariables.lineColor).toBeTruthy();
      expect(cfg.themeVariables.nodeTextColor).toBeTruthy();
    });
  }

  it("each theme has unique primary colors", () => {
    const primaryColors = themes.map((name) => {
      __setConfigValues({ diagramTheme: name });
      return getMermaidConfig().themeVariables.primaryColor;
    });
    expect(new Set(primaryColors).size).toBe(themes.length);
  });

  it("falls back to ocean for invalid theme name", () => {
    __setConfigValues({ diagramTheme: "nonexistent" });
    const cfg = getMermaidConfig();
    expect(cfg.themeVariables.primaryColor).toBe("#dbeafe");
  });

  it("all theme colors are valid hex codes", () => {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    for (const name of themes) {
      __setConfigValues({ diagramTheme: name });
      const vars = getMermaidConfig().themeVariables;
      for (const [key, value] of Object.entries(vars)) {
        if (key === "fontFamily" || key === "fontSize") continue;
        expect(value, `${name}.${key} = "${value}"`).toMatch(hexPattern);
      }
    }
  });
});
