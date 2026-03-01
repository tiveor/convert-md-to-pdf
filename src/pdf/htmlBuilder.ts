import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import * as fs from "fs";
import defaultCss from "../styles/default.css";
import type { PdfSettings } from "../config/settings";

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function highlight(str: string, lang: string): string {
  if (lang === "mermaid") {
    return `<pre class="mermaid">${str}</pre>`;
  }
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
    } catch {
      // fall through
    }
  }
  return `<pre class="hljs"><code>${MarkdownIt().utils.escapeHtml(str)}</code></pre>`;
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight,
});

export function buildHtml(markdown: string, settings: PdfSettings, customCss?: string): string {
  const body = md.render(stripFrontmatter(markdown));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-size: ${settings.fontSize}px; }
    ${defaultCss}
  </style>
  <style>
    /* highlight.js github theme inline */
    .hljs{color:#24292e;background:#f6f8fa}.hljs-comment,.hljs-quote{color:#6a737d;font-style:italic}.hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#d73a49;font-weight:700}.hljs-literal,.hljs-number,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr{color:#005cc5}.hljs-string,.hljs-doctag{color:#032f62}.hljs-title,.hljs-section,.hljs-selector-id{color:#6f42c1;font-weight:700}.hljs-type,.hljs-class .hljs-title{color:#6f42c1}.hljs-tag,.hljs-name,.hljs-attribute{color:#22863a}.hljs-regexp,.hljs-link{color:#032f62}.hljs-symbol,.hljs-bullet{color:#e36209}.hljs-built_in,.hljs-builtin-name{color:#005cc5}.hljs-meta{color:#735c0f;font-weight:700}.hljs-deletion{color:#b31d28;background:#ffeef0}.hljs-addition{color:#22863a;background:#f0fff4}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}
  </style>
  ${customCss ? `<style>${customCss}</style>` : ""}
</head>
<body>
  ${body}
</body>
</html>`;
}
