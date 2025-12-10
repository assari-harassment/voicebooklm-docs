```mermaid
erDiagram
    USERS ||--o{ MEMOS : owns
    USERS ||--o{ REFRESH_TOKENS : has
    MEMOS ||--o{ MEMO_TAGS : contains

    USERS {
        uuid id PK
        string google_sub UK
        string email UK
        string name
        timestamptz created_at
        timestamptz updated_at
    }

    MEMOS {
        uuid id PK
        uuid user_id FK
        string transcription_status "PENDING / PROCESSING / COMPLETED / FAILED"
        string formatting_status "PENDING / PROCESSING / COMPLETED / FAILED"
        text transcription "nullable - 文字起こし（ユーザー編集可、AI整形のソース）"
        string title "nullable - AI整形後に設定"
        text content "nullable - AI整形後に設定"
        timestamptz created_at
        timestamptz updated_at
        boolean deleted
    }

    MEMO_TAGS {
        uuid memo_id FK
        string tag
    }

    REFRESH_TOKENS {
        uuid id PK
        string token UK
        uuid family_id
        uuid user_id FK
        string device_name
        string user_agent
        timestamptz expires_at
        timestamptz created_at
        boolean revoked
    }
    