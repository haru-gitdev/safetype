# Compose & Paste

A simple macOS/Windows app that provides a floating text editor triggered by a global hotkey. Write your text, press a shortcut, and it automatically pastes into the previously active application.

## Features

- **Global Hotkey**: Press `Cmd+Shift+Space` (macOS) to open the floating editor from anywhere
- **Quick Paste**: Press `Cmd+Enter` to copy text to clipboard and automatically paste it into the previous app
- **Always on Top**: The editor window stays above other windows
- **Cancel Anytime**: Press `Esc` to close without pasting
- **Cross-Platform**: Works on macOS (Windows support planned)

## Use Cases

- Writing messages in apps with small input fields (Slack, Teams, etc.)
- Composing longer text before pasting into forms
- Having a consistent text editor experience across all applications

## Installation

### macOS

1. Download the latest `.dmg` from [Releases](https://github.com/haru-gitdev/compose-paste/releases)
2. Open the DMG and drag `Compose & Paste.app` to your Applications folder
3. On first launch, grant Accessibility permission:
   - Go to **System Settings > Privacy & Security > Accessibility**
   - Add and enable `Compose & Paste.app`

### Build from Source

Prerequisites:
- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/) (or npm/pnpm)

```bash
# Clone the repository
git clone https://github.com/haru-gitdev/compose-paste.git
cd compose-paste

# Install dependencies
bun install

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

## Usage

1. Press `Cmd+Shift+Space` to open the editor
2. Type your text
3. Press `Cmd+Enter` or click "Paste" to send text to the previous app
4. Press `Esc` to cancel

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+Space` | Open/close the editor |
| `Cmd+Enter` | Copy and paste to previous app |
| `Esc` | Cancel and close |

## Tech Stack

- [Tauri v2](https://tauri.app/) - Rust-based desktop framework
- [React](https://react.dev/) - Frontend UI
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [enigo](https://github.com/enigo-rs/enigo) - Cross-platform keyboard simulation

## Accessibility Permission (macOS)

This app requires Accessibility permission to:
- Register global hotkeys
- Simulate `Cmd+Tab` and `Cmd+V` keystrokes

Without this permission, the app cannot paste text into other applications.

## Roadmap

- [ ] Settings UI with customizable hotkeys
- [ ] Windows support
- [ ] Code signing and notarization
- [ ] Homebrew Cask distribution

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
