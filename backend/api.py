"""
Peatixイベント検索API (FastAPI)
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import asyncio
from peatix_search import search_peatix_events
from database import get_db, init_db, Topic
from schemas import (
    TopicCreate, TopicUpdate, TopicResponse,
    EventResponse, SearchResponse
)

app = FastAPI(title="Peatix Event Search API")

# データベース初期化
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時にデータベースを初期化"""
    init_db()
    print("✅ Database initialized")

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Peatix Event Search API",
        "version": "2.0.0",
        "endpoints": {
            "search": "/api/search?keyword={keyword}",
            "topics": {
                "list": "GET /api/topics",
                "create": "POST /api/topics",
                "update": "PUT /api/topics/{id}",
                "delete": "DELETE /api/topics/{id}"
            }
        }
    }


@app.get("/api/search", response_model=SearchResponse)
async def search_events(keyword: str):
    """
    イベントを検索するエンドポイント

    Args:
        keyword: 検索キーワード

    Returns:
        検索結果のイベントリスト
    """
    if not keyword or len(keyword.strip()) == 0:
        raise HTTPException(status_code=400, detail="キーワードを指定してください")

    try:
        # イベントを検索
        events = await search_peatix_events(keyword)

        return SearchResponse(
            keyword=keyword,
            count=len(events),
            events=[EventResponse(**event) for event in events]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"検索エラー: {str(e)}")


# トピック管理エンドポイント
@app.get("/api/topics", response_model=List[TopicResponse])
async def get_topics(db: Session = Depends(get_db)):
    """
    登録されているトピック一覧を取得

    Returns:
        トピックのリスト
    """
    topics = db.query(Topic).order_by(Topic.created_at.desc()).all()
    return topics


@app.post("/api/topics", response_model=TopicResponse, status_code=201)
async def create_topic(topic: TopicCreate, db: Session = Depends(get_db)):
    """
    新しいトピックを作成

    Args:
        topic: トピック作成データ

    Returns:
        作成されたトピック
    """
    # 重複チェック（同じキーワードが既に存在する場合）
    existing = db.query(Topic).filter(
        Topic.keyword == topic.keyword,
        Topic.user_id == "default"
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"キーワード '{topic.keyword}' は既に登録されています"
        )

    db_topic = Topic(
        user_id="default",  # 将来の認証対応時に変更
        **topic.model_dump()
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


@app.put("/api/topics/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: int,
    topic_update: TopicUpdate,
    db: Session = Depends(get_db)
):
    """
    トピックを更新

    Args:
        topic_id: トピックID
        topic_update: 更新データ

    Returns:
        更新されたトピック
    """
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()

    if not db_topic:
        raise HTTPException(status_code=404, detail="トピックが見つかりません")

    # 更新データを適用（Noneでない値のみ）
    update_data = topic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_topic, key, value)

    db.commit()
    db.refresh(db_topic)
    return db_topic


@app.delete("/api/topics/{topic_id}")
async def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    """
    トピックを削除

    Args:
        topic_id: トピックID

    Returns:
        削除成功メッセージ
    """
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()

    if not db_topic:
        raise HTTPException(status_code=404, detail="トピックが見つかりません")

    db.delete(db_topic)
    db.commit()

    return {
        "message": f"トピック '{db_topic.keyword}' を削除しました",
        "deleted_id": topic_id
    }


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
