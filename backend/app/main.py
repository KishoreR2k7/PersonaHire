import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # ensure models are registered
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.job_matches import router as job_matches_router
from app.api.interviews import router as interviews_router
from app.api.roadmap import router as roadmap_router
from app.api.analytics import router as analytics_router
from app.api.diagnostics import router as diagnostics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("persona_hire")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables automatically on startup
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Database table initialization error: {e}")
    yield
    logger.info("Persona Hire API shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Persona Hire — AI-Powered Placement Preparation Portal Backend API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev across 5173 / Docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(resumes_router, prefix=api_v1_prefix)
app.include_router(job_matches_router, prefix=api_v1_prefix)
app.include_router(interviews_router, prefix=api_v1_prefix)
app.include_router(roadmap_router, prefix=api_v1_prefix)
app.include_router(analytics_router, prefix=api_v1_prefix)
app.include_router(diagnostics_router, prefix=api_v1_prefix)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "version": settings.VERSION
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again or check diagnostic logs."}
    )
