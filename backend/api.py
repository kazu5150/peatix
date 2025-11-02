"""
Peatixイベント検索API (FastAPI)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import asyncio
from peatix_search import search_peatix_events

app = FastAPI(title="Peatix Event Search API")

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EventResponse(BaseModel):
    title: str
    datetime: str
    location: str
    url: str


class SearchResponse(BaseModel):
    keyword: str
    count: int
    events: List[EventResponse]


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "Peatix Event Search API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/api/search?keyword={keyword}"
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


@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
