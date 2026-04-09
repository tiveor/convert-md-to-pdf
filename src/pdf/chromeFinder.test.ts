import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as child_process from "child_process";

// We need to mock before importing, so use vi.mock
vi.mock("fs");
vi.mock("child_process");

const mockExistsSync = vi.mocked(fs.existsSync);
const mockExecSync = vi.mocked(child_process.execSync);

// Store original platform to restore later
const originalPlatform = process.platform;

function setPlatform(platform: string) {
  Object.defineProperty(process, "platform", { value: platform, writable: true });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockExistsSync.mockReturnValue(false);
  mockExecSync.mockImplementation(() => { throw new Error("not found"); });
});

afterEach(() => {
  setPlatform(originalPlatform);
});

// Re-import for each test to pick up fresh mocks
async function getFindChrome() {
  const mod = await import("./chromeFinder");
  return mod.findChrome;
}

describe("chromeFinder", () => {
  describe("macOS", () => {
    it("returns first existing Chrome path", async () => {
      setPlatform("darwin");
      mockExistsSync.mockImplementation((p) =>
        p === "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      );
      const findChrome = await getFindChrome();
      expect(findChrome()).toBe("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    });

    it("falls back to Chromium if Chrome not found", async () => {
      setPlatform("darwin");
      mockExistsSync.mockImplementation((p) =>
        p === "/Applications/Chromium.app/Contents/MacOS/Chromium"
      );
      const findChrome = await getFindChrome();
      expect(findChrome()).toBe("/Applications/Chromium.app/Contents/MacOS/Chromium");
    });

    it("returns null when no browser found", async () => {
      setPlatform("darwin");
      const findChrome = await getFindChrome();
      expect(findChrome()).toBeNull();
    });
  });

  describe("linux", () => {
    it("finds chrome via which command", async () => {
      setPlatform("linux");
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === "which google-chrome") return "/usr/bin/google-chrome\n";
        throw new Error("not found");
      });
      const findChrome = await getFindChrome();
      expect(findChrome()).toBe("/usr/bin/google-chrome");
    });

    it("falls back to chromium-browser", async () => {
      setPlatform("linux");
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === "which chromium-browser") return "/usr/bin/chromium-browser\n";
        throw new Error("not found");
      });
      const findChrome = await getFindChrome();
      expect(findChrome()).toBe("/usr/bin/chromium-browser");
    });

    it("finds brave-browser", async () => {
      setPlatform("linux");
      mockExecSync.mockImplementation((cmd) => {
        if (cmd === "which brave-browser") return "/usr/bin/brave-browser\n";
        throw new Error("not found");
      });
      const findChrome = await getFindChrome();
      expect(findChrome()).toBe("/usr/bin/brave-browser");
    });

    it("returns null when no browser found", async () => {
      setPlatform("linux");
      const findChrome = await getFindChrome();
      expect(findChrome()).toBeNull();
    });
  });

  describe("windows", () => {
    it("finds chrome in Program Files", async () => {
      setPlatform("win32");
      mockExistsSync.mockImplementation((p) =>
        typeof p === "string" && p.endsWith("Google\\Chrome\\Application\\chrome.exe")
      );
      const findChrome = await getFindChrome();
      const result = findChrome();
      expect(result).not.toBeNull();
      expect(result!).toContain("chrome.exe");
    });

    it("finds Edge via where command", async () => {
      setPlatform("win32");
      mockExecSync.mockImplementation((cmd) => {
        if (typeof cmd === "string" && cmd === "where msedge") {
          return "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe\r\n";
        }
        throw new Error("not found");
      });
      // Make the found path pass existsSync
      mockExistsSync.mockImplementation((p) =>
        p === "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
      );
      const findChrome = await getFindChrome();
      const result = findChrome();
      expect(result).toContain("msedge.exe");
    });

    it("handles CRLF in where output", async () => {
      setPlatform("win32");
      mockExecSync.mockImplementation((cmd) => {
        if (typeof cmd === "string" && cmd === "where chrome") {
          return "C:\\chrome.exe\r\nC:\\other\\chrome.exe\r\n";
        }
        throw new Error("not found");
      });
      mockExistsSync.mockImplementation((p) => p === "C:\\chrome.exe");
      const findChrome = await getFindChrome();
      const result = findChrome();
      expect(result).toBe("C:\\chrome.exe");
    });

    it("falls back to registry lookup", async () => {
      setPlatform("win32");
      // Filesystem and where fail
      mockExecSync.mockImplementation((cmd) => {
        if (typeof cmd === "string" && cmd.startsWith("reg query")) {
          if (cmd.includes("chrome.exe")) {
            return '    (Default)    REG_SZ    C:\\RegChrome\\chrome.exe\n';
          }
        }
        throw new Error("not found");
      });
      mockExistsSync.mockImplementation((p) => p === "C:\\RegChrome\\chrome.exe");
      const findChrome = await getFindChrome();
      const result = findChrome();
      expect(result).toBe("C:\\RegChrome\\chrome.exe");
    });

    it("returns null when nothing found", async () => {
      setPlatform("win32");
      const findChrome = await getFindChrome();
      expect(findChrome()).toBeNull();
    });
  });
});
