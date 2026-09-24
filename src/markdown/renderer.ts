import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import anchor from "markdown-it-anchor";
import tocDoneRight from "markdown-it-toc-done-right";
import katex from "@vscode/markdown-it-katex";

const escapeHtml = MarkdownIt().utils.escapeHtml;

const PAGE_BREAK = /<!--\s*page-?break\s*-->/gi;

export function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/** GitHub-style heading slug, so `[link](#some-heading)` resolves like it does on GitHub */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function highlight(str: string, lang: string): string {
  // Diagram sources are escaped so inline HTML labels (<br/>, <b>) reach the renderer intact
  if (lang === "mermaid") {
    return `<pre class="mermaid">${escapeHtml(str)}</pre>`;
  }
  if (lang === "excalidraw") {
    return `<pre class="excalidraw">${escapeHtml(str)}</pre>`;
  }
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
    } catch {
      // fall through
    }
  }
  return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`;
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight,
})
  .use(katex, { enableFencedBlocks: true, throwOnError: false })
  .use(anchor, { slugify, tabIndex: false })
  .use(tocDoneRight, { slugify, level: [1, 2, 3], listType: "ul" });

/** Render Markdown to HTML with math, heading anchors, [[toc]] and <!-- pagebreak --> support */
export function renderMarkdown(markdown: string): string {
  return md
    .render(stripFrontmatter(markdown))
    .replace(PAGE_BREAK, '<div class="page-break"></div>');
}

export function hasMath(html: string): boolean {
  return html.includes('class="katex');
}
