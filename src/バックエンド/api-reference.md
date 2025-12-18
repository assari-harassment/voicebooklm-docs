# API リファレンス

実装済み API の詳細仕様です。

---

## 認証 API (`/api/auth`)

### POST `/api/auth/google` - Google OAuth ログイン

Google ID トークンを検証し、JWT トークンペアを発行します。新規ユーザーの場合はアカウントを作成します。

**認証**: 不要

**リクエスト**:
```json
{
  "idToken": "string (必須) - Google ID トークン"
}
```

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `200 OK` | ログイン成功 |
| `401 Unauthorized` | 認証失敗 |

```json
{
  "accessToken": "string - アクセストークン（1日有効）",
  "refreshToken": "string - リフレッシュトークン（180日間有効）"
}
```

---

### POST `/api/auth/refresh` - トークンリフレッシュ

リフレッシュトークンを使用して新しいトークンペアを発行します（トークンローテーション）。

**認証**: 不要

**リクエスト**:
```json
{
  "refreshToken": "string (必須) - リフレッシュトークン"
}
```

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `200 OK` | リフレッシュ成功 |
| `401 Unauthorized` | リフレッシュトークンが無効または期限切れ |

```json
{
  "accessToken": "string - 新しいアクセストークン",
  "refreshToken": "string - 新しいリフレッシュトークン"
}
```

---

### POST `/api/auth/logout` - ログアウト

リフレッシュトークンを無効化してログアウトします。

**認証**: 不要

**リクエスト**:
```json
{
  "refreshToken": "string (必須) - リフレッシュトークン"
}
```

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `204 No Content` | ログアウト成功 |
| `400 Bad Request` | リクエスト形式が不正 |

---

### DELETE `/api/auth/account` - アカウント削除

ユーザーアカウントとすべての関連データを完全に削除します。

**認証**: 必須（JWT Bearer トークン）

**リクエスト**:
```
Authorization: Bearer <access_token>
```

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `204 No Content` | 削除成功 |
| `401 Unauthorized` | 認証失敗 |
| `404 Not Found` | ユーザーが見つからない |

---

### GET `/api/auth/me` - 現在のユーザー情報取得

認証済みユーザーの情報を取得します。

**認証**: 必須（JWT Bearer トークン）

**リクエスト**:
```
Authorization: Bearer <access_token>
```

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `200 OK` | 取得成功 |
| `401 Unauthorized` | 認証失敗 |
| `404 Not Found` | ユーザーが見つからない |

```json
{
  "id": "UUID - ユーザー ID",
  "email": "string - メールアドレス",
  "name": "string - ユーザー名"
}
```

---

## 音声メモ API (`/api/voice`)

### POST `/api/voice/memos` - 音声ファイルからメモを生成

音声ファイルをアップロードし、文字起こし → AI整形 → 保存を行います。

**認証**: 必須（JWT Bearer トークン）

**Content-Type**: `multipart/form-data`

**リクエスト**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|:----:|------|
| `file` | File | ○ | 音声ファイル |
| `language` | String | × | 言語コード（例: `ja-JP`, `en-US`） |

**レスポンス**:

| ステータス | 説明 |
|-----------|------|
| `201 Created` | メモ生成成功 |
| `400 Bad Request` | 入力不正（音声が空、Content-Type 不正など） |
| `401 Unauthorized` | 認証エラー（JWT 不正） |
| `500 Internal Server Error` | サーバエラー |

```json
{
  "memoId": "UUID - メモ ID",
  "title": "string - タイトル",
  "content": "string - 整形されたメモ内容",
  "tags": ["string"],
  "transcription": "string | null - 文字起こしテキスト",
  "transcriptionStatus": "COMPLETED | FAILED | PENDING",
  "formattingStatus": "COMPLETED | FAILED | PENDING",
  "processingTimeMillis": {
    "transcription": "number (ms)",
    "formatting": "number (ms)",
    "persistence": "number (ms)",
    "total": "number (ms)"
  },
  "fallback": {
    "transcription": "boolean",
    "formatting": "boolean"
  }
}
```

---

## 共通仕様

### 認証方式

JWT (JSON Web Token) を使用。

| トークン種別 | 有効期限 |
|-------------|---------|
| アクセストークン | 1日 |
| リフレッシュトークン | 180日 |

認証が必要な API には `Authorization` ヘッダーを設定:
```
Authorization: Bearer <access_token>
```

### エラーレスポンス

```json
{
  "error": "string - エラーメッセージ",
  "code": "string - エラーコード"
}
```

| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | 認証失敗 |
| `FORBIDDEN` | アクセス権限なし |
| `NOT_FOUND` | リソースが見つからない |
| `BAD_REQUEST` | リクエスト形式が不正 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |

### OpenAPI ドキュメント

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API 仕様 (JSON)**: `http://localhost:8080/v3/api-docs`
