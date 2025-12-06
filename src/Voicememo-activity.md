# ボイスメモ アクティビティ図

## メインフロー（録音〜保存）

```mermaid
flowchart TD
    Start((開始))
    Start --> Login[Google ログイン]
    Login --> Home[ホーム画面]
    Home --> Record[録音ボタンをタップ]
    Record --> Speaking[話す]
    Speaking --> Transcribe[リアルタイム文字起こし]
    Transcribe --> Stop[録音停止]
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
2. **録音ボタンをタップ** → WebSocket 接続確立
3. **話す** → 音声をリアルタイムでサーバーに送信
4. **リアルタイム文字起こし** → 話しながらテキスト表示
5. **録音停止** → 最終文字起こし確定
6. **AI 処理** → タイトル・本文・タグを自動生成
7. **クラウドに保存** → AI 整形済みメモのみ永続化

### メモ閲覧フロー
- **一覧表示**: 日付ソートでメモを表示
- **検索**: キーワードやタグで絞り込み
- **閲覧**: メモを選択して内容を確認
