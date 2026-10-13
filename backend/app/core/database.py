import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def init_engine():
    db_url = settings.DATABASE_URL
    try:
        connect_args = {}
        if "sqlite" in db_url:
            connect_args = {"check_same_thread": False}
        
        eng = create_engine(
            db_url,
            echo=False,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        logger.warning(f"Could not connect to {db_url}: {e}")
        if settings.USE_SQLITE_FALLBACK:
            logger.info("Using SQLite database persona_hire.db fallback")
            return create_engine(
                "sqlite:///./persona_hire.db",
                echo=False,
                connect_args={"check_same_thread": False}
            )
        raise

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
