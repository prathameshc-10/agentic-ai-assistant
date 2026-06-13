from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key = True, index = True)
    session_id = Column(String, unique = True, index = True)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key = True, index = True)
    session_id = Column(String, index = True)
    role = Column(String)   # "user" or "assistant"
    content = Column(Text)
    agent_used = Column(String)
    created_at = Column(DateTime(timezone = True), server_default = func.now())

