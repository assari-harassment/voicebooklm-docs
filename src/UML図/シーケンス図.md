# シーケンス図

システムの主要なフローを時系列で図示したシーケンス図です。

---

## 1. 音声メモ生成フロー（メインフロー）

アプリのコア機能「音声 → 文字起こし → AI整形 → 保存」の全体フローです。

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend API
    participant STT as 🎤 Google Speech-to-Text
    participant AI as 🤖 Gemini AI
    participant DB as 🗄️ PostgreSQL

    Note over App: ユーザーが録音完了

    App->>API: POST /api/voice/memos<br/>multipart/form-data<br/>(file, language)
    activate API

    Note over API: JWT検証

    API->>STT: 音声ファイル送信
    activate STT
    STT-->>API: 文字起こしテキスト
    deactivate STT

    alt 文字起こし成功
        API->>AI: 文字起こしテキスト送信
        activate AI
        Note over AI: タイトル生成<br/>本文整形<br/>タグ抽出
        AI-->>API: 整形結果<br/>(title, content, tags)
        deactivate AI

        alt AI整形成功
            API->>DB: メモ保存
            activate DB
            DB-->>API: 保存完了
            deactivate DB
            API-->>App: 201 Created<br/>{memoId, title, content, tags, ...}
        else AI整形失敗
            Note over API: フォールバック処理<br/>文字起こしテキストをそのまま使用
            API->>DB: メモ保存（フォールバック）
            DB-->>API: 保存完了
            API-->>App: 201 Created<br/>{..., fallback: {formatting: true}}
        end
    else 文字起こし失敗
        API-->>App: 500 Internal Server Error
    end

    deactivate API
```

### フローの詳細

| ステップ | 処理内容 | 処理時間目安 |
|---------|---------|------------|
| 1 | 音声ファイルアップロード | ファイルサイズ依存 |
| 2-3 | JWT認証 + 文字起こし | 2-10秒 |
| 4-5 | AI整形処理 | 1-3秒 |
| 6-7 | DB保存 | 100ms以下 |

### エラーハンドリング

- **文字起こし失敗**: 500エラーを返却
- **AI整形失敗**: フォールバックモードで文字起こしテキストをそのまま保存
- **DB保存失敗**: 500エラーを返却

---

## 2. Google OAuth ログインフロー

Google Sign-In を使用した認証フローです。

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant Google as 🌐 Google OAuth
    participant API as 🖥️ Backend API
    participant DB as 🗄️ PostgreSQL

    App->>Google: Google Sign-In 開始
    activate Google
    Note over Google: ユーザー認証<br/>同意画面
    Google-->>App: ID Token
    deactivate Google

    App->>API: POST /api/auth/google<br/>{idToken}
    activate API

    API->>Google: ID Token 検証<br/>/tokeninfo
    activate Google
    Google-->>API: Token Info<br/>(sub, email, name, ...)
    deactivate Google

    alt トークン検証成功
        API->>DB: ユーザー検索<br/>(googleSub)
        activate DB

        alt 既存ユーザー
            DB-->>API: User
        else 新規ユーザー
            API->>DB: ユーザー作成
            DB-->>API: User
        end

        Note over API: JWT生成<br/>・accessToken (1日)<br/>・refreshToken (180日)

        API->>DB: RefreshToken 保存
        DB-->>API: 保存完了
        deactivate DB

        API-->>App: 200 OK<br/>{accessToken, refreshToken}
    else トークン検証失敗
        API-->>App: 401 Unauthorized
    end

    deactivate API
```

### セキュリティポイント

| 項目 | 内容 |
|-----|------|
| ID Token 検証 | Google の `/tokeninfo` エンドポイントで検証 |
| aud クレーム確認 | クライアントIDとの一致を確認 |
| メール検証確認 | `email_verified: true` を確認 |
| UUIDv7 使用 | 時系列順でソート可能なID |

---

## 3. トークンリフレッシュフロー

アクセストークン更新時のトークンローテーションフローです。

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend API
    participant DB as 🗄️ PostgreSQL

    Note over App: accessToken 期限切れ検知

    App->>API: POST /api/auth/refresh<br/>{refreshToken}
    activate API

    API->>DB: RefreshToken 検証<br/>(token, revoked=false, expires > now)
    activate DB
    DB-->>API: RefreshToken (valid/invalid)
    deactivate DB

    alt トークン有効
        API->>DB: ユーザー取得
        activate DB
        DB-->>API: User
        deactivate DB

        API->>DB: 旧 RefreshToken 無効化<br/>(revoked = true)
        activate DB
        DB-->>API: 更新完了
        deactivate DB

        Note over API: 新規JWT生成<br/>・accessToken<br/>・refreshToken

        API->>DB: 新 RefreshToken 保存
        activate DB
        DB-->>API: 保存完了
        deactivate DB

        API-->>App: 200 OK<br/>{accessToken, refreshToken}
    else トークン無効/期限切れ
        API-->>App: 401 Unauthorized
        Note over App: 再ログイン必要
    end

    deactivate API
