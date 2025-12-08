```mermaid
erDiagram
    USER {
        int id PK
        string username
        string email
        datetime created_at
    }

    MEMO {
        int id PK
        int user_id FK
        int classification_id FK
        string title "AI自動生成タイトル"
        string original_audio_path "音声ファイルパス"
        text original_transcription "Whisperによる文字起こし"
        text ai_processed_content "整形後のMarkdown"
        datetime created_at
        datetime updated_at
    }

    CLASSIFICATION {
        int id PK
        string name "アイデア/仕事/TODOなど"
    }

    KEYWORD {
        int id PK
        string name "AI生成キーワード"
        text embedding_vector "意味検索用ベクトル"
    }

    AI_PROCESS_LOG {
        int id PK
        int memo_id FK
        string process_step "文字起こし/整形/構造化"
        datetime process_time
        string status "Success/Failure"
    }
    
    USER ||--o{ MEMO : "記録する"
    CLASSIFICATION ||--o{ MEMO : "分類される"
    MEMO }o--o{ KEYWORD : "持つ"
    MEMO ||--o{ AI_PROCESS_LOG : "処理履歴を持つ"
```