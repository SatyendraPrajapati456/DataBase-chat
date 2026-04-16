from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import connection, metadata, chat

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(connection.router)
app.include_router(metadata.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Chat with Your Data API"}
