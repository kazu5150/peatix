"""
Pydanticスキーマ定義（APIリクエスト/レスポンス）
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# トピック関連スキーマ
class TopicBase(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=100, description="検索キーワード")
    notification_frequency: str = Field(default="weekly", pattern="^(daily|weekly|custom)$")
    is_active: bool = Field(default=True)


class TopicCreate(TopicBase):
    """トピック作成用スキーマ"""
    pass


class TopicUpdate(BaseModel):
    """トピック更新用スキーマ"""
    keyword: Optional[str] = Field(None, min_length=1, max_length=100)
    notification_frequency: Optional[str] = Field(None, pattern="^(daily|weekly|custom)$")
    is_active: Optional[bool] = None


class TopicResponse(TopicBase):
    """トピックレスポンススキーマ"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# 推薦関連スキーマ
class RecommendationBase(BaseModel):
    event_title: str
    event_url: str
    event_datetime: Optional[str] = None
    event_location: Optional[str] = None
    ai_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    ai_summary: Optional[str] = None
    ai_reason: Optional[str] = None


class RecommendationResponse(RecommendationBase):
    """推薦レスポンススキーマ"""
    id: int
    topic_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationWithTopic(RecommendationResponse):
    """トピック情報を含む推薦レスポンス"""
    topic: TopicResponse


# 通知関連スキーマ
class NotificationResponse(BaseModel):
    """通知レスポンススキーマ"""
    id: int
    topic_id: int
    notification_type: str
    sent_at: datetime
    status: str
    event_count: int

    class Config:
        from_attributes = True


# AI推薦生成リクエスト
class GenerateRecommendationsRequest(BaseModel):
    """AI推薦生成リクエスト"""
    topic_id: Optional[int] = Field(None, description="特定トピックのみ生成（Noneの場合は全トピック）")
    force: bool = Field(default=False, description="既存の推薦を削除して再生成")


# AI推薦生成レスポンス
class GenerateRecommendationsResponse(BaseModel):
    """AI推薦生成レスポンス"""
    success: bool
    topic_count: int
    recommendation_count: int
    message: str


# イベント情報（既存）
class EventResponse(BaseModel):
    title: str
    datetime: str
    location: str
    url: str


class SearchResponse(BaseModel):
    keyword: str
    count: int
    events: List[EventResponse]
