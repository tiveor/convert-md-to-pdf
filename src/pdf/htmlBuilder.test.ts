import { describe, it, expect } from "vitest";
import { buildHtml } from "./htmlBuilder";
import type { PdfSettings } from "../config/settings";

const defaults: PdfSettings = {
  chromePath: "",
  pageSize: "A4",
  orientation: "auto",
  margins: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  fontSize: 14,
  customCssPath: "",
  headerTemplate: "",
  footerTemplate: "",
  diagramTheme: "ocean",
};

describe("buildHtml", () => {
  it("renders basic markdown to HTML", () => {
    const html = buildHtml("# Hello World", defaults);
    expect(html).toContain("<h1>Hello World</h1>");
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("applies configured font size", () => {
    const html = buildHtml("test", { ...defaults, fontSize: 18 });
    expect(html).toContain("font-size: 18px");
  });

  it("strips YAML front matter", () => {
    const md = "---\ntitle: Test\nmarp: true\n---\n# Content";
    const html = buildHtml(md, defaults);
    expect(html).not.toContain("title: Test");
    expect(html).toContain("<h1>Content</h1>");
  });

  it("converts mermaid code blocks to pre.mermaid", () => {
    const md = "```mermaid\ngraph TD\n  A-->B\n```";
    const html = buildHtml(md, defaults);
    expect(html).toContain('<pre class="mermaid">');
    expect(html).toContain("A-->B");
  });

  it("converts excalidraw code blocks to pre.excalidraw", () => {
    const md = '```excalidraw\n{"elements":[]}\n```';
    const html = buildHtml(md, defaults);
    expect(html).toContain('<pre class="excalidraw">');
  });

  it("syntax highlights known languages", () => {
    const md = "```js\nconst x = 1;\n```";
    const html = buildHtml(md, defaults);
    expect(html).toContain('<pre class="hljs">');
    expect(html).toContain("hljs-");
  });

  it("escapes unknown language code blocks", () => {
    const md = "```unknownlang\n<script>alert('xss')</script>\n```";
    const html = buildHtml(md, defaults);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
  });

  it("includes custom CSS when provided", () => {
    const css = "body { color: red; }";
    const html = buildHtml("test", defaults, css);
    expect(html).toContain(css);
  });

  it("does not include custom CSS style tag when not provided", () => {
    const html = buildHtml("test", defaults);
    // Should have exactly 2 <style> blocks (base + hljs), not 3
    const styleCount = (html.match(/<style>/g) || []).length;
    expect(styleCount).toBe(2);
  });

  it("renders inline HTML when enabled", () => {
    const md = '<div class="custom">hello</div>';
    const html = buildHtml(md, defaults);
    expect(html).toContain('<div class="custom">hello</div>');
  });

  it("linkifies URLs", () => {
    const md = "Visit https://example.com for more.";
    const html = buildHtml(md, defaults);
    expect(html).toContain('href="https://example.com"');
  });

  it("injects <base> tag when baseDir provided so relative image paths resolve", () => {
    const html = buildHtml("![pic](./photo.png)", defaults, undefined, "/Users/me/docs");
    expect(html).toContain('<base href="file:///Users/me/docs/">');
    expect(html).toContain('src="./photo.png"');
  });

  it("does not inject <base> tag when baseDir is omitted", () => {
    const html = buildHtml("test", defaults);
    expect(html).not.toContain("<base");
  });

  it("normalizes trailing slash on baseDir", () => {
    const html = buildHtml("test", defaults, undefined, "/Users/me/docs/");
    expect(html).toContain('<base href="file:///Users/me/docs/">');
  });
});
