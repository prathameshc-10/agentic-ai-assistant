from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import router
from app.db.database import engine
from app.db import models
import os

# Create all DB tables automatically on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentic AI Assistant")

# API routes
app.include_router(router, prefix="/api")

# Serve the frontend UI
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_ui():
    return FileResponse("static/index.html")