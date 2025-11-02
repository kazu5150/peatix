# Peatix イベント検索アプリケーション

Peatixのイベントをキーワードで検索できるフルスタックWebアプリケーションです。

## 機能

- キーワードでPeatixのイベントを検索
- 検索結果から以下の情報を取得:
  - イベントタイトル
  - 開催日時
  - 開催場所（オンライン/会場）
  - イベントURL
- モダンでレスポンシブなUI（Next.js + Shadcn/ui）

## プロジェクト構造

```
peatix/
├── backend/          # Python (FastAPI) バックエンド
│   ├── api.py        # FastAPI アプリケーション
│   ├── peatix_search.py  # Peatixスクレイピング
│   └── requirements.txt  # Python依存関係
└── frontend/         # Next.js フロントエンド
    ├── app/          # Next.js App Router
    ├── components/   # Reactコンポーネント
    └── package.json  # Node.js依存関係
```

## セットアップ

### バックエンド（Python + FastAPI）

```bash
cd backend

# 仮想環境の作成
uv venv

# 依存関係のインストール
uv pip install -r requirements.txt

# Playwrightブラウザのインストール
source .venv/bin/activate && playwright install chromium
```

### フロントエンド（Next.js）

```bash
cd frontend

# 依存関係のインストール
npm install
```

## 実行方法

アプリケーションを実行するには、バックエンドとフロントエンドの両方を起動する必要があります。

### 1. バックエンドAPIを起動

```bash
cd backend
source .venv/bin/activate
python api.py
```

APIは `http://localhost:8000` で起動します。

- API ドキュメント: http://localhost:8000/docs
- 検索エンドポイント: http://localhost:8000/api/search?keyword=AI

### 2. フロントエンドを起動（別のターミナルで）

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

### 3. ブラウザでアクセス

http://localhost:3000 を開いて、イベントを検索できます。

## 開発

### バックエンドのみを使用

CLI版のスクリプトを直接実行することもできます:

```bash
cd backend
source .venv/bin/activate
python peatix_search.py "キーワード"
```

### 使用例

```bash
# AIに関するイベントを検索
python peatix_search.py "AI"

# 音楽イベントを検索
python peatix_search.py "音楽"

# プログラミングイベントを検索
python peatix_search.py "プログラミング"
```

## 技術スタック

### バックエンド
- **Python 3.13+**
- **FastAPI**: 高速なWeb APIフレームワーク
- **Playwright**: ブラウザ自動化
- **Uvicorn**: ASGIサーバー

### フロントエンド
- **Next.js 15**: Reactフレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **Shadcn/ui**: モダンなUIコンポーネント
- **Lucide React**: アイコンライブラリ

## 注意事項

- このスクリプトは教育目的で作成されています
- Peatixの利用規約を遵守してご使用ください
- 過度なリクエストは避けてください
- スクレイピング時はウェブサイトに負荷をかけないよう注意してください

## 動作環境

- Python 3.8以上
- Node.js 18以上
- macOS / Linux / Windows

## ライセンス

MIT License
