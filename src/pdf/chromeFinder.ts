import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const MACOS_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
];

const LINUX_EXECUTABLES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium-browser",
  "chromium",
  "microsoft-edge",
  "microsoft-edge-stable",
  "brave-browser",
];

const WINDOWS_BROWSER_CANDIDATES = [
  { exeName: "chrome.exe", relativePath: "Google\\Chrome\\Application\\chrome.exe" },
  { exeName: "msedge.exe", relativePath: "Microsoft\\Edge\\Application\\msedge.exe" },
  { exeName: "brave.exe", relativePath: "BraveSoftware\\Brave-Browser\\Application\\brave.exe" },
  { exeName: "chromium.exe", relativePath: "Chromium\\Application\\chrome.exe" },
] as const;

const WINDOWS_EXECUTABLES = ["chrome", "msedge", "brave", "chromium"];

const WINDOWS_REGISTRY_BASE_KEYS = [
  "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths",
  "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths",
  "HKCU\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths",
  "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths",
];

function fileExists(filePath: string | null | undefined): filePath is string {
  return !!filePath && fs.existsSync(filePath);
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}

function getWindowsInstallRoots(): string[] {
  return uniqueStrings([
    process.env.PROGRAMFILES,
    process.env["PROGRAMFILES(X86)"],
    process.env.LOCALAPPDATA,
    "C:\\Program Files",
    "C:\\Program Files (x86)",
  ]);
}

function getWindowsPathCandidates(): string[] {
  const roots = getWindowsInstallRoots();

  return WINDOWS_BROWSER_CANDIDATES.flatMap(({ relativePath }) =>
    roots.map((root) => path.join(root, relativePath))
  );
}

function whichSync(command: string): string | null {
  try {
    const result = execSync(
      process.platform === "win32" ? `where ${command}` : `which ${command}`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const firstLine = result.trim().split(/\r?\n/)[0];
    return firstLine || null;
  } catch {
    return null;
  }
}

function readWindowsRegistryAppPath(exeName: string): string | null {
  for (const baseKey of WINDOWS_REGISTRY_BASE_KEYS) {
    const key = `${baseKey}\\${exeName}`;
    try {
      const result = execSync(`reg query "${key}" /ve`, {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const match = result.match(/^\s*\(Default\)\s+REG_\w+\s+(.+)$/m);
      const resolvedPath = match?.[1]?.trim().replace(/^"(.*)"$/, "$1");
      if (fileExists(resolvedPath)) {
        return resolvedPath;
      }
    } catch {
      // Keep probing additional registry keys.
    }
  }

  return null;
}

export function findChrome(): string | null {
  switch (process.platform) {
    case "darwin": {
      for (const p of MACOS_PATHS) {
        if (fileExists(p)) {
          return p;
        }
      }
      break;
    }
    case "linux": {
      for (const exe of LINUX_EXECUTABLES) {
        const found = whichSync(exe);
        if (found) {
          return found;
        }
      }
      break;
    }
    case "win32": {
      for (const p of getWindowsPathCandidates()) {
        if (fileExists(p)) {
          return p;
        }
      }

      for (const exe of WINDOWS_EXECUTABLES) {
        const found = whichSync(exe);
        if (fileExists(found)) {
          return found;
        }
      }

      for (const { exeName } of WINDOWS_BROWSER_CANDIDATES) {
        const found = readWindowsRegistryAppPath(exeName);
        if (found) {
          return found;
        }
      }
      break;
    }
  }

  return null;
}
