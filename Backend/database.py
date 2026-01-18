"""
Database connection and session management
SQLAlchemy setup for PostgreSQL
"""

from sqlalchemy import create_engine
from sqlalchemy. orm import sessionmaker, scoped_session
from config import DATABASE_URL

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    future=True,
    pool_pre_ping=True,  # Verify connections before using
)

# Session factory
SessionLocal = scoped_session(
    sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        expire_on_commit=False,
    )
)


def get_db():
    """
    Dependency for FastAPI to get DB session
    Usage: db:  Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db. close()