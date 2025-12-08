# ボイスメモ アクティビティ図

## メインフロー（録音〜保存）

```mermaid
flowchart TD
    Start((開始))
    Start --> Login[Google ログイン]
    Login --> Home[ホーム画面]
    Home --> Record[録音ボタンをタップ]
    Record --> Speaking[話す]
    Speaking --> Stop[録音停止]
    Stop --> Upload[音声ファイル送信]
    Upload --> Transcribe[文字起こし]
    Stop --> AI[AI でタイトル・本文・タグ生成]
    AI --> Save[クラウドに保存]
    Save --> Done((完了))
```

## メモ閲覧フロー

```mermaid
flowchart TD
    Home((ホーム画面))
    Home --> List[メモ一覧を表示]
    Home --> Search[キーワード検索]
    Search --> List
    List --> Detail[メモを選択して閲覧]
```

## フローの説明

### 録音フロー
1. **Google ログイン** → JWT トークン取得
2. **録音ボタンをタップ** → 録音開始
3. **話す** → 音声を端末に一時保存
4. **録音停止** → 音声ファイル確定
5. **音声ファイル送信** → REST API 経由でサーバーに送信
6. **文字起こし** → ASR で一括テキスト化
6. **AI 処理** → タイトル・本文・タグを自動生成
7. **クラウドに保存** → AI 整形済みメモのみ永続化

### メモ閲覧フロー
- **一覧表示**: 日付ソートでメモを表示
- **検索**: キーワードやタグで絞り込み
- **閲覧**: メモを選択して内容を確認
