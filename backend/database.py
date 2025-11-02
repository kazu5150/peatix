"""
データベース設定とモデル定義
"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# SQLiteデータベース設定
DATABASE_URL = "sqlite:///./peatix_ai.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite用の設定
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# データベースセッションを取得する依存関係
def get_db():
    """FastAPIの依存性注入用のデータベースセッション取得関数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Topic(Base):
    """ユーザーが登録する興味トピックモデル"""
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, default="default", nullable=False)  # 将来の認証対応
    keyword = Column(String, nullable=False)
    notification_frequency = Column(String, default="weekly")  # daily, weekly, custom
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーション
    recommendations = relationship("Recommendation", back_populates="topic", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="topic", cascade="all, delete-orphan")


class Recommendation(Base):
    """AI推薦されたイベントモデル"""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    event_title = Column(String, nullable=False)
    event_url = Column(String, nullable=False)
    event_datetime = Column(String)
    event_location = Column(String)
    ai_score = Column(Float)  # 0.0 ~ 1.0
    ai_summary = Column(Text)
    ai_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーション
    topic = relationship("Topic", back_populates="recommendations")


class Notification(Base):
    """通知履歴モデル"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    notification_type = Column(String, default="email")  # email, push
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="sent")  # sent, failed
    event_count = Column(Integer, default=0)  # 通知したイベント数

    # リレーション
    topic = relationship("Topic", back_populates="notifications")


# データベースとテーブルを初期化
def init_db():
    """データベースとテーブルを作成"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


if __name__ == "__main__":
    # スクリプトを直接実行した場合、テーブルを作成
    init_db()
