# Peatix AI イベント検索アプリケーション

Peatixのイベントをキーワードで検索し、興味のあるトピックを登録して定期的に通知を受け取れるフルスタックWebアプリケーションです。

## 機能

### イベント検索
- キーワードでPeatixのイベントをリアルタイム検索
- 検索結果から以下の情報を取得:
  - イベントタイトル
  - 開催日時
  - 開催場所（オンライン/会場）
  - イベントURL

### トピック管理
- 興味のあるキーワードをトピックとして登録
- トピックごとに通知頻度を設定（毎日/毎週/カスタム）
- トピックの有効/無効を切り替え可能
- トピックの作成・更新・削除（CRUD操作）

### AI推薦通知機能（基盤実装済み）
- データベース構造とAPIスキーマは実装済み
- 今後、OpenAI APIを使用したイベント推薦機能を追加予定

### UI/UX
- モダンでレスポンシブなデザイン（Next.js + Shadcn/ui）
- ダークモード対応
- ページ間のナビゲーション

## プロジェクト構造

```
peatix/
├── backend/                    # Python (FastAPI) バックエンド
│   ├── api.py                  # FastAPI アプリケーション（REST API）
│   ├── database.py             # SQLAlchemy モデル定義
│   ├── schemas.py              # Pydantic スキーマ定義
│   ├── peatix_search.py        # Peatixスクレイピング（Playwright）
│   ├── peatix_ai.db            # SQLite データベース（自動生成）
│   └── requirements.txt        # Python依存関係
└── frontend/                   # Next.js フロントエンド
    ├── app/                    # Next.js App Router
    │   ├── page.tsx            # イベント検索ページ
    │   └── topics/page.tsx     # トピック管理ページ
    ├── components/             # Reactコンポーネント
    │   ├── ui/                 # Shadcn/ui コンポーネント
    │   ├── navigation.tsx      # ナビゲーションバー
    │   └── event-card.tsx      # イベントカード
    ├── lib/                    # ユーティリティ
    └── package.json            # Node.js依存関係
```

### データベース構造

SQLiteデータベース（`peatix_ai.db`）には以下のテーブルがあります：

- **topics**: ユーザーが登録する興味トピック
  - `id`, `user_id`, `keyword`, `notification_frequency`, `is_active`, `created_at`, `updated_at`

- **recommendations**: AI推薦されたイベント（今後実装予定）
  - `id`, `topic_id`, `event_title`, `event_url`, `ai_score`, `ai_summary`, `ai_reason`, `created_at`

- **notifications**: 通知履歴（今後実装予定）
  - `id`, `topic_id`, `notification_type`, `sent_at`, `status`, `event_count`

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

#### APIエンドポイント

**イベント検索**
- `GET /api/search?keyword={keyword}` - キーワードでイベント検索

**トピック管理**
- `GET /api/topics` - トピック一覧を取得
- `POST /api/topics` - 新しいトピックを作成
- `PUT /api/topics/{id}` - トピックを更新
- `DELETE /api/topics/{id}` - トピックを削除

**その他**
- `GET /` - API情報
- `GET /health` - ヘルスチェック
- `GET /docs` - Swagger APIドキュメント (http://localhost:8000/docs)

### 2. フロントエンドを起動（別のターミナルで）

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

### 3. ブラウザでアクセス

アプリケーションには以下のページがあります：

- **イベント検索**: http://localhost:3000
  - キーワードでPeatixのイベントを検索

- **トピック管理**: http://localhost:3000/topics
  - 興味のあるトピックを登録・管理
  - 通知設定を変更

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
- **SQLAlchemy**: ORM（オブジェクトリレーショナルマッピング）
- **SQLite**: データベース（開発環境）
- **Pydantic**: データバリデーション
- **Playwright**: ブラウザ自動化（スクレイピング）
- **Uvicorn**: ASGIサーバー

### フロントエンド
- **Next.js 15**: Reactフレームワーク（App Router）
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストCSS
- **Shadcn/ui**: モダンなUIコンポーネントライブラリ
  - Button, Card, Input, Dialog, Select, Switch, Badge など
- **Lucide React**: アイコンライブラリ
- **Radix UI**: ヘッドレスUIプリミティブ（Shadcn/uiの基盤）

## 今後の実装予定

- [ ] OpenAI APIを使用したAIイベント推薦機能
- [ ] 定期的な自動検索とバッチ処理
- [ ] メール通知機能
- [ ] ユーザー認証機能
- [ ] 推薦イベントの詳細ページ
- [ ] イベントのお気に入り機能

## 注意事項

### スクレイピングについて
- このアプリケーションは教育目的で作成されています
- Peatixの利用規約を遵守してご使用ください
- 過度なリクエストは避けてください
- スクレイピング時はウェブサイトに負荷をかけないよう注意してください

### データベース
- SQLiteデータベース（`peatix_ai.db`）は初回起動時に自動作成されます
- データベースファイルは`.gitignore`に含まれているため、バージョン管理されません
- バックアップが必要な場合は手動でファイルをコピーしてください

## 動作環境

### 必須環境
- **Python**: 3.8以上（推奨: 3.13+）
- **Node.js**: 18以上
- **OS**: macOS / Linux / Windows

### 推奨環境
- **パッケージマネージャー**:
  - Python: [uv](https://github.com/astral-sh/uv)（高速なパッケージマネージャー）
  - Node.js: npm（Node.jsに同梱）

## スクリーンショット

### イベント検索ページ
キーワードでPeatixのイベントを検索し、リアルタイムで結果を表示します。

### トピック管理ページ
興味のあるトピックを登録・管理し、通知設定を変更できます。

## ライセンス

MIT License
