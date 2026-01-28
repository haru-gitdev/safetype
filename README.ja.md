# Safetype

> [!NOTE]
> :us: [English version](README.md)

チャットや生成AIへのプロンプトなどで、間違って書き途中の文章を送ってしまったこと、ありませんか？

**Safetype**は、そんな悩みを解消します。

グローバルホットキーでいつでも呼び出せるフローティングエディタで、安心して文章を書き上げてから、ワンアクションで元のアプリにペースト。もう「Enter誤爆」に悩むことはありません。

## こんな場面で便利

- **Slack / Teams / Discord** - 長文メッセージを落ち着いて書きたいとき
- **ChatGPT / Claude** - プロンプトを推敲してから送りたいとき
- **入力欄が小さいフォーム** - 広いスペースで文章を確認したいとき

## 特徴

- :keyboard: **グローバルホットキー** - どのアプリからでも `Cmd+Shift+Space` で即起動
- :clipboard: **ワンアクションペースト** - `Cmd+Enter` で元のアプリに自動ペースト
- :pushpin: **常に最前面** - 他のウィンドウに隠れない
- :x: **Escでキャンセル** - 気が変わったらすぐ閉じれる
- :gear: **バックグラウンド動作** - ウィンドウを閉じても非表示になるだけ、アプリはバックグラウンドで動作し続ける

## インストール

### macOS

1. [Releases](https://github.com/haru-gitdev/safetype/releases) から最新の `.dmg` をダウンロード
2. DMGを開いて `Safetype.app` をアプリケーションフォルダにドラッグ
3. 初回起動時にアクセシビリティ権限を許可:
   - **システム設定 > プライバシーとセキュリティ > アクセシビリティ** を開く
   - `Safetype.app` を追加して有効化

### ソースからビルド

必要なもの:
- [Rust](https://rustup.rs/)
- [Bun](https://bun.sh/)（npm/pnpmでも可）

```bash
# リポジトリをクローン
git clone https://github.com/haru-gitdev/safetype.git
cd safetype

# 依存関係をインストール
bun install

# 開発モードで実行
bun run tauri dev

# 本番用ビルド
bun run tauri build
```

## 使い方

1. `Cmd+Shift+Space` でエディタを開く
2. テキストを入力
3. `Cmd+Enter` または「Paste」ボタンで元のアプリにペースト
4. `Esc` でキャンセル

## キーボードショートカット

| ショートカット | 動作 |
|----------------|------|
| `Cmd+Shift+Space` | エディタを開く/閉じる |
| `Cmd+Enter` | コピーして元のアプリにペースト |
| `Esc` | キャンセルして閉じる |

## 技術スタック

- [Tauri v2](https://tauri.app/) - Rustベースのデスクトップフレームワーク
- [React](https://react.dev/) - フロントエンドUI
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [enigo](https://github.com/enigo-rs/enigo) - クロスプラットフォームキーボードシミュレーション

## アクセシビリティ権限について（macOS）

このアプリは以下の機能のためにアクセシビリティ権限が必要です:
- グローバルホットキーの登録
- `Cmd+Tab` と `Cmd+V` キーストロークのシミュレーション

この権限がないと、他のアプリケーションへのペーストができません。

## ロードマップ

- [ ] 設定画面（ホットキーのカスタマイズ）
- [ ] Windows対応
- [ ] コード署名・Notarization
- [ ] Homebrew Cask配布

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

## コントリビューション

Pull Requestを歓迎します！
