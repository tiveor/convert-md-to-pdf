<p align="center">
  <img src="media/icon.png" alt="Convert Markdown to PDF" width="128" height="128">
</p>

<h1 align="center">Convert Markdown to PDF</h1>

<p align="center">
  <strong>Beautiful PDFs from Markdown — with diagrams, presentations, and live preview.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=alvarotech.convert-md-to-pdf"><img src="https://img.shields.io/visual-studio-marketplace/v/alvarotech.convert-md-to-pdf?style=flat-square&label=Marketplace&color=007ACC" alt="VS Marketplace"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=alvarotech.convert-md-to-pdf"><img src="https://img.shields.io/visual-studio-marketplace/i/alvarotech.convert-md-to-pdf?style=flat-square&label=Installs&color=4CAF50" alt="Installs"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=alvarotech.convert-md-to-pdf"><img src="https://img.shields.io/visual-studio-marketplace/r/alvarotech.convert-md-to-pdf?style=flat-square&label=Rating&color=FFC107" alt="Rating"></a>
  <a href="https://github.com/tiveor/convert-md-to-pdf/blob/main/LICENSE"><img src="https://img.shields.io/github/license/tiveor/convert-md-to-pdf?style=flat-square&color=blue" alt="License"></a>
  <a href="https://github.com/tiveor/convert-md-to-pdf"><img src="https://img.shields.io/github/stars/tiveor/convert-md-to-pdf?style=flat-square&color=yellow" alt="GitHub Stars"></a>
</p>

---

A VS Code extension that turns your Markdown into polished, print-ready PDFs — complete with Mermaid diagrams, Excalidraw sketches, Marp presentations, syntax highlighting, and custom themes. All rendered locally via Chrome.

## Features

- **Export to PDF** — One-click export from the command palette or right-click menu
- **Live Preview** — Side-by-side panel that updates in real time as you type
- **Mermaid Diagrams** — Flowcharts, sequence diagrams, class diagrams, and more
- **Excalidraw Sketches** — Hand-drawn style diagrams from JSON blocks
- **Marp Presentations** — Slide decks to PDF, auto-detected via `marp: true` front matter
- **5 Diagram Themes** — Ocean, Forest, Rose, Slate, Sunset — pick one in settings
- **Smart Orientation** — Auto-detects wide diagrams and adjusts page layout
- **Custom CSS** — Full control over PDF styling with your own stylesheet
- **Configurable** — Page size, margins, font size, headers, footers, and more

## Quick Start

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=alvarotech.convert-md-to-pdf)
2. Open any `.md` file
3. `Cmd+Shift+P` (or `Ctrl+Shift+P`) &rarr; **Export Markdown to PDF**

> You can also right-click any `.md` file in the explorer or editor.

### Live Preview

Click the preview icon in the editor title bar, or run **"Open PDF Preview"** from the command palette.

### Marp Presentations

Add `marp: true` to your front matter and the extension will prompt you to export as a presentation PDF with slide layout.

## Diagram Themes

Choose a color theme for your Mermaid diagrams via `convertMdToPdf.diagramTheme`:

| Theme | Style |
|-------|-------|
| `ocean` | Blue tones — clean and professional **(default)** |
| `forest` | Green tones — natural and fresh |
| `rose` | Pink/purple tones — warm and modern |
| `slate` | Gray tones — minimal and neutral |
| `sunset` | Orange/amber tones — warm and energetic |

## Settings

| Setting | Default | Description |
|---|---|---|
| `chromePath` | Auto-detect | Path to Chrome/Chromium executable |
| `pageSize` | `A4` | A4, Letter, Legal, Tabloid |
| `orientation` | `auto` | `auto`, `portrait`, `landscape` |
| `margins` | `20mm / 15mm` | Top, bottom, left, right margins |
| `fontSize` | `14` | Base font size in pixels |
| `diagramTheme` | `ocean` | Mermaid theme: `ocean`, `forest`, `rose`, `slate`, `sunset` |
| `customCssPath` | — | Path to a custom CSS file |
| `headerTemplate` | — | HTML header template (Puppeteer format) |
| `footerTemplate` | Page numbers | HTML footer template (Puppeteer format) |

> All settings are prefixed with `convertMdToPdf.` in your VS Code settings.

## Requirements

- [Google Chrome](https://www.google.com/chrome/) or any Chromium-based browser
- Auto-detected on macOS, Windows, and Linux — or set the path manually

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

```bash
git clone https://github.com/tiveor/convert-md-to-pdf.git
cd convert-md-to-pdf
pnpm install
pnpm dev          # watch mode with hot reload
# Press F5 in VS Code to launch the Extension Development Host
pnpm build        # production build
pnpm package      # create .vsix package
```

## License

[MIT](LICENSE) &copy; [Alvaro Orellana](https://github.com/tiveor)
