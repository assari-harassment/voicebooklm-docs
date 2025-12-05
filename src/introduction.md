# このドキュメントはmdbookで作成されています。

## mdbook を始めるには

### 1. ビルドする

プロジェクトのルートディレクトリで以下のコマンドを実行すると、HTML形式のブックが `book` ディレクトリに生成されます。

```bash
mdbook build
```

### 2. ローカルでプレビューする

以下のコマンドを実行すると、ローカルWebサーバーが起動し、ブラウザでリアルタイムにブックをプレビューできます。ファイルを変更すると自動的にリロードされます。

```bash
mdbook serve
```

ブラウザで `http://localhost:3000` (または表示されたURL) にアクセスしてください。

### 3. 新しい章を追加する

新しい章を追加するには、`src` ディレクトリ内に新しいMarkdownファイル (`.md`) を作成します。

例えば、`src/new_chapter.md` を作成し、以下のような内容を記述します。

```markdown
# 新しい章のタイトル

ここに章の内容を記述します。
```

次に、`src/SUMMARY.md` ファイルを編集し、新しい章へのリンクを追加します。

```markdown
# Summary

- [Introduction](./introduction.md)
- [Voicememo activity](./Voicememo-activity.md)
- [Voicememo usecase](./voicememo-usecase.md)
- [新しい章](./new_chapter.md) # ここを追加
```
