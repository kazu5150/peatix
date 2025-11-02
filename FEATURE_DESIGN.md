# AI推薦通知機能 設計書

## 概要

ユーザーが興味のあるトピックを登録し、OpenAI APIを活用してパーソナライズされたイベント推薦と定期通知を行う機能。

## 機能要件

### 1. トピック管理
- ユーザーが複数のトピック（興味のあるキーワード）を登録・管理
- CRUD操作（作成・読取・更新・削除）
- 各トピックに通知頻度を設定（毎日、毎週、カスタム）

### 2. AI推薦エンジン
- OpenAI GPT-4を使用してイベントをパーソナライズ分析
- ユーザーの興味に基づいてイベントをスコアリング
- 関連性の高いイベントを優先的に推薦
- イベントの要約と推薦理由を生成

### 3. 定期実行システム
- バックグラウンドタスクで定期的にイベント検索
- スケジューラー（APScheduler）を使用
- 各ユーザーのトピック設定に基づいて実行

### 4. 通知機能
- メール通知（開発初期）
- ブラウザプッシュ通知（将来）
- 通知履歴の保存

## 技術スタック

### バックエンド追加
- **SQLAlchemy**: ORMとデータベース管理
- **SQLite**: 開発環境用データベース（本番はPostgreSQL推奨）
- **OpenAI Python SDK**: GPT-4 API連携
- **APScheduler**: 定期実行タスク
- **python-dotenv**: 環境変数管理

### フロントエンド追加
- トピック管理ページ（/topics）
- 推薦イベント表示ページ（/recommendations）
- 通知設定画面

## データベース設計

### テーブル: topics
```sql
CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- 将来の認証対応
    keyword TEXT NOT NULL,
    notification_frequency TEXT DEFAULT 'weekly',  -- daily, weekly, custom
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### テーブル: recommendations
```sql
CREATE TABLE recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    event_title TEXT NOT NULL,
    event_url TEXT NOT NULL,
    event_datetime TEXT,
    event_location TEXT,
    ai_score REAL,  -- 0.0 ~ 1.0
    ai_summary TEXT,
    ai_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

### テーブル: notifications
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    notification_type TEXT DEFAULT 'email',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',  -- sent, failed
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

## API エンドポイント設計

### トピック管理
- `GET /api/topics` - トピック一覧取得
- `POST /api/topics` - トピック作成
- `PUT /api/topics/{id}` - トピック更新
- `DELETE /api/topics/{id}` - トピック削除

### AI推薦
- `GET /api/recommendations` - 推薦イベント一覧
- `GET /api/recommendations/topic/{topic_id}` - 特定トピックの推薦
- `POST /api/recommendations/generate` - AI推薦を手動実行

### 通知
- `GET /api/notifications/history` - 通知履歴
- `POST /api/notifications/test` - テスト通知送信

## AI推薦ロジック

### Phase 1: イベント収集
1. 登録されたトピックでPeatix検索
2. 検索結果を取得（最大20件）

### Phase 2: AI分析
```python
prompt = f"""
以下のイベント情報を分析し、ユーザーの興味「{topic.keyword}」に
どれだけ関連しているかスコア（0.0〜1.0）をつけてください。

イベント:
- タイトル: {event.title}
- 日時: {event.datetime}
- 場所: {event.location}

回答形式:
{{
  "score": 0.85,
  "summary": "イベントの要約（50文字以内）",
  "reason": "推薦理由（100文字以内）"
}}
"""
```

### Phase 3: フィルタリングとランキング
- スコア0.6以上のイベントを推薦
- スコアの高い順に最大10件を通知

## 実装フェーズ

### Phase 1: 基盤実装（優先）
- [x] ブランチ作成
- [ ] データベースモデル実装
- [ ] トピック管理API実装
- [ ] フロントエンドのトピック管理画面

### Phase 2: AI機能（核心）
- [ ] OpenAI API統合
- [ ] AI推薦エンジン実装
- [ ] 推薦結果の保存とAPI

### Phase 3: 通知システム
- [ ] APScheduler統合
- [ ] 定期実行ロジック
- [ ] メール通知（SMTP）

### Phase 4: UI/UX改善
- [ ] 推薦イベント表示画面
- [ ] 通知履歴画面
- [ ] ダッシュボード

## セキュリティ考慮事項

1. **API Key管理**
   - OpenAI API Keyは環境変数で管理
   - `.env`ファイルは`.gitignore`に含める

2. **レート制限**
   - OpenAI API呼び出し回数を制限
   - キャッシュを活用

3. **将来の認証**
   - 現在は簡易実装（user_id = "default"）
   - Phase 2で認証システム追加（JWT, OAuth2）

## コスト見積もり

### OpenAI API (GPT-4)
- 推定: 1イベント分析あたり約500トークン
- コスト: $0.03 / 1K tokens (input) + $0.06 / 1K tokens (output)
- 月間推定: 10トピック × 20イベント × 4回 = 800回分析
- 月額コスト: 約$36〜$72

### 代替案: GPT-3.5-Turbo
- コスト: $0.0005 / 1K tokens (input) + $0.0015 / 1K tokens (output)
- 月額コスト: 約$0.90〜$1.80（97%削減）

**推奨**: 開発初期はGPT-3.5-Turboを使用、品質確認後にGPT-4へ移行

## 開発環境設定

### 環境変数 (.env)
```
OPENAI_API_KEY=sk-...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
NOTIFICATION_EMAIL=notifications@example.com
```

## 今後の拡張案

1. **機械学習による改善**
   - ユーザーのクリック履歴から学習
   - 推薦精度の向上

2. **ソーシャル機能**
   - 友達の興味トピックを共有
   - グループ通知

3. **他プラットフォーム対応**
   - Connpass、Doorkeeper等への拡張
   - マルチソース集約

4. **モバイルアプリ**
   - React Native / Flutter
   - プッシュ通知対応
