# VoiceBookLM Frontend

AIボイスメモアプリケーション「VoiceBookLM」のフロントエンドリポジトリです。  
React Native（Expo）で開発されています。

## 前提条件

開発環境の一貫性を保つため、以下のバージョンを導入

| ツール       | バージョン          |
|--------------|---------------------|
| Node.js      | `v22.11.0`（必須）     |
| npm          | `v10.x` 以上        |
| direnv       | 最新（Node自動切替用） |
| nvm          | Node Version Manager |

## 環境セットアップ（初回のみ）

チーム開発でのバージョン差異トラブル防止のため、**direnv + nvm の導入を必須**としています。

### 1. direnv のインストール

**Arch Linux**

```
sudo pacman -S direnv
```

macOS
```
brew install direnv
```

2. シェルへの設定追加

.zshrc または .bashrc に以下を追記してください。

zsh の場合
```zsh
eval "$(direnv hook zsh)"
```
bash の場合
```bash
eval "$(direnv hook bash)"
```
設定後、ターミナルを再起動するか以下を実行：
```zsh
source ~/.zshrc   
```
```bash
source ~/.bashrc
```

3. nvm のインストール（未インストールの場合）

インストールコマンドを表示

Arch Linux
```zsh
sudo pacman -S nvm
source /usr/share/nvm/init-nvm.sh
```
macOS / その他 Linux
```zsh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | zsh
```
プロジェクトセットアップ

```
git clone git@github.com:assari-harassment/voicebooklm-frontend.git
cd voicebooklm-frontend
```
1. Node.js バージョンの自動適用
```
direnv allow
```
成功例：
```
direnv: loading .../voicebooklm-frontend/.envrc
```
バージョン確認：
```
node -v   # → v22.11.x
npm -v    # → 10.x.x 以上
```
2. 環境変数の設定
```
cp .env.example .env
```
.env を開き、ローカル環境に必要な値を設定してください。

注意: .env は Git にコミットしないでください（.gitignore に記載済み）

3. 依存パッケージのインストール
```
npm install
```
アプリ起動（開発サーバー）
```
npm run dev
```
動作確認方法

環境操作方法実機（iOS/Android）Expo Go アプリで表示された QR コードを読み取るiOS Simulator（macOSのみ）ターミナルで i キー押下Android Emulatorターミナルで a キー押下

※ PC とスマホは同一 Wi-Fiに接続してください（VPN はオフ推奨）

よく使うコマンド（開発サーバー起動中に）

キー説明
```
r:アプリをリロード
m:開発メニューを表示
Ctrl + C:開発サーバー停止
```
トラブルシューティング

症状確認ポイントnpm install でエラーNode.js が v22 か？ direnv allow 済みか？実機で接続できない同一Wi-Fiか？ VPNオフ？ ファイアウォール設定？.env が反映されない.env 作成済みか？ npm run dev 再起動したか？

ディレクトリ構成（仮？）

text
```
voicebooklm-frontend/
├── app/                 # Expo Router ページコンポーネント
├── components/          # 再利用可能なUIコンポーネント
├── hooks/               # カスタム React Hooks
├── services/            # API通信・外部サービスロジック
├── assets/              # 画像・フォントなどの静的資産
├── .env.example         # 環境変数テンプレート
├── .envrc               # direnv 設定ファイル
├── .nvmrc               # Node.js バージョン指定
└── README.md            # このファイル
```
ライセンス

（必要に応じて追記してください）