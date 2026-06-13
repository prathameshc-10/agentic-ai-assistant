from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session as DBSession
from app.db.database import get_db
from app.db.models import Session, Message
from app.agents.orchestrator import run_orchestrator
from pydantic import BaseModel
from app.agents.rag_agent import build_vector_store
import uuid, shutil, os

router  = APIRouter()

# --- Request/Response shapes ---
class ChatRequest(BaseModel):
    sesion_id: str | None = None # if None, a new session will be created
    message: str

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    agent_used: str

# --- Chat Endpoints ---
@router.post("/chat", response_model = ChatResponse)
async def chat(request: ChatRequest, db: DBSession = Depends(get_db)):
    # Create session if new
    session_id = request.session_id or str(uuid.uuid4())
    if not db.query(Session).filter(Session.session_id == session_id).first():
        db.add(session_id = session_id)
        db.commit()
    
    # Fetch conversation history
    history = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at).all()

    history_list = [{"role": m.role, "content": m.content} for m in history]

    # run through orchestrator
    result = await run_orchestrator(request.message, history_list)

    # Save user message and assistant reply to DB
    db.add(Message(session_id = session_id, role = "user",
                   content = request.message, agent_used = "none"))
    db.add(Message(session_id = session_id, role = "assistant",
                   content = result["reply"], agent_used = result["agent_used"]))
    db.commit()

    return ChatResponse(
        session_id = session_id,
        reply = result["reply"],
        agent_used = result["agent_used"]
    )


# --- Upload document for RAG ---
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Rebuild vector store to include the new document
    build_vector_store()

    return {"message": f"'{file.filename}' uploaded and indexed. You can now ask questions about it."}

# --- Get chat history ---
@router.get("/history/{session_id}")
def get_history(session_id: str, db: DBSession = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at).all()
    return [{"role": m.role, "content": m.content, "agent": m.agent_used} for m in messages]