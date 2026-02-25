# Convert Markdown to PDF

A VS Code extension that exports Markdown files to high-quality PDFs using Chrome/Chromium.

## Features

- **Export to PDF** — Convert any `.md` file to PDF via command palette or right-click menu
- **Live Preview** — Side-by-side preview panel that updates as you type
- **Custom Styling** — Apply your own CSS themes to the PDF output
- **Configurable** — Page size, margins, font size, headers, and footers

## Requirements

- [Google Chrome](https://www.google.com/chrome/) or Chromium-based browser installed
- The extension auto-detects Chrome on macOS, Windows, and Linux

## Usage

1. Open a Markdown file
2. Run **"Export Markdown to PDF"** from the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Choose where to save the PDF

Or right-click a `.md` file in the explorer and select **"Export to PDF"**.

### Live Preview

Click the eye icon in the editor title bar, or run **"Open PDF Preview"** from the command palette.

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `convertMdToPdf.chromePath` | Auto-detect | Path to Chrome/Chromium executable |
| `convertMdToPdf.pageSize` | `A4` | Page size: A4, Letter, Legal, Tabloid |
| `convertMdToPdf.margins` | `20mm / 15mm` | Top, bottom, left, right margins |
| `convertMdToPdf.fontSize` | `14` | Base font size in pixels |
| `convertMdToPdf.customCssPath` | — | Path to a custom CSS file |
| `convertMdToPdf.headerTemplate` | — | HTML header template |
| `convertMdToPdf.footerTemplate` | Page numbers | HTML footer template |

## Development

```bash
pnpm install
pnpm dev        # watch mode
# Press F5 in VS Code to launch Extension Development Host
pnpm build      # production build
```

## License

MIT
