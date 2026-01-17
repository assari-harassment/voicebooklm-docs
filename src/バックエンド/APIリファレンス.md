# API リファレンス

VoiceBookLM バックエンド API の詳細仕様です。

> [!NOTE]
> **バージョン**: 0.0.1-SNAPSHOT  
> **開発環境**: `http://localhost:8080`  
> **本番環境**: `https://api.voicebooklm.example.com`

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

| ステータス         | 説明         |
| ------------------ | ------------ |
| `200 OK`           | ログイン成功 |
| `401 Unauthorized` | 認証失敗     |

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

| ステータス         | 説明                                     |
| ------------------ | ---------------------------------------- |
| `200 OK`           | リフレッシュ成功                         |
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

| ステータス        | 説明                 |
| ----------------- | -------------------- |
| `204 No Content`  | ログアウト成功       |
| `400 Bad Request` | リクエスト形式が不正 |

---

### DELETE `/api/auth/account` - アカウント削除

ユーザーアカウントとすべての関連データを完全に削除します。

**認証**: 必須（JWT Bearer トークン）

**レスポンス**:

| ステータス         | 説明                   |
| ------------------ | ---------------------- |
| `204 No Content`   | 削除成功               |
| `401 Unauthorized` | 認証失敗               |
| `404 Not Found`    | ユーザーが見つからない |

---

### GET `/api/auth/me` - 現在のユーザー情報取得

認証済みユーザーの情報を取得します。

**認証**: 必須（JWT Bearer トークン）

**レスポンス**:

| ステータス         | 説明                   |
| ------------------ | ---------------------- |
| `200 OK`           | 取得成功               |
| `401 Unauthorized` | 認証失敗               |
| `404 Not Found`    | ユーザーが見つからない |

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

音声ファイルをアップロードし、文字起こし → AI整形 → 保存を行います。60秒以内のレスポンスを想定。

**認証**: 必須（JWT Bearer トークン）

**Content-Type**: `multipart/form-data`

**リクエスト**:

| フィールド | 型     | 必須 | 説明                               |
| ---------- | ------ | :--: | ---------------------------------- |
| `file`     | File   |  ○   | 音声ファイル                       |
| `language` | String |  ×   | 言語コード（例: `ja-JP`, `en-US`） |

**レスポンス**:

| ステータス                  | 説明                                        |
| --------------------------- | ------------------------------------------- |
| `201 Created`               | メモ生成成功                                |
| `400 Bad Request`           | 入力不正（音声が空、Content-Type 不正など） |
| `401 Unauthorized`          | 認証エラー（JWT 不正）                      |
| `500 Internal Server Error` | サーバエラー                                |

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

## メモ API (`/api/memos`)

### GET `/api/memos` - メモ一覧取得

認証ユーザーのメモを取得します。フォルダーによるフィルタリング、キーワード検索、ソート、件数制限が可能。

**認証**: 必須（JWT Bearer トークン）

**クエリパラメータ**:

| パラメータ           | 型      | 必須 |  デフォルト  | 説明                                                           |
| -------------------- | ------- | :--: | :----------: | -------------------------------------------------------------- |
| `folderId`           | UUID    |  ×   |      -       | フォルダーIDでフィルタリング                                   |
| `includeDescendants` | boolean |  ×   |   `false`    | true の場合、子孫フォルダーのメモも含める                      |
| `uncategorizedOnly`  | boolean |  ×   |   `false`    | true の場合、未分類メモのみ取得                                |
| `keyword`            | string  |  ×   |      -       | キーワード検索（タイトルまたはコンテントに含まれるメモを検索） |
| `sort`               | string  |  ×   | `updated_at` | ソート項目（`updated_at`, `created_at`, `title`）              |
| `order`              | string  |  ×   |    `desc`    | ソート順序（`asc`, `desc`）                                    |
| `limit`              | integer |  ×   |      -       | 取得件数制限                                                   |

**レスポンス**:

| ステータス         | 説明       |
| ------------------ | ---------- |
| `200 OK`           | 取得成功   |
| `401 Unauthorized` | 認証エラー |

