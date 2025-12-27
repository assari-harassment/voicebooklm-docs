# 画面遷移図

VoiceBookLM モバイルアプリの画面遷移を図示します。

---

## 全体概要

```mermaid
stateDiagram-v2
    [*] --> スプラッシュ
    スプラッシュ --> ログイン: 未認証
    スプラッシュ --> ホーム: 認証済み

    state ログイン {
        [*] --> ログイン画面
        ログイン画面 --> Google認証
        Google認証 --> ログイン画面: 失敗
    }
    ログイン --> ホーム: 認証成功

    state ホーム {
        [*] --> メモ一覧
        メモ一覧 --> 検索
        検索 --> メモ一覧
    }

    ホーム --> 録音: 録音ボタン
    録音 --> 処理中: 録音完了
    処理中 --> メモ詳細: 生成完了
    メモ詳細 --> ホーム: 戻る

    ホーム --> メモ詳細: メモ選択
    ホーム --> 設定: 設定アイコン

    設定 --> ログイン: ログアウト
    設定 --> [*]: アカウント削除
```

---

## 1. 認証フロー

```mermaid
flowchart TD
    subgraph 起動["📱 アプリ起動"]
        Splash[スプラッシュ画面]
    end

    subgraph 認証チェック["🔐 認証チェック"]
        Check{JWT有効?}
        Refresh{リフレッシュ<br/>可能?}
    end

    subgraph ログイン["🔑 ログイン"]
        Login[ログイン画面]
        GoogleAuth[Google Sign-In]
        AuthError[認証エラー<br/>ダイアログ]
    end

    subgraph メイン["🏠 メイン"]
        Home[ホーム画面]
    end

    Splash --> Check
    Check -->|有効| Home
    Check -->|期限切れ| Refresh
    Refresh -->|成功| Home
    Refresh -->|失敗| Login

    Check -->|なし| Login
    Login -->|Googleでログイン| GoogleAuth
    GoogleAuth -->|成功| Home
    GoogleAuth -->|失敗| AuthError
    AuthError -->|再試行| Login

    style Splash fill:#e1f5fe
    style Home fill:#c8e6c9
    style Login fill:#fff3e0
    style AuthError fill:#ffcdd2
```

### 画面詳細

| 画面 | 説明 | 主要アクション |
|-----|------|--------------|
| スプラッシュ | アプリロゴ表示、JWT検証 | 自動遷移 |
| ログイン | Google Sign-In ボタン | Googleでログイン |
| 認証エラー | エラーメッセージ表示 | 再試行、閉じる |

---

## 2. メイン画面フロー

```mermaid
flowchart TD
    subgraph ホーム["🏠 ホーム画面"]
        MemoList[メモ一覧<br/>日付順表示]
        Directory[ディレクトリ<br/>ツリー表示]
        SearchBar[検索バー]
        RecordBtn((🎤<br/>録音))
        SettingsBtn[⚙️]
    end

    subgraph 検索["🔍 検索"]
        SearchInput[キーワード入力]
        TagFilter[タグフィルター]
        SearchResults[検索結果一覧]
    end

    subgraph メモ詳細["📄 メモ詳細"]
        MemoView[メモ表示<br/>Markdown]
        MemoTags[タグ表示]
        MemoMeta[作成日時]
        ResummarizeBtn[再要約ボタン]
    end

    subgraph 録音["🎤 録音画面"]
        Recording[録音中<br/>波形表示]
        StopBtn[停止ボタン]
    end

    subgraph 処理中["⏳ 処理中"]
        Uploading[アップロード中]
        Transcribing[文字起こし中]
        Formatting[AI整形中]
    end

    subgraph 設定["⚙️ 設定"]
        Profile[プロフィール]
        Language[言語設定]
        Logout[ログアウト]
        DeleteAccount[アカウント削除]
    end

    MemoList --> SearchBar
    SearchBar --> SearchInput
    SearchInput --> SearchResults
    TagFilter --> SearchResults
    SearchResults --> MemoView

    MemoList --> MemoView
    Directory --> MemoView

    RecordBtn --> Recording
    Recording --> StopBtn
    StopBtn --> Uploading
    Uploading --> Transcribing
    Transcribing --> Formatting
    Formatting --> MemoView

    MemoView --> ResummarizeBtn
    ResummarizeBtn --> Formatting

    SettingsBtn --> Profile
    Profile --> Language
    Profile --> Logout
    Profile --> DeleteAccount

    style RecordBtn fill:#f44336,color:#fff
    style MemoList fill:#e3f2fd
    style MemoView fill:#e8f5e9
    style Recording fill:#ffebee
    style Formatting fill:#fff3e0
```

---

## 3. 録音〜保存フロー（詳細）

