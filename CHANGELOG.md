# Changelog

## [0.2.1] - 2026-02-26

### Added

- Mermaid diagram size control: choose Small (65%), Medium (80%), or Large (100%) when exporting
- New `convertMdToPdf.mermaidScale` setting with options: `ask`, `small`, `medium`, `large`
- Auto-detection of Mermaid diagrams prompts a size picker before PDF export
- Proportional scaling applied to both width and height of all diagram types

## [0.2.0] - 2026-02-26

### Added

- Mermaid diagram rendering in PDF export (flowcharts, sequence, class, and all mermaid diagram types)
- Mermaid diagram rendering in live preview panel
- "Open PDF Preview" in editor and explorer right-click context menus

### Changed

- PDF generator now uses `page.goto()` with temp file for reliable script loading
- Preview panel enables scripts for mermaid rendering
- Preview CSP updated to allow mermaid CDN

## [0.1.0] - 2026-02-25

### Added

- Export Markdown to PDF via command palette and right-click context menu
- Live preview panel with real-time updates as you type
- Custom CSS support for PDF styling
- Configurable page size (A4, Letter, Legal, Tabloid)
- Configurable margins, font size, header and footer templates
- Auto-detection of Chrome/Chromium on macOS, Windows, and Linux
- Syntax highlighting for code blocks using highlight.js
- GitHub-style default stylesheet
