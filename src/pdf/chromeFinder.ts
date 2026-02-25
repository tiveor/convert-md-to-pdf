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
];

const WINDOWS_PATHS = [
  path.join(
    process.env.PROGRAMFILES || "C:\\Program Files",
    "Google\\Chrome\\Application\\chrome.exe"
  ),
  path.join(
    process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)",
    "Google\\Chrome\\Application\\chrome.exe"
  ),
  path.join(
    process.env.LOCALAPPDATA || "",
    "Google\\Chrome\\Application\\chrome.exe"
  ),
  path.join(
    process.env.PROGRAMFILES || "C:\\Program Files",
    "Microsoft\\Edge\\Application\\msedge.exe"
  ),
];

function whichSync(command: string): string | null {
  try {
    const result = execSync(
      process.platform === "win32" ? `where ${command}` : `which ${command}`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
    const firstLine = result.trim().split("\n")[0];
    return firstLine || null;
  } catch {
    return null;
  }
}

export function findChrome(): string | null {
  switch (process.platform) {
    case "darwin": {
      for (const p of MACOS_PATHS) {
        if (fs.existsSync(p)) {
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
      for (const p of WINDOWS_PATHS) {
        if (fs.existsSync(p)) {
          return p;
        }
      }
      break;
    }
  }

  return null;
}