```mermaid
flowchart TD
    subgraph 録音準備["📱 録音準備"]
        Home[ホーム画面]
        RecordButton((🎤))
        PermissionCheck{マイク<br/>許可?}
        PermissionRequest[許可リクエスト]
    end

    subgraph 録音中["🔴 録音中"]
        RecordingScreen[録音画面]
        Waveform[波形表示]
        Timer[経過時間]
        StopButton[停止ボタン]
        CancelButton[キャンセル]
    end

    subgraph 確認["✅ 確認"]
        Preview[録音プレビュー]
        PlayButton[再生]
        RetryButton[録り直し]
        SubmitButton[送信]
    end

    subgraph 処理["⚙️ 処理中"]
        Progress[プログレス表示]
        Step1[1. アップロード中...]
        Step2[2. 文字起こし中...]
        Step3[3. AI整形中...]
        Step4[4. 保存中...]
    end

    subgraph 完了["🎉 完了"]
        Result[生成結果画面]
        Title[タイトル]
        Content[整形済み本文]
        Tags[自動タグ]
        SaveButton[保存して閉じる]
    end

    subgraph エラー["❌ エラー"]
        ErrorDialog[エラーダイアログ]
        RetryOption[再試行]
        DismissOption[閉じる]
    end

    Home --> RecordButton
    RecordButton --> PermissionCheck
    PermissionCheck -->|許可済み| RecordingScreen
    PermissionCheck -->|未許可| PermissionRequest
    PermissionRequest -->|許可| RecordingScreen
    PermissionRequest -->|拒否| Home

    RecordingScreen --> Waveform
    RecordingScreen --> Timer
    RecordingScreen --> StopButton
    RecordingScreen --> CancelButton
    CancelButton --> Home

    StopButton --> Preview
    Preview --> PlayButton
    Preview --> RetryButton
    Preview --> SubmitButton
    RetryButton --> RecordingScreen

    SubmitButton --> Progress
    Progress --> Step1 --> Step2 --> Step3 --> Step4

    Step4 -->|成功| Result
    Step1 -->|失敗| ErrorDialog
    Step2 -->|失敗| ErrorDialog
    Step3 -->|失敗| ErrorDialog

    ErrorDialog --> RetryOption
    ErrorDialog --> DismissOption
    RetryOption --> Progress
    DismissOption --> Home

    Result --> Title
    Result --> Content
    Result --> Tags
    Result --> SaveButton
    SaveButton --> Home

    style RecordButton fill:#f44336,color:#fff
    style RecordingScreen fill:#ffcdd2
    style Progress fill:#fff3e0
    style Result fill:#c8e6c9
    style ErrorDialog fill:#ffcdd2
```

---

## 4. 画面一覧

### 認証系

| # | 画面名 | パス | 説明 |
|---|-------|-----|------|
| 1 | スプラッシュ | `/splash` | アプリ起動時のロード画面 |
| 2 | ログイン | `/login` | Google Sign-In ボタン |

### メイン系

| # | 画面名 | パス | 説明 |
|---|-------|-----|------|
| 3 | ホーム | `/home` | メモ一覧、ディレクトリ表示 |
| 4 | 検索 | `/search` | キーワード・タグ検索 |
| 5 | メモ詳細 | `/memo/:id` | Markdown形式でメモ表示 |

### 録音系

| # | 画面名 | パス | 説明 |
|---|-------|-----|------|
| 6 | 録音 | `/record` | 音声録音画面 |
| 7 | 録音確認 | `/record/preview` | 録音プレビュー・送信確認 |
| 8 | 処理中 | `/record/processing` | アップロード〜AI整形のプログレス |
| 9 | 生成結果 | `/record/result` | 生成されたメモの確認 |

### 設定系

| # | 画面名 | パス | 説明 |
|---|-------|-----|------|
| 10 | 設定 | `/settings` | 設定メニュー |
| 11 | プロフィール | `/settings/profile` | ユーザー情報表示 |
| 12 | 言語設定 | `/settings/language` | 文字起こし言語選択 |

---

## 5. 画面コンポーネント構成

```mermaid
flowchart TB
    subgraph App["📱 App"]
        subgraph Navigation["🧭 Navigation"]
            BottomTab[BottomTabNavigator]
            Stack[StackNavigator]
        end

        subgraph Screens["📄 Screens"]
            subgraph Auth["認証"]
                SplashScreen
                LoginScreen
            end

            subgraph Main["メイン"]
                HomeScreen
                SearchScreen
                MemoDetailScreen
            end

            subgraph Record["録音"]
                RecordScreen
                PreviewScreen
                ProcessingScreen
                ResultScreen
            end

            subgraph Settings["設定"]
                SettingsScreen
                ProfileScreen
                LanguageScreen
            end
        end

        subgraph Components["🧩 共通コンポーネント"]
            Header[Header]
            MemoCard[MemoCard]
            TagChip[TagChip]
            LoadingIndicator[LoadingIndicator]
            ErrorDialog[ErrorDialog]
            FAB[FloatingActionButton]
        end
    end

    BottomTab --> HomeScreen
    BottomTab --> SearchScreen
    BottomTab --> SettingsScreen

    Stack --> MemoDetailScreen
    Stack --> RecordScreen
    Stack --> PreviewScreen
    Stack --> ProcessingScreen
    Stack --> ResultScreen

    HomeScreen --> MemoCard
    HomeScreen --> FAB
    SearchScreen --> MemoCard
    SearchScreen --> TagChip
    MemoDetailScreen --> TagChip

    RecordScreen --> Header
    ProcessingScreen --> LoadingIndicator
    ResultScreen --> TagChip
```

