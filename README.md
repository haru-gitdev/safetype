# Safetype

> [!NOTE]
> :jp: [日本語版 / Japanese](README.ja.md)

Ever accidentally sent an unfinished message while typing in a chat app or AI prompt?

**Safetype** puts an end to that frustration.

A floating text editor you can summon from anywhere with a global hotkey. Write your message in peace, then paste it into the previous app with a single keystroke. No more "Enter accidents."

## Perfect for

- **Slack / Teams / Discord** - Compose longer messages without pressure
- **ChatGPT / Claude** - Refine your prompts before sending
- **Tiny input fields** - Get a proper writing space for forms and comments

## Features

- :keyboard: **Global Hotkey** - Press `Cmd+Shift+Space` to summon from any app
- :clipboard: **One-Action Paste** - `Cmd+Enter` copies and pastes to the previous app
- :pushpin: **Always on Top** - Never loses focus to other windows
- :x: **Esc to Cancel** - Changed your mind? Just close it

## Installation

### macOS

1. Download the latest `.dmg` from [Releases](https://github.com/haru-gitdev/safetype/releases)
2. Open the DMG and drag `Safetype.app` to your Applications folder
3. On first launch, grant Accessibility permission:
   - Go to **System Settings > Privacy & Security > Accessibility**
   - Add and enable `Safetype.app`

### Build from Source

Prerequisites:
- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/) (or npm/pnpm)

```bash
# Clone the repository
git clone https://github.com/haru-gitdev/safetype.git
cd safetype

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
