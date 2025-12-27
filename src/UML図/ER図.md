# ER図

```mermaid
erDiagram
    users {
        UUID id PK "UUIDv7"
        VARCHAR google_sub UK "Google User ID (sub claim)"
        VARCHAR email UK "メールアドレス"
        VARCHAR name "表示名"
        TIMESTAMPTZ created_at "作成日時"
        TIMESTAMPTZ updated_at "更新日時"
    }

    memos {
        UUID id PK "UUIDv7"
        UUID user_id FK "ユーザーID"
        VARCHAR transcription_status "文字起こしステータス"
        VARCHAR formatting_status "AI整形ステータス"
        TEXT transcription "文字起こし結果"
        VARCHAR title "AIタイトル"
        TEXT content "AI整形本文(Markdown)"
        TIMESTAMPTZ created_at "作成日時"
        TIMESTAMPTZ updated_at "更新日時"
        BOOLEAN deleted "論理削除フラグ"
    }

    memo_tags {
        UUID memo_id PK,FK "メモID"
        VARCHAR tag PK "タグ名"
    }

    refresh_tokens {
        UUID id PK "UUIDv7"
        VARCHAR token UK "リフレッシュトークン"
        UUID user_id FK "ユーザーID"
        TIMESTAMPTZ expires_at "有効期限"
        TIMESTAMPTZ created_at "作成日時"
        BOOLEAN revoked "無効化フラグ"
    }

    users ||--o{ memos : "has"
    users ||--o{ refresh_tokens : "has"
    memos ||--o{ memo_tags : "has"
```

## テーブル概要

| テーブル名       | 説明                                                       |
| ---------------- | ---------------------------------------------------------- |
| `users`          | ユーザーアカウント情報（Google OAuth 認証）                |
| `memos`          | AI 整形済みボイスメモ（文字起こし→AI整形の2段階処理）      |
| `memo_tags`      | メモタグ（AI 生成またはユーザー編集）                      |
| `refresh_tokens` | JWT リフレッシュトークン（トークンローテーション対応）     |

## リレーションシップ

- **users → memos**: 1対多（1ユーザーが複数のメモを持つ）
- **users → refresh_tokens**: 1対多（1ユーザーが複数のトークンを持つ）
- **memos → memo_tags**: 1対多（1メモが複数のタグを持つ）

## ステータス値

### transcription_status / formatting_status

| 値           | 説明     |
| ------------ | -------- |
| `PENDING`    | 処理待ち |
| `PROCESSING` | 処理中   |
| `COMPLETED`  | 完了     |
| `FAILED`     | 失敗     |
