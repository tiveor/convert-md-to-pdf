# Changelog

## [0.2.7] - 2026-04-09

### Fixed

- **Windows browser detection**: check Program Files, Program Files (x86), LocalAppData, PATH (`where`), and Windows Registry App Paths for Chrome, Edge, Brave, and Chromium (thanks @deezel! [#1](https://github.com/tiveor/convert-md-to-pdf/pull/1))
- Fixed CRLF parsing from `where` output on Windows

### Changed

- `.vsix` packages now output to `dist/` instead of project root
- Removed unused exports from mermaid theme module
- Updated README to accurately reflect codebase features and commands
- Updated LICENSE copyright to Alvaro Orellana (tiveor)

## [0.2.6] - 2026-03-10

### Added

- **Diagram theme selector**: new `convertMdToPdf.diagramTheme` setting with 5 preset themes for Mermaid diagrams
  - **ocean** — blue tones, clean and professional (default)
  - **forest** — green tones, natural and fresh
  - **rose** — pink/purple tones, warm and modern
  - **slate** — gray tones, minimal and neutral
  - **sunset** — orange/amber tones, warm and energetic
- Shared theme config module (`mermaidTheme.ts`) used across PDF export, preview, and presentations

### Fixed

- Flowchart diagrams now render with consistent, readable colors matching sequence diagrams
- Inline `style` directives in Mermaid source are stripped so the selected theme always applies uniformly

## [0.2.5] - 2026-03-02

### Added

- **Excalidraw diagram rendering** in PDF export and live preview (`\`\`\`excalidraw` code blocks)
- Renders Excalidraw JSON to hand-drawn SVGs using `@excalidraw/utils` via CDN
- Orientation picker now triggers for both Mermaid and Excalidraw diagrams

### Changed

- Presentation export now uses Marp Core + Puppeteer directly instead of spawning `npx @marp-team/marp-cli`
- No external CLI dependency needed — uses the same bundled Chrome approach as regular PDF export
- Added `@marp-team/marp-core` as a direct dependency

### Fixed

- Chrome browser process now force-killed after 5s if `browser.close()` hangs
- Added 30s timeout on all Puppeteer page operations to prevent indefinite hangs
- "Exporting PDF..." notification now closes immediately when the PDF is written (not when user dismisses the success message)
- Added 60s overall timeout on PDF export to guarantee notification always closes
- Presentation export was missing `headless: true`, causing a visible Chrome window on macOS
- Added `--disable-gpu` flag to reduce macOS dock icon flash

## [0.2.3] - 2026-03-01

### Added

- New command **"Export Markdown to Presentation PDF"** using Marp CLI (`npx @marp-team/marp-cli`)
- Available in editor right-click, explorer right-click, and command palette
- Auto-detection of `marp: true` front matter: the regular export command now prompts to choose between Presentation PDF (Marp) or regular PDF (Chrome)

## [0.2.2] - 2026-03-01

### Changed

- Replaced Mermaid diagram size picker with a **page orientation** picker (Auto, Portrait, Landscape)
- `convertMdToPdf.orientation` setting replaces `convertMdToPdf.mermaidScale`
- **Auto** mode renders Mermaid diagrams at full content width and fits them to the page without blank pages
- Improved PDF generator: viewport matches page content width so diagrams render at maximum readable size

### Removed

- `convertMdToPdf.mermaidScale` setting (replaced by `orientation`)

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