```json
{
  "memos": [
    {
      "memoId": "UUID",
      "title": "string | null",
      "tags": ["string"],
      "transcriptionStatus": "COMPLETED | FAILED | PENDING",
      "formattingStatus": "COMPLETED | FAILED | PENDING",
      "folder": {
        "id": "UUID",
        "name": "string",
        "path": "string"
      },
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

---

### GET `/api/memos/{id}` - メモ詳細取得

指定されたIDのメモの詳細情報を取得します。セキュリティ上、権限のないメモも404として返します。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明    |
| ---------- | ---- | :--: | ------- |
| `id`       | UUID |  ○   | メモ ID |

**レスポンス**:

| ステータス         | 説明                                                       |
| ------------------ | ---------------------------------------------------------- |
| `200 OK`           | 取得成功                                                   |
| `401 Unauthorized` | 認証失敗                                                   |
| `404 Not Found`    | メモが見つからない（存在しない、削除済み、または権限なし） |

```json
{
  "memoId": "UUID",
  "title": "string | null",
  "content": "string | null",
  "tags": ["string"],
  "transcriptionText": "string | null",
  "transcriptionStatus": "COMPLETED | FAILED | PENDING",
  "formattingStatus": "COMPLETED | FAILED | PENDING",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

### PATCH `/api/memos/{id}` - メモ更新

メモの部分更新を行います。指定されたフィールドのみ更新されます。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明    |
| ---------- | ---- | :--: | ------- |
| `id`       | UUID |  ○   | メモ ID |

**リクエスト**:

```json
{
  "title": "string (任意, 最大100文字)",
  "content": "string (任意)",
  "tags": ["string (任意)"]
}
```

**レスポンス**:

| ステータス                 | 説明                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `200 OK`                   | 更新成功                                                   |
| `400 Bad Request`          | バリデーションエラー                                       |
| `401 Unauthorized`         | 認証失敗                                                   |
| `404 Not Found`            | メモが見つからない（存在しない、削除済み、または権限なし） |
| `422 Unprocessable Entity` | メモの整形が完了していない、またはフォルダーが存在しない   |

```json
{
  "memoId": "UUID",
  "title": "string | null",
  "content": "string | null",
  "tags": ["string"],
  "transcriptionText": "string | null",
  "transcriptionStatus": "COMPLETED | FAILED | PENDING",
  "formattingStatus": "COMPLETED | FAILED | PENDING",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

### DELETE `/api/memos/{id}` - メモ削除

指定されたメモを削除します。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明    |
| ---------- | ---- | :--: | ------- |
| `id`       | UUID |  ○   | メモ ID |

**レスポンス**:

| ステータス         | 説明               |
| ------------------ | ------------------ |
| `204 No Content`   | 削除成功           |
| `401 Unauthorized` | 認証失敗           |
| `403 Forbidden`    | アクセス権限なし   |
| `404 Not Found`    | メモが見つからない |

---

### POST `/api/memos/{id}/resummarize` - 再要約

編集された文字起こしテキストから再度AI整形（要約）を行います。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明    |
| ---------- | ---- | :--: | ------- |
| `id`       | UUID |  ○   | メモ ID |

**リクエスト**:

```json
{
  "editedTranscription": "string (必須) - 編集された文字起こしテキスト"
}
```

**レスポンス**:

| ステータス                 | 説明                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `200 OK`                   | 再要約成功                                                 |
| `400 Bad Request`          | バリデーションエラー                                       |
| `401 Unauthorized`         | 認証失敗                                                   |
| `404 Not Found`            | メモが見つからない（存在しない、削除済み、または権限なし） |
| `422 Unprocessable Entity` | 処理エラー（整形失敗など）                                 |

```json
{
  "memoId": "UUID",
  "title": "string | null",
  "content": "string | null",
  "tags": ["string"],
  "transcriptionText": "string | null",
  "transcriptionStatus": "COMPLETED | FAILED | PENDING",
  "formattingStatus": "COMPLETED | FAILED | PENDING",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

## フォルダー API (`/api/folders`)

### GET `/api/folders` - フォルダー一覧取得

認証ユーザーのフォルダー一覧をパス情報付きで取得します。

**認証**: 必須（JWT Bearer トークン）

**レスポンス**:

| ステータス         | 説明       |
| ------------------ | ---------- |
| `200 OK`           | 取得成功   |
| `401 Unauthorized` | 認証エラー |

```json
{
  "folders": [
    {
      "id": "UUID",
      "name": "string",
      "parentId": "UUID | null",
      "path": "string"
    }
  ]
}
```

---

### POST `/api/folders` - フォルダー作成

新しいフォルダーを作成します。親フォルダーを指定して階層構造を作成可能。

**認証**: 必須（JWT Bearer トークン）

**リクエスト**:

```json
{
  "name": "string (必須, 最大50文字)",
  "parentId": "UUID (任意) - 親フォルダー ID"
}
```

**レスポンス**:

| ステータス         | 説明                         |
| ------------------ | ---------------------------- |
| `201 Created`      | 作成成功                     |
| `401 Unauthorized` | 認証エラー                   |
| `404 Not Found`    | 親フォルダーが見つからない   |
| `409 Conflict`     | 同名フォルダーが既に存在する |

```json
{
  "id": "UUID",
  "name": "string",
  "parentId": "UUID | null",
  "path": "string"
}
```

---

### PATCH `/api/folders/{id}` - フォルダー更新

フォルダーのリネームまたは移動を行います。両方同時に指定可能。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明          |
| ---------- | ---- | :--: | ------------- |
| `id`       | UUID |  ○   | フォルダー ID |

**リクエスト**:

```json
{
  "name": "string (任意, 最大50文字)",
  "parentId": "UUID (任意) - 新しい親フォルダー ID",
  "moveToRoot": "boolean (必須) - ルートに移動する場合 true"
}
```

**レスポンス**:

| ステータス         | 説明                                              |
| ------------------ | ------------------------------------------------- |
| `200 OK`           | 更新成功                                          |
| `401 Unauthorized` | 認証エラー                                        |
| `404 Not Found`    | フォルダーが見つからない                          |
| `409 Conflict`     | 同名フォルダーが既に存在する / 循環参照が発生する |

```json
{
  "id": "UUID",
  "name": "string",
  "parentId": "UUID | null",
  "path": "string"
}
```

---

### DELETE `/api/folders/{id}` - フォルダー削除

フォルダーを削除します。子フォルダーまたはメモが存在する場合は削除できません。

**認証**: 必須（JWT Bearer トークン）

**パスパラメータ**:

| パラメータ | 型   | 必須 | 説明          |
| ---------- | ---- | :--: | ------------- |
| `id`       | UUID |  ○   | フォルダー ID |

**レスポンス**:

| ステータス         | 説明                                             |
| ------------------ | ------------------------------------------------ |
| `204 No Content`   | 削除成功                                         |
| `401 Unauthorized` | 認証エラー                                       |
| `404 Not Found`    | フォルダーが見つからない                         |
| `409 Conflict`     | 子フォルダーまたはメモが存在するため削除できない |

---

## タグ API (`/api/tags`)

### GET `/api/tags` - タグ一覧取得

認証ユーザーが使用している全タグを取得します。ソート順と件数制限が指定可能。

**認証**: 必須（JWT Bearer トークン）

**クエリパラメータ**:

| パラメータ | 型      | 必須 | デフォルト | 説明                                                    |
| ---------- | ------- | :--: | :--------: | ------------------------------------------------------- |
| `sort`     | string  |  ×   |   `name`   | ソート項目（`name`: 名前順, `usage_count`: 使用回数順） |
| `order`    | string  |  ×   |   `asc`    | ソート順序（`asc`, `desc`）                             |
| `limit`    | integer |  ×   |     -      | 取得件数制限                                            |

**使用例**:

- 人気タグを取得: `GET /api/tags?sort=usage_count&order=desc&limit=10`

**レスポンス**:

| ステータス         | 説明       |
| ------------------ | ---------- |
| `200 OK`           | 取得成功   |
| `401 Unauthorized` | 認証エラー |

```json
{
  "tags": ["開発", "コード", "ミーティング"]
}
```

---

## 開発用 API (`/api/dev`)

> [!CAUTION]
> これらの API は **開発環境（dev）でのみ有効**です。本番環境では使用できません。

### POST `/api/dev/token` - 開発用トークン取得

指定したメールアドレスのユーザーのアクセストークンを取得します。OAuth不要で、Swagger UIからすぐにAPIテストができます。

**認証**: 不要

**クエリパラメータ**:

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | :--: | ------------------------ |
| `email`    | string |  ○   | ユーザーのメールアドレス |

**レスポンス**:

| ステータス      | 説明                   |
| --------------- | ---------------------- |
| `200 OK`        | トークン取得成功       |
| `404 Not Found` | ユーザーが見つからない |

```json
{
  "accessToken": "string - アクセストークン（JWT）",
  "userId": "string - ユーザーID",
  "email": "string - メールアドレス",
  "message": "string - 使い方の説明"
}
```

---

### POST `/api/dev/seed` - テストデータ作成

認証ユーザー用にテスト用のフォルダーとメモを作成します。データは `seed-data.yml` から読み込まれます。冪等性を持ち、既にフォルダーが存在する場合はスキップします。

**認証**: 必須（JWT Bearer トークン）

**レスポンス**:

| ステータス         | 説明                       |
| ------------------ | -------------------------- |
| `200 OK`           | 作成成功（またはスキップ） |
| `401 Unauthorized` | 認証エラー                 |

```json
{
  "foldersCreated": 3,
  "memosCreated": 10,
  "skipped": false,
  "message": "string - 結果メッセージ"
}
```

---

## 共通仕様

### 認証方式

JWT (JSON Web Token) を使用。

| トークン種別         | 有効期限 |
| -------------------- | -------- |
| アクセストークン     | 1日      |
| リフレッシュトークン | 180日    |

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

| コード                  | 説明                   |
| ----------------------- | ---------------------- |
| `UNAUTHORIZED`          | 認証失敗               |
| `FORBIDDEN`             | アクセス権限なし       |
| `NOT_FOUND`             | リソースが見つからない |
| `BAD_REQUEST`           | リクエスト形式が不正   |
| `CONFLICT`              | リソースの競合         |
| `UNPROCESSABLE_ENTITY`  | 処理不能なエンティティ |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー     |

### OpenAPI ドキュメント

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API 仕様 (JSON)**: `http://localhost:8080/v3/api-docs`
