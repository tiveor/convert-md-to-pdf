import { describe, it, expect } from "vitest";
import { renderMarkdown, slugify, stripFrontmatter, hasMath } from "./renderer";

describe("slugify", () => {
  it("matches GitHub heading slugs", () => {
    expect(slugify("1. Who is on the thread")).toBe("1-who-is-on-the-thread");
    expect(slugify("Phase 1 · daily batch")).toBe("phase-1--daily-batch");
    expect(slugify("Configuración rápida")).toBe("configuración-rápida");
  });
});

describe("stripFrontmatter", () => {
  it("removes front matter with CRLF line endings", () => {
    expect(stripFrontmatter("---\r\ntitle: x\r\n---\r\n# Hi")).toBe("# Hi");
  });
});

describe("renderMarkdown", () => {
  it("adds ids to headings so internal links work", () => {
    const html = renderMarkdown("## Getting Started\n\n[go](#getting-started)");
    expect(html).toContain('<h2 id="getting-started">');
    expect(html).toContain('href="#getting-started"');
  });

  it("renders a table of contents for [[toc]]", () => {
    const html = renderMarkdown("[[toc]]\n\n# One\n\n## Two");
    expect(html).toContain('class="table-of-contents"');
    expect(html).toContain('href="#one"');
    expect(html).toContain('href="#two"');
  });

  it("renders inline, block and fenced math with KaTeX", () => {
    expect(renderMarkdown("$a^2$")).toContain('class="katex"');
    expect(renderMarkdown("$$\nx = 1\n$$")).toContain("katex-display");
    expect(renderMarkdown("```math\nx = 1\n```")).toContain("katex-display");
  });

  it("does not treat currency amounts as math", () => {
    expect(hasMath(renderMarkdown("It costs $5 or $10."))).toBe(false);
  });

  it("turns <!-- pagebreak --> into a page break", () => {
    expect(renderMarkdown("a\n\n<!-- pagebreak -->\n\nb")).toContain('<div class="page-break"></div>');
    expect(renderMarkdown("a\n\n<!-- page-break -->\n\nb")).toContain('<div class="page-break"></div>');
  });

  it("leaves pagebreak comments inside code blocks untouched", () => {
    const html = renderMarkdown("```\n<!-- pagebreak -->\n```");
    expect(html).not.toContain("page-break");
  });
});
