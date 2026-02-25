# Quick Start — Test Locally

## 1. Install dependencies

```bash
pnpm install
```

## 2. Build in watch mode

```bash
pnpm dev
```

## 3. Launch the Extension Development Host

- Press **F5** in VS Code (or go to Run > Start Debugging)
- A new VS Code window will open with the extension loaded

## 4. Test the extension

### Export to PDF
1. Open or create any `.md` file in the new window
2. Press `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
3. Type **"Export Markdown to PDF"** and press Enter
4. Pick a save location — done!

### Live Preview
1. Open any `.md` file
2. Click the **eye icon** in the editor title bar (top right)
3. A preview panel opens side-by-side
4. Edit the markdown — the preview updates live

### Right-click export
1. Right-click any `.md` file in the Explorer sidebar
2. Select **"Export to PDF"**

## Troubleshooting

| Problem | Fix |
|---|---|
| "Chrome not found" error | Install Chrome, or set `convertMdToPdf.chromePath` in settings to your browser path |
| macOS Chrome path | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| Extension not loading | Make sure `pnpm dev` is running, then restart with F5 |
| Build errors | Run `pnpm lint` to check for TypeScript errors |
