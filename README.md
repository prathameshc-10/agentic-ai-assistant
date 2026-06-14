# Agentic AI Assistant

A multi-agent AI assistant built with **FastAPI**, **LangGraph**, **Google Gemini**, and a modern **Next.js** frontend. It routes each message to the right specialized agent: general chat, code writing, web search, or document Q&A.

The app supports persistent chat sessions, recent chat history, document upload for RAG, dynamic session stats, and markdown/code rendering with copyable code blocks.

---

## Features

- **Smart routing**: LangGraph classifies each message as `chat`, `code`, `search`, or `rag`.
- **Chat agent**: General conversation with session memory.
- **Code agent**: Writes, explains, and debugs code.
- **Web search agent**: Uses Tavily Search plus Gemini for current information.
- **RAG agent**: Answers questions from uploaded PDF/TXT documents using FAISS.
- **Persistent sessions**: Chat sessions and messages are stored in PostgreSQL.
- **Recent chats**: Frontend lists backend sessions and loads old conversations.
- **New chat flow**: Clicking `New Chat` creates a fresh backend session.
- **Dynamic session info**: Per-agent usage stats update from session/message data.
- **Dynamic documents**: Uploaded documents are listed from the backend.
- **Modern frontend**: Next.js App Router UI with dark glassmorphism styling.
- **ChatGPT-style code output**: Markdown code fences render as copyable code blocks.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI |
| API docs | Swagger UI at `/docs` |
| Orchestration | LangGraph |
| LLM | Google Gemini (`gemini-2.5-flash` in the orchestrator) |
| Embeddings | Google `embedding-001` |
| Vector store | FAISS |
| Web search | Tavily API |
| Database | PostgreSQL with SQLAlchemy ORM |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |

---

## Architecture

```text
Next.js frontend
  |
  | /api/* proxy rewrites
  v
FastAPI REST API
  |
  v
LangGraph Orchestrator
  |
  +-- Router node
      |
      +-- Chat agent
      +-- Code agent
      +-- Search agent
      +-- RAG agent
  |
  +-- PostgreSQL session/message memory
  +-- uploads/ raw documents
  +-- vector_store/ FAISS index
```

The frontend calls `/api/...` routes. During local development, `frontend/next.config.ts` proxies those calls to `http://127.0.0.1:8000/api/...` by default.

You can override the backend URL with:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

---

## Project Structure

```text
agentic-ai-assistant/
|-- app/
|   |-- agents/
|   |   |-- chat_agent.py
|   |   |-- code_writer.py
|   |   |-- web_search.py
|   |   |-- rag_agent.py
|   |   `-- orchestrator.py
|   |-- api/
|   |   `-- routes.py
|   |-- db/
|   |   |-- database.py
|   |   `-- models.py
|   `-- main.py
|-- frontend/
|   |-- app/
|   |   |-- components/
|   |   |-- data/
|   |   |-- lib/
|   |   |   `-- api.ts
|   |   |-- types/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- next.config.ts
|   |-- package.json
|   `-- tsconfig.json
|-- static/
|   `-- index.html
|-- uploads/
|-- vector_store/
|-- model_list.py
|-- requirements.txt
`-- README.md
```

The old `static/index.html` is still present, but the current primary UI is the Next.js app in `frontend/`.

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd agentic-ai-assistant
python -m venv .venv
.venv\Scripts\activate
```

For macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Create `.env`

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/agenticdb
```

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE agenticdb;
```

Tables are created automatically when FastAPI starts.

### 5. Run FastAPI

```bash
uvicorn app.main:app --reload
```

Backend URLs:

- API root: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run the Next.js frontend

```bash
npm.cmd run dev
```

On macOS/Linux:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Make sure the FastAPI backend is also running on port `8000`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message and receive a routed agent response |
| `POST` | `/api/sessions` | Create a new chat session |
| `GET` | `/api/sessions` | List recent chat sessions with stats |
| `GET` | `/api/history/{session_id}` | Retrieve messages for one session |
| `POST` | `/api/upload` | Upload a `.pdf` or `.txt` document for RAG |
| `GET` | `/api/documents` | List uploaded documents |

### Create Session

```http
POST /api/sessions
```

```json
{
  "session_id": "a1b2c3d4-..."
}
```

### Send Chat Message

```json
POST /api/chat
{
  "session_id": "a1b2c3d4-...",
  "message": "Write Python code to add two numbers"
}
```

```json
{
  "session_id": "a1b2c3d4-...",
  "reply": "Here's the Python code...\n\n```python\nprint(1 + 2)\n```",
  "agent_used": "code"
}
```

### List Sessions

```http
GET /api/sessions
```

```json
[
  {
    "session_id": "a1b2c3d4-...",
    "title": "Write Python code to add two numbers",
    "created_at": "2026-06-14T12:00:00+00:00",
    "updated_at": "2026-06-14T12:01:10+00:00",
    "message_count": 2,
    "agent_counts": {
      "chat": 0,
      "code": 1,
      "search": 0,
      "rag": 0
    }
  }
]
```

### Upload Document

```http
POST /api/upload
Content-Type: multipart/form-data
```

Field:

```text
file=<PDF or TXT file>
```

Response:

```json
{
  "message": "'requirements.pdf' uploaded and indexed. You can now ask questions about it."
}
```

### List Documents

```http
GET /api/documents
```

```json
[
  {
    "name": "requirements.pdf",
    "size": 184320,
    "status": "indexed"
  }
]
```

---

## Frontend Behavior

### New Chat

Clicking `New Chat` calls `POST /api/sessions`, stores the new `session_id`, clears the visible messages, and starts a fresh conversation.

### Recent Chats

The sidebar calls `GET /api/sessions` and displays backend sessions sorted by latest activity. Selecting a session loads messages from `GET /api/history/{session_id}`.

### Session Info

The right panel uses backend session summaries and current messages to show:

- total agent activity
- Chat / Code / Search / RAG counts
- uploaded documents
- upload/indexing status

### Code Responses

Assistant replies can contain markdown fenced code blocks:

````markdown
```python
def add(a, b):
    return a + b
```
````

The frontend renders those blocks in a dark code panel with:

- language label
- line numbers
- horizontal scroll for long lines
- `Copy` button

---

## Validation Commands

Backend syntax check:

```bash
python -m py_compile app\api\routes.py
```

Frontend lint:

```bash
cd frontend
npm.cmd run lint
```

Frontend production build:

```bash
cd frontend
npm.cmd run build
```

---

## Document Upload and RAG

1. Uploaded `.pdf` and `.txt` files are saved to `uploads/`.
2. After each upload, the backend rebuilds the FAISS vector store from all uploaded documents.
3. The vector store is saved in `vector_store/`.
4. When a user asks a document-related question, the router selects `rag`.
5. The RAG agent retrieves relevant chunks and passes them to Gemini as context.

To remove a document manually:

1. Delete it from `uploads/`.
2. Delete `vector_store/`.
3. Re-upload the documents you still want indexed.

---

## Known Limitations

- No authentication or per-user authorization yet.
- Uploaded documents are shared globally, not isolated per user/session.
- There is no document delete API yet.
- The vector store rebuilds from scratch on every upload.
- Session titles are derived from the first user message.
- There is no streaming response support yet.
- Single LLM provider; no model fallback is implemented.

---

## License

MIT