---

## 6. ナビゲーション構造

```
App
├── AuthStack (未認証時)
│   ├── Splash
│   └── Login
│
└── MainStack (認証済み)
    ├── BottomTabs
    │   ├── HomeTab
    │   │   └── Home
    │   ├── SearchTab
    │   │   └── Search
    │   └── SettingsTab
    │       └── Settings
    │
    └── Modals / Stacks
        ├── MemoDetail
        ├── RecordFlow
        │   ├── Record
        │   ├── Preview
        │   ├── Processing
        │   └── Result
        ├── Profile
        └── Language
```

---

## 7. 状態遷移表

### 認証状態

| 現在の状態 | イベント | 次の状態 | アクション |
|-----------|---------|---------|-----------|
| 未認証 | アプリ起動 | スプラッシュ | JWT確認 |
| スプラッシュ | JWT有効 | ホーム | 自動遷移 |
| スプラッシュ | JWT無効 | ログイン | 自動遷移 |
| ログイン | Google認証成功 | ホーム | トークン保存 |
| ログイン | Google認証失敗 | ログイン | エラー表示 |
| 認証済み | ログアウト | ログイン | トークン削除 |
| 認証済み | アカウント削除 | ログイン | データ削除 |

### 録音状態

| 現在の状態 | イベント | 次の状態 | アクション |
|-----------|---------|---------|-----------|
| ホーム | 録音ボタン | 録音画面 | 権限確認 |
| 録音画面 | 停止 | プレビュー | 録音停止 |
| 録音画面 | キャンセル | ホーム | 録音破棄 |
| プレビュー | 送信 | 処理中 | API呼び出し |
| プレビュー | 録り直し | 録音画面 | 録音リセット |
| 処理中 | 完了 | 結果画面 | レスポンス表示 |
| 処理中 | エラー | エラーダイアログ | エラー表示 |
| 結果画面 | 保存 | ホーム | 一覧更新 |

---

## 8. ワイヤーフレーム概要

### ホーム画面

```
┌─────────────────────────────────┐
│  📱 VoiceBookLM          ⚙️    │
├─────────────────────────────────┤
│  🔍 メモを検索...               │
├─────────────────────────────────┤
│                                 │
│  📁 アイデア                    │
│    └─ 📄 新機能のアイデア       │
│    └─ 📄 改善案メモ             │
│                                 │
│  📁 日記                        │
│    └─ 📄 今日の振り返り         │
│                                 │
│  📁 仕事                        │
│    └─ 📄 会議メモ               │
│                                 │
│                                 │
│                        ┌─────┐  │
│                        │ 🎤  │  │
│                        └─────┘  │
├─────────────────────────────────┤
│   🏠      🔍      ⚙️           │
└─────────────────────────────────┘
```

### 録音画面

```
┌─────────────────────────────────┐
│  ← 録音                         │
├─────────────────────────────────┤
│                                 │
│                                 │
│         ╭──────────────╮        │
│         │              │        │
│         │   🔴 録音中   │        │
│         │              │        │
│         ╰──────────────╯        │
│                                 │
│     ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿         │
│     波形表示                    │
│                                 │
│           00:15                 │
│                                 │
│         ┌─────────┐             │
│         │  停止   │             │
│         └─────────┘             │
│                                 │
│     キャンセル                   │
│                                 │
└─────────────────────────────────┘
```

### メモ詳細画面

```
┌─────────────────────────────────┐
│  ←  メモ詳細              ⋮    │
├─────────────────────────────────┤
│                                 │
│  # 新機能のアイデア             │
│                                 │
│  📅 2025-12-17                  │
│  🏷️ アイデア  機能  MVP         │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ## 概要                        │
│  音声入力でメモを取れる         │
│  アプリを作りたい。             │
│                                 │
│  ## ポイント                    │
│  - AIで自動整形                 │
│  - タグ自動付与                 │
│  - Markdown形式                 │
│                                 │
│  ## 次のアクション              │
│  - 技術選定を進める             │
│                                 │
│         ┌─────────┐             │
│         │ 再要約  │             │
│         └─────────┘             │
└─────────────────────────────────┘
```

---

## 関連ドキュメント

- [PRD](../概要・設計/PRD.md) - 製品要件定義
- [アクティビティ図](./activity.md) - ユーザー操作フロー
- [シーケンス図](./sequence.md) - システム間の通信フロー
- [API リファレンス](../バックエンド/api-reference.md) - バックエンドAPI仕様