```

### トークンローテーションの意義

```
旧トークン使用 → 無効化 → 新トークン発行
```

- **リプレイ攻撃防止**: 古いトークンは使えなくなる
- **トークン漏洩検知**: 無効化済みトークンの使用で検知可能
- **セッション管理**: アクティブなセッションのみ有効

---

## 4. 認証付きAPI呼び出しフロー

JWT認証が必要なAPIの共通フローです。

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant Filter as 🔐 JwtAuthFilter
    participant Controller as 📋 Controller
    participant UseCase as ⚙️ UseCase

    App->>Filter: API Request<br/>Authorization: Bearer {token}
    activate Filter

    Filter->>Filter: JWT検証

    alt 有効なアクセストークン
        Filter->>Filter: SecurityContext設定<br/>(userId, email)
        Filter->>Controller: Request継続
        activate Controller
        Controller->>UseCase: ビジネスロジック実行
        activate UseCase
        UseCase-->>Controller: 結果
        deactivate UseCase
        Controller-->>App: 200 OK / 201 Created
        deactivate Controller
    else 無効/期限切れトークン
        Filter-->>App: 401 Unauthorized
    else リフレッシュトークン使用
        Filter-->>App: 401 Unauthorized<br/>(アクセストークンが必要)
    end

    deactivate Filter
```

---

## 5. ログアウトフロー

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend API
    participant DB as 🗄️ PostgreSQL

    App->>API: POST /api/auth/logout<br/>{refreshToken}
    activate API

    API->>DB: RefreshToken 無効化<br/>(revoked = true)
    activate DB
    DB-->>API: 更新完了
    deactivate DB

    API-->>App: 204 No Content
    deactivate API

    Note over App: ローカルトークン削除
```

---

## 6. アカウント削除フロー

```mermaid
sequenceDiagram
    autonumber
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend API
    participant DB as 🗄️ PostgreSQL

    App->>API: DELETE /api/auth/account<br/>Authorization: Bearer {token}
    activate API

    Note over API: JWT検証（userId取得）

    API->>DB: メモ削除<br/>(user_id = ?)
    activate DB
    DB-->>API: 削除完了
    deactivate DB

    API->>DB: RefreshToken 削除<br/>(user_id = ?)
    activate DB
    DB-->>API: 削除完了
    deactivate DB

    API->>DB: User 削除<br/>(id = ?)
    activate DB
    DB-->>API: 削除完了
    deactivate DB

    API-->>App: 204 No Content
    deactivate API

    Note over App: ログイン画面へ遷移
```

### 削除順序の重要性

外部キー制約を考慮し、以下の順序で削除:

1. **VoiceMemo** (user_id 参照)
2. **RefreshToken** (user_id 参照)
3. **User** (親テーブル)

---

## 7. エラーハンドリング全体像

```mermaid
sequenceDiagram
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend API

    Note over App,API: 想定されるエラーパターン

    rect rgb(255, 230, 230)
        Note right of App: 認証エラー
        App->>API: 無効なJWT
        API-->>App: 401 Unauthorized<br/>{error, code: "UNAUTHORIZED"}
    end

    rect rgb(255, 245, 230)
        Note right of App: 入力エラー
        App->>API: 不正なリクエスト
        API-->>App: 400 Bad Request<br/>{error, code: "BAD_REQUEST"}
    end

    rect rgb(255, 230, 245)
        Note right of App: リソースエラー
        App->>API: 存在しないリソース
        API-->>App: 404 Not Found<br/>{error, code: "NOT_FOUND"}
    end

    rect rgb(230, 230, 255)
        Note right of App: サーバーエラー
        App->>API: 外部API障害
        API-->>App: 500 Internal Server Error<br/>{error, code: "INTERNAL_SERVER_ERROR"}
    end
```

---

## 処理時間の目安

| フロー | 想定処理時間 | ボトルネック |
|-------|------------|------------|
| ログイン | 500ms - 1s | Google Token検証 |
| トークンリフレッシュ | 100ms - 200ms | DB操作 |
| 音声メモ生成 | 3s - 15s | Speech-to-Text + AI整形 |
| ログアウト | 50ms - 100ms | DB操作 |
| アカウント削除 | 200ms - 500ms | 複数テーブル削除 |

---

## 関連ドキュメント

- [アーキテクチャ](../概要・設計/architecture.md) - システム全体構成
- [認証](../バックエンド/auth.md) - 認証システム詳細
- [API リファレンス](../バックエンド/api-reference.md) - API仕様詳細
- [アクティビティ図](./activity.md) - ユーザー操作フロー
