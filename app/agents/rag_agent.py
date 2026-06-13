from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

VECTOR_STORE_PATH = "vector_store"

def build_vector_store():
    """Reads all files in /uploads, splits them, and builds a FAISS index."""
    docs = []
    upload_dir = "uploads"

    if not os.path.exists(upload_dir):
        return None

    for filename in os.listdir(upload_dir):
        path = os.path.join(upload_dir, filename)
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(path)
        elif filename.endswith(".txt"):
            loader = TextLoader(path)
        else:
            continue
        docs.extend(loader.load())

    if not docs:
        return None

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    # Build FAISS vector store and save it locally
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(VECTOR_STORE_PATH)
    return vector_store

def load_vector_store():
    if os.path.exists(VECTOR_STORE_PATH):
        return FAISS.load_local(
            VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True
        )
    return None

async def run_rag_agent(message: str) -> str:
    # Try loading existing vector store, else build it
    vector_store = load_vector_store()
    if vector_store is None:
        vector_store = build_vector_store()

    if vector_store is None:
        return "No documents have been uploaded yet. Please upload a document first."

    # Retrieve top 4 relevant chunks
    relevant_docs = vector_store.similarity_search(message, k=4)
    context = "\n\n".join([doc.page_content for doc in relevant_docs])

    messages = [
        SystemMessage(content=(
            "Answer the user's question using ONLY the context below. "
            "If the answer isn't in the context, say you don't have that information."
        )),
        HumanMessage(content=f"Context:\n{context}\n\nQuestion: {message}")
    ]

    response = await llm.ainvoke(messages)
    return response.content