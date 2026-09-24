import * as path from "path";
import { pathToFileURL } from "url";

/**
 * Absolute path to a third-party asset copied into dist/vendor at build time.
 * The bundle lives in dist/, so __dirname resolves to dist/ at runtime.
 */
export function vendorPath(file: string): string {
  return path.join(__dirname, "vendor", file);
}

export function vendorFileUrl(file: string): string {
  return pathToFileURL(vendorPath(file)).href;
}
