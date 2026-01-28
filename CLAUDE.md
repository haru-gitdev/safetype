# CLAUDE.md - Safetype

## Project Overview

Safetypeは、グローバルホットキーで呼び出せるフローティングテキストエディタです。

- **フレームワーク**: Tauri v2 + React + TypeScript
- **対象OS**: macOS (Apple Silicon)
- **GitHub**: https://github.com/haru-gitdev/safetype

## Development Commands

```bash
# 開発モード
bun run tauri dev

# 本番ビルド
bun run tauri build

# dmgの場所
src-tauri/target/release/bundle/dmg/
```

## Release Workflow

**コード変更後は必ずGitHub Releasesも更新すること。**

### 手順

1. コード修正・コミット・プッシュ
2. `bun run tauri build` でビルド
3. バージョン番号を確認（`src-tauri/tauri.conf.json` の `version`）
4. GitHub Releaseを作成:

```bash
gh release create vX.Y.Z \
  "src-tauri/target/release/bundle/dmg/Safetype_X.Y.Z_aarch64.dmg" \
  --title "vX.Y.Z" \
  --notes "リリースノート"
```

### バージョン更新時

`src-tauri/tauri.conf.json` の `version` フィールドを更新してからビルドすること。

## Architecture Notes

### ウィンドウ管理

- 赤ボタン（閉じるボタン）→ ウィンドウ非表示（アプリ継続）
- Escキー → ウィンドウ非表示
- `⌘+Shift+Space` → ウィンドウ表示/非表示トグル

**実装箇所**: `src-tauri/src/lib.rs` の `on_window_event`

### グローバルショートカット

- `⌘+Shift+Space`: エディタ表示
- `⌘+Enter`: コピーして前のアプリにペースト

**実装箇所**: `src/App.tsx`

## File Structure

```
safetype/
├── src/                  # React フロントエンド
│   └── App.tsx           # メインコンポーネント
├── src-tauri/
│   ├── src/
│   │   └── lib.rs        # Rustバックエンド
│   ├── tauri.conf.json   # Tauri設定
│   └── Cargo.toml        # Rust依存関係
├── README.md             # 英語README
└── README.ja.md          # 日本語README
```
