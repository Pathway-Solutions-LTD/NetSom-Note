<p align="center">
  <img src="docs/logo.png" width="120" alt="NetSom Note logo" />
</p>

<h1 align="center">NetSom Note</h1>

<p align="center">
  A fast, private notes app with a modern blurred glass design.<br/>
  Works fully offline. Your notes are stored on your own device.
</p>

<p align="center"><b>Powered by Pathway Solutions</b></p>

---

## Features

- **Offline first** – no internet, account or server needed.
- **Private** – notes live in a local SQLite database on your device.
- **Rich text** – bold, italic, underline, strikethrough, bullet and numbered lists, text colors and highlights.
- **Search** – instantly search titles and note text.
- **Pin** important notes to the top.
- **Autosave** – every keystroke is saved automatically.
- **Custom look** – Light, Dark or Auto theme and six accent colors.
- **Always one click away** – lives in the menu bar / system tray. Closing the window keeps it running; click the tray icon to open it or choose *New Note*.
- **Focus mode** – hide the notes list to write full width; *New Note* from the tray opens straight into a fresh note with the list hidden.
- Shortcuts: `Ctrl/⌘ + N` new note, `Ctrl/⌘ + \` show/hide the notes list.

## Download

**[⬇ Get the latest version from GitHub Releases](https://github.com/Pathway-Solutions-LTD/NetSom-Note/releases/latest)** – free for everyone.

| Platform | Download |
| --- | --- |
| macOS (Apple Silicon) | [NetSom-Note_0.1.0_aarch64.dmg](downloads/NetSom-Note_0.1.0_aarch64.dmg) |
| macOS (Intel) | Built by the release workflow (see below) |
| Windows | `.msi` / `.exe` from the release workflow (see below) |
| Linux | `.deb` / `.AppImage` from the release workflow (see below) |

**Install on macOS:** open the `.dmg` and drag *NetSom Note* into *Applications*. The app is not code-signed yet, so on first launch right-click the app and choose **Open**.

### Building the Windows and Linux installers

Installers can only be built on their own operating system, so this repo includes a GitHub Actions workflow ([.github/workflows/release.yml](.github/workflows/release.yml)). Run the **Build NetSom Note** workflow manually or push a tag such as `v0.1.0`. It builds macOS (Apple Silicon and Intel), Windows and Linux installers and attaches them to a draft GitHub Release, which becomes your public download page.

## Build from source

Requirements: [Node.js](https://nodejs.org), [pnpm](https://pnpm.io), [Rust](https://rustup.rs) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/).

```bash
pnpm install
pnpm tauri dev      # run in development
pnpm tauri build    # create an installer for your current OS
```

Installers are written to `src-tauri/target/release/bundle/`.

## Tech

[Tauri 2](https://tauri.app) · React · TypeScript · Vite · SQLite

---

<p align="center">Powered by <b>Pathway Solutions</b></p>
