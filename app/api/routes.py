from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session as DBSession
from app.db.database import get_db
from app.db.models import Session, Message
from app.agents.orchestrator import run_orchestrator
from pydantic import BaseModel
from app.agents.rag_agent import build_vector_store
import uuid, shutil, os

router = APIRouter()

# --- Request/Response shapes ---
class ChatRequest(BaseModel):
    session_id: str | None = None  # if None, we create a new session
    message: str

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    agent_used: str

class CreateSessionResponse(BaseModel):
    session_id: str

class SessionSummary(BaseModel):
    session_id: str
    title: str
    created_at: str | None
    updated_at: str | None
    message_count: int
    agent_counts: dict[str, int]

class DocumentSummary(BaseModel):
    name: str
    size: int
    status: str


def summarize_session(session: Session, db: DBSession) -> SessionSummary:
    messages = db.query(Message).filter(
        Message.session_id == session.session_id
    ).order_by(Message.created_at).all()

    first_user_message = next((m.content for m in messages if m.role == "user"), None)
    title = first_user_message[:48].strip() if first_user_message else "New chat"
    if first_user_message and len(first_user_message) > 48:
        title += "..."

    agent_counts = {"chat": 0, "code": 0, "search": 0, "rag": 0}
    for message in messages:
        if message.agent_used in agent_counts:
            agent_counts[message.agent_used] += 1

    updated_at = messages[-1].created_at if messages else session.created_at

    return SessionSummary(
        session_id=session.session_id,
        title=title,
        created_at=session.created_at.isoformat() if session.created_at else None,
        updated_at=updated_at.isoformat() if updated_at else None,
        message_count=len(messages),
        agent_counts=agent_counts,
    )


@router.post("/sessions", response_model=CreateSessionResponse)
def create_session(db: DBSession = Depends(get_db)):
    session_id = str(uuid.uuid4())
    db.add(Session(session_id=session_id))
    db.commit()
    return CreateSessionResponse(session_id=session_id)


@router.get("/sessions", response_model=list[SessionSummary])
def list_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).order_by(Session.created_at.desc()).all()
    summaries = [summarize_session(session, db) for session in sessions]
    return sorted(summaries, key=lambda item: item.updated_at or "", reverse=True)

# --- Chat endpoint ---
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: DBSession = Depends(get_db)):
    # Create session if new
    session_id = request.session_id or str(uuid.uuid4())
    if not db.query(Session).filter(Session.session_id == session_id).first():
        db.add(Session(session_id=session_id))
        db.commit()

    # Fetch chat history for memory
    history = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at).all()

    history_list = [{"role": m.role, "content": m.content} for m in history]

    # Run through orchestrator
    result = await run_orchestrator(request.message, history_list)

    # Save user message + assistant reply to DB
    db.add(Message(session_id=session_id, role="user",
                   content=request.message, agent_used="none"))
    db.add(Message(session_id=session_id, role="assistant",
                   content=result["reply"], agent_used=result["agent_used"]))
    db.commit()

    return ChatResponse(
        session_id=session_id,
        reply=result["reply"],
        agent_used=result["agent_used"]
    )


# --- Upload document for RAG ---
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required.")

    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in [".pdf", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    os.makedirs("uploads", exist_ok=True)
    safe_name = os.path.basename(file.filename)
    file_path = f"uploads/{safe_name}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Rebuild vector store to include the new document
    build_vector_store()

    return {"message": f"'{safe_name}' uploaded and indexed. You can now ask questions about it."}


@router.get("/documents", response_model=list[DocumentSummary])
def list_documents():
    if not os.path.isdir("uploads"):
        return []

    documents = []
    for filename in sorted(os.listdir("uploads")):
        path = os.path.join("uploads", filename)
        if os.path.isfile(path):
            documents.append(
                DocumentSummary(
                    name=filename,
                    size=os.path.getsize(path),
                    status="indexed",
                )
            )

    return documents

# --- Get chat history ---
@router.get("/history/{session_id}")
def get_history(session_id: str, db: DBSession = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at).all()
    return [{"role": m.role, "content": m.content, "agent": m.agent_used} for m in messages]
