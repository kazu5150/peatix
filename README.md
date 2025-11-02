# Peatix イベント検索ツール

Peatixのイベントをキーワードで検索するPythonスクリプトです。

## 機能

- キーワードでPeatixのイベントを検索
- 検索結果から以下の情報を取得:
  - イベントタイトル
  - 開催日時
  - 開催場所（オンライン/会場）
  - イベントURL

## セットアップ

### 1. 仮想環境の作成

```bash
uv venv
```

### 2. 必要なパッケージのインストール

```bash
uv pip install -r requirements.txt
```

### 3. Playwrightブラウザのインストール

```bash
source .venv/bin/activate && playwright install chromium
```

## 使い方

### 基本的な使い方

```bash
# 仮想環境を有効化
source .venv/bin/activate

# スクリプトを実行
python peatix_search.py "キーワード"
```

### 使用例

```bash
# 仮想環境を有効化
source .venv/bin/activate

# AIに関するイベントを検索
python peatix_search.py "AI"

# 音楽イベントを検索
python peatix_search.py "音楽"

# プログラミングイベントを検索
python peatix_search.py "プログラミング"
```

## 出力例

```
🔍 'AI' で検索中...

✅ 10件のイベントが見つかりました:

================================================================================

【1】【山﨑拓巳と学ぶ！】まだ言葉になってない"わたし"、ChatGPTと一緒に見つけてみよう！
📅 日時: 水曜日 22:00 (70 日間)
📍 場所: オンライン
🔗 URL: https://peatix.com/event/4576917
--------------------------------------------------------------------------------
```

## 注意事項

- このスクリプトは教育目的で作成されています
- Peatixの利用規約を遵守してご使用ください
- 過度なリクエストは避けてください
- スクレイピング時はウェブサイトに負荷をかけないよう注意してください

## 動作環境

- Python 3.8以上
- macOS / Linux / Windows

## ライセンス

MIT License
