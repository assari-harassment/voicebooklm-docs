# voicebooklm-docs

voicebooklmのドキュメントです。mdbookで構築しています。

- **Web(リリースURL)**: https://voicenotelm.app

## githubリポジトリ
- **フロントエンド**: https://github.com/assari-harassment/voicebooklm-frontend
- **バックエンド**: https://github.com/assari-harassment/voicebooklm-backend

## セットアップ

### 必要なツール

- Node.js 22.11（asdf または mise 推奨）
- [mdbook](https://rust-lang.github.io/mdBook/)
- [mdbook-plantuml](https://github.com/sytsereitsma/mdbook-plantuml)

### インストール

```bash
# Node.js
asdf install  # または mise install

# mdbook と mdbook-plantuml
cargo install mdbook mdbook-plantuml

# npm依存関係
npm install
```

## 開発

### マークダウンのフォーマット

```bash
# フォーマット実行
npm run format

# フォーマットチェック
npm run format:check
```

### ドキュメントのビルド

```bash
mdbook build
```

### ローカルでプレビュー

```bash
mdbook serve
```

## VSCode拡張機能

このプロジェクトでは以下の拡張機能を推奨しています：

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - マークダウンの自動フォーマット
- [Mermaid Editor](https://marketplace.visualstudio.com/items?itemName=tomoyukim.vscode-mermaid-editor) - Mermaid図のグラフィカル編集

VSCodeでPrettier拡張機能をインストールすると、ファイル保存時（Ctrl+S / Cmd+S）に自動でフォーマットされます。
