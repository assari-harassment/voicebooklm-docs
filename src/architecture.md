# アーキテクチャ

## システム全体像

```mermaid
graph TB
    subgraph Client["📱 モバイルアプリ"]
        RN["React Native + Expo"]
    end

    subgraph Backend["🖥️ バックエンド"]
        API["REST API<br/>Spring Boot"]
        DB[(PostgreSQL)]
    end

    subgraph External["🌐 外部サービス"]
        ASR["Google Cloud<br/>Speech-to-Text"]
        AI["AI サービス<br/>Claude/GPT"]
        OAuth["Google OAuth"]
    end

    RN -->|HTTPS| API
    API --> DB
    API --> ASR
    API --> AI
    RN --> OAuth
    API --> OAuth
```

## backend オニオンアーキテクチャ × DDD

バックエンドは**オニオンアーキテクチャ**と**ドメイン駆動設計(DDD)**を採用しています。

```mermaid
graph TB
    subgraph Presentation["🎨 Presentation Layer"]
        Controller["Controller<br/>REST API"]
    end

    subgraph UseCase["⚙️ UseCase Layer"]
        UC["UseCase<br/>ビジネスロジック"]
    end

    subgraph Domain["💎 Domain Layer"]
        Entity["Entity"]
        Repo["Repository<br/>Interface"]
    end

    subgraph Infrastructure["🔧 Infrastructure Layer"]
        JPA["JPA Repository<br/>実装"]
        Client["外部API<br/>クライアント"]
    end

    Controller --> UC
    UC --> Entity
    UC --> Repo
    JPA -.->|implements| Repo
    Client --> ASR["Speech-to-Text"]

    style Domain fill:#ffd,stroke:#333
```

### レイヤー責務

| レイヤー           | 責務                         | 依存               |
| ------------------ | ---------------------------- | ------------------ |
| **Domain**         | エンティティ・ビジネスルール | なし（純粋Kotlin） |
| **UseCase**        | アプリケーション固有ロジック | Domain のみ        |
| **Presentation**   | REST API・DTO変換            | UseCase のみ       |
| **Infrastructure** | DB実装・外部API              | Domain IF を実装   |

## 技術スタック

### Backend

| カテゴリ       | 技術               |
| -------------- | ------------------ |
| 言語           | Kotlin 2.0.21      |
| フレームワーク | Spring Boot 3.4.12 |
| ランタイム     | JDK 21 LTS         |
| データベース   | PostgreSQL 16      |
