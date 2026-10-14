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

**[⬇ Download the latest version](https://github.com/Pathway-Solutions-LTD/NetSom-Note/releases/latest)** – free for everyone.

Every release contains an installer for each system:

| System | File to download |
| --- | --- |
| macOS – Apple Silicon (M1/M2/M3/M4) | `NetSom.Note_x.y.z_aarch64.dmg` |
| macOS – Intel | `NetSom.Note_x.y.z_x64.dmg` |
| Windows | `NetSom.Note_x.y.z_x64-setup.exe` or `.msi` |
| Linux | `.AppImage` (any distro) or `.deb` (Ubuntu/Debian) |

**macOS:** open the `.dmg` and drag *NetSom Note* into *Applications*. The app is not notarized by Apple yet, so macOS shows a warning the first time. Open it like this:
1. Try to open the app once, then click **Done / Cancel**.
2. Go to **System Settings → Privacy & Security**, scroll down and click **Open Anyway** next to *NetSom Note*.
3. If macOS says the app is **"damaged and can't be opened"**, open **Terminal** and run this once, then open the app again:
   ```bash
   xattr -cr "/Applications/NetSom Note.app"
   ```
**Windows:** run the installer. If SmartScreen warns, choose *More info → Run anyway*.
**Linux:** `chmod +x NetSom.Note_*.AppImage && ./NetSom.Note_*.AppImage`, or install the `.deb` with `sudo dpkg -i`.

A copy of the Apple Silicon build is also in [downloads/](downloads/).

## Publishing a release (GitHub Actions)

The workflow in [.github/workflows/release.yml](.github/workflows/release.yml) builds all installers automatically on GitHub's macOS, Windows and Linux machines.

1. Push the code to `main`.
2. Create a version tag and push it:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
   (Or open **Actions → Build NetSom Note → Run workflow**.)
3. Wait about 10–20 minutes for the four jobs (macOS ARM, macOS Intel, Windows, Linux) to finish.
4. Open **Releases**, review the draft release that was created, and click **Publish release**. Everyone can now download the installers.

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
