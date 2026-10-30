import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { writeTempHtml, removeTempHtml } from "./tempHtml";

describe("tempHtml", () => {
  it("writes into a fresh private directory and removes it", () => {
    const file = writeTempHtml("md-pdf", "<p>hi</p>");
    const dir = path.dirname(file);
    expect(path.dirname(dir)).toBe(os.tmpdir());
    expect(fs.readFileSync(file, "utf-8")).toBe("<p>hi</p>");
    if (process.platform !== "win32") {
      expect(fs.statSync(file).mode & 0o077).toBe(0);
    }
    removeTempHtml(file);
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("uses a different directory on every call", () => {
    const a = writeTempHtml("md-pdf", "");
    const b = writeTempHtml("md-pdf", "");
    expect(path.dirname(a)).not.toBe(path.dirname(b));
    removeTempHtml(a);
    removeTempHtml(b);
  });
});
