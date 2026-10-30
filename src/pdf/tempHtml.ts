import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Write HTML to a fresh private temp directory. A predictable name directly in a
 * shared tmpdir could be pre-created as a symlink by another local user.
 */
export function writeTempHtml(prefix: string, html: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const file = path.join(dir, "index.html");
  fs.writeFileSync(file, html, { mode: 0o600 });
  return file;
}

export function removeTempHtml(file: string): void {
  try { fs.rmSync(path.dirname(file), { recursive: true, force: true }); } catch { /* ignore */ }
}
