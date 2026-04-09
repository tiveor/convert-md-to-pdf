import { describe, it, expect, beforeEach } from "vitest";
import { __setConfigValues } from "../__mocks__/vscode";
import { getSettings } from "./settings";

beforeEach(() => {
  __setConfigValues({});
});

describe("getSettings", () => {
  it("returns correct defaults", () => {
    const s = getSettings();
    expect(s.pageSize).toBe("A4");
    expect(s.orientation).toBe("auto");
    expect(s.fontSize).toBe(14);
    expect(s.chromePath).toBe("");
    expect(s.customCssPath).toBe("");
    expect(s.headerTemplate).toBe("");
    expect(s.diagramTheme).toBe("ocean");
    expect(s.margins).toEqual({
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    });
  });

  it("reads custom values from config", () => {
    __setConfigValues({
      pageSize: "Letter",
      orientation: "landscape",
      fontSize: 18,
      diagramTheme: "forest",
      chromePath: "/usr/bin/chrome",
    });
    const s = getSettings();
    expect(s.pageSize).toBe("Letter");
    expect(s.orientation).toBe("landscape");
    expect(s.fontSize).toBe(18);
    expect(s.diagramTheme).toBe("forest");
    expect(s.chromePath).toBe("/usr/bin/chrome");
  });

  it("returns footer template with page numbers by default", () => {
    const s = getSettings();
    expect(s.footerTemplate).toContain("pageNumber");
    expect(s.footerTemplate).toContain("totalPages");
  });
});
