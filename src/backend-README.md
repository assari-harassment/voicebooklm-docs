# voicebooklm-backend

AI ボイスメモアプリケーション（Kotlin Spring Boot Backend）

---

## 📘 Getting Started

### **1. 必須要件**

- **JDK 21**
- **Docker / Docker Compose**
- **PostgreSQL 16**（ローカルは Docker Compose を使用）

### **2. クイックスタート**

```sh
# JDK 21 のインストール確認
java -version

# PostgreSQL（Docker）の起動
docker compose up -d

# ビルド & 実行
./gradlew bootRun
```

詳細手順・エラー解決は **GETTING_STARTED.md** を参照。

---

## 🏗 技術スタック（Tech Stack）

### **Backend**

- Kotlin **2.0.21**
- Spring Boot **3.4.12**
- Gradle **8.5**（Kotlin DSL）
- JDK **21 (LTS)**
- PostgreSQL **16**
- Docker Compose（開発環境）
- Testcontainers（テスト用 PostgreSQL）

### **Spring Boot Modules**

- Web（REST API）
- WebFlux（AI API 向け非同期処理）
- Data JPA
- Security
- Actuator
- DevTools

### **Authentication**

- JWT（io.jsonwebtoken:jjwt）

### **Kotlin**

- Coroutines
- Jackson

### **Testing**

- Spring Boot Test
- Spring Security Test
- MockK
- Coroutines Test
- Testcontainers (PostgreSQL)

---

## 📱 React Native 連携

### **Swagger / OpenAPI**

```text
http://localhost:8080/swagger-ui.html
```

### **TypeScript 型定義生成**

openapi-typescript:

```sh
npx openapi-typescript http://localhost:8080/v3/api-docs -o src/types/api.ts
```

openapi-generator:

```sh
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:8080/v3/api-docs \
  -g typescript-axios \
  -o src/api
```

### **CORS 設定**

- 開発環境
  - `localhost:*`
  - `192.168.*.*:*`（実機テスト）
- 本番環境
  - `https://*.example.com`（適宜変更）

---

## 🌏 アプリケーション設定

| 項目             | 値             |
| ---------------- | -------------- |
| ロケール         | 日本語 (ja_JP) |
| タイムゾーン     | Asia/Tokyo     |
| エンコーディング | UTF-8          |

---

## 🧪 テスト戦略（Testcontainers）

本プロジェクトでは **すべてのテストを PostgreSQL コンテナ上で実行**します。

### **Testcontainers 利点**

- 環境差異ゼロ（開発・テスト・本番すべて PostgreSQL）
- 完全一致の SQL / 型 / 制約
- 早期バグ検出

### **テスト実行方法**

```sh
# 全テスト
./gradlew test

# 特定クラスのみ
./gradlew test --tests VoiceBookLmBackendApplicationTests

# テストレポート
open build/reports/tests/test/index.html
```

### **テストクラス例（共通 Base）**

```kotlin
class UserRepositoryTest : AbstractIntegrationTest() {
    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun testSaveUser() {
        // PostgreSQL コンテナは自動起動される
    }
}
```

---

## 👥 チーム開発ガイドライン

- コーディング規約に準拠
- コントリビューションガイドラインを遵守
- Kotlin / Spring Boot のベストプラクティスを推奨
