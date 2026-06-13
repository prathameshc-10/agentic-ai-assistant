# Agentic AI Assistant

A multi-agent AI assistant built with **FastAPI**, **LangGraph**, and **Google Gemini**. It automatically routes each user message to the right specialized agent — web search, code generation, document Q&A (RAG), or general chat — and remembers conversation history per session.

---

## Features

- **Smart routing** — LangGraph classifies each message and sends it to the right agent
- **Web search agent** — answers questions about current events using Tavily Search + Gemini
- **Code agent** — writes, debugs, and explains code
- **RAG agent** — answers questions from your own uploaded PDF/TXT documents using FAISS vector search
- **Chat agent** — general conversation with full memory of past messages
- **Persistent memory** — chat history stored per session in PostgreSQL
- **Simple web UI** — browser-based chat interface with document upload

---

## Architecture

```
Browser UI (chat interface)
       │
       ▼
   FastAPI (REST API)
       │
       ▼
  LangGraph Orchestrator
       │
   ┌───┼────────┬─────────┬─────────┐
   ▼   ▼        ▼         ▼         ▼
 Router → Chat   Code    Search    RAG
  Agent  Agent  Agent    Agent    Agent
       │
       ▼
  PostgreSQL (sessions & message history)
```

The **router node** uses Gemini (temperature = 0) to classify each incoming message into one of four categories — `chat`, `code`, `search`, or `rag` — and LangGraph routes execution to the matching agent node.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI |
| Orchestration | LangGraph |
| LLM | Google Gemini (`gemini-1.5-flash`) |
| Embeddings | Google `embedding-001` |
| Vector store | FAISS |
| Web search | Tavily API |
| Database | PostgreSQL (SQLAlchemy ORM) |
| Frontend | HTML, CSS, vanilla JavaScript |

---

## Project Structure

```
agentic-ai-assistant/
├── app/
│   ├── agents/
│   │   ├── chat_agent.py       # General chat with memory
│   │   ├── code_writer.py      # Code generation/explanation
│   │   ├── web_search.py       # Tavily web search + summarization
│   │   ├── rag_agent.py        # Document Q&A via FAISS
│   │   └── orchestrator.py     # LangGraph router + graph definition
│   ├── api/
│   │   └── routes.py           # /chat, /upload, /history endpoints
│   ├── db/
│   │   ├── database.py         # SQLAlchemy engine/session
│   │   └── models.py           # Session & Message models
│   └── main.py                 # FastAPI app entry point
├── static/
│   └── index.html              # Chat UI
├── uploads/                     # Uploaded documents (raw files)
├── vector_store/                # FAISS index (auto-generated)
├── .env                         # API keys & DB config (not committed)
└── requirements.txt
```

---

## Setup

### 1. Clone and create a virtual environment

```bash
git clone <your-repo-url>
cd agentic-ai-assistant
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/agenticdb
```

- Get a Gemini key from [aistudio.google.com](https://aistudio.google.com)
- Get a Tavily key from [tavily.com](https://tavily.com)

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE agenticdb;
```

Tables are created automatically on first run.

### 5. Run the server

```bash
uvicorn app.main:app --reload
```

Open **http://127.0.0.1:8000** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message, get a routed response |
| `POST` | `/api/upload` | Upload a `.pdf` or `.txt` document for RAG |
| `GET` | `/api/history/{session_id}` | Retrieve chat history for a session |

Interactive API docs available at **`/docs`** (Swagger UI).

### Example request

```json
POST /api/chat
{
  "session_id": null,
  "message": "Write a Python function to reverse a string"
}
```

```json
{
  "session_id": "a1b2c3d4-...",
  "reply": "Here's a Python function...",
  "agent_used": "code"
}
```

---

## How Document Upload (RAG) Works

1. Uploaded files are saved to `uploads/`
2. On each upload, all documents in `uploads/` are re-read, split into ~1000-character chunks, embedded via Gemini, and indexed into a FAISS vector store saved at `vector_store/`
3. When a message is classified as `rag`, the top 4 most relevant chunks are retrieved and passed to Gemini as context

**To remove a document:** delete it from `uploads/`, delete the `vector_store/` folder, and re-upload any documents you want to keep (this rebuilds the index from scratch).

---

## Known Limitations / Future Improvements

- No per-user document isolation — all uploaded documents are shared across sessions
- No delete endpoint for individual documents
- Vector store rebuilds from scratch on every upload (inefficient for large document sets)
- No authentication/authorization
- Single LLM provider (Gemini) — no fallback if API limits are hit

---

## License

MIT