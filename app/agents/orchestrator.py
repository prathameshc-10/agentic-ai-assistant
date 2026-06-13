from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import TypedDict
import os
from dotenv import load_dotenv

from app.agents.chat_agent import run_chat_agent
from app.agents.code_writer import run_code_agent
from app.agents.web_search import run_web_search_agent
from app.agents.rag_agent import run_rag_agent

load_dotenv()

router_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

# --- 1. Define the shared state that flows through the graph ---
class GraphState(TypedDict):
    message: str
    history: list
    route: str
    reply: str

# --- 2. Router node: decides which agent should handle the message ---
async def router_node(state: GraphState) -> GraphState:
    classification_prompt = [
        SystemMessage(content=(
            "Classify the user's message into EXACTLY ONE category. "
            "Reply with ONLY the category word, nothing else.\n\n"
            "Categories:\n"
            "- 'code': user wants code written, debugged, or explained\n"
            "- 'search': user asks about current events, recent info, "
            "or anything requiring up-to-date web data\n"
            "- 'rag': user asks about content from uploaded documents/files "
            "(e.g. 'according to the document...', 'what does the file say about...')\n"
            "- 'chat': general conversation, questions, or anything else\n\n"
            "Reply with one word only: code, search, rag, or chat"
        )),
        HumanMessage(content=state["message"])
    ]

    response = await router_llm.ainvoke(classification_prompt)
    route = response.content.strip().lower()

    # Safety fallback — default to chat if classification is unexpected
    if route not in ["code", "search", "rag", "chat"]:
        route = "chat"

    state["route"] = route
    return state

# --- 3. Agent nodes ---
async def chat_node(state: GraphState) -> GraphState:
    state["reply"] = await run_chat_agent(state["message"], state["history"])
    return state

async def code_node(state: GraphState) -> GraphState:
    state["reply"] = await run_code_agent(state["message"])
    return state

async def search_node(state: GraphState) -> GraphState:
    state["reply"] = await run_web_search_agent(state["message"])
    return state

async def rag_node(state: GraphState) -> GraphState:
    state["reply"] = await run_rag_agent(state["message"])
    return state

# --- 4. Conditional edge function: tells LangGraph which node to go to next ---
def route_decision(state: GraphState) -> str:
    return state["route"]  # returns "code", "search", "rag", or "chat"

# --- 5. Build the graph ---
def build_graph():
    graph = StateGraph(GraphState)

    # Add nodes
    graph.add_node("router", router_node)
    graph.add_node("chat", chat_node)
    graph.add_node("code", code_node)
    graph.add_node("search", search_node)
    graph.add_node("rag", rag_node)

    # Entry point
    graph.set_entry_point("router")

    # Conditional routing: after "router", go to one of the 4 agent nodes
    graph.add_conditional_edges(
        "router",
        route_decision,
        {
            "chat": "chat",
            "code": "code",
            "search": "search",
            "rag": "rag",
        }
    )

    # All agent nodes end the graph after responding
    graph.add_edge("chat", END)
    graph.add_edge("code", END)
    graph.add_edge("search", END)
    graph.add_edge("rag", END)

    return graph.compile()

# Compile once at module load (reused across requests)
compiled_graph = build_graph()

# --- 6. Public function called by routes.py ---
async def run_orchestrator(message: str, history: list) -> dict:
    initial_state: GraphState = {
        "message": message,
        "history": history,
        "route": "",
        "reply": ""
    }

    final_state = await compiled_graph.ainvoke(initial_state)

    return {
        "reply": final_state["reply"],
        "agent_used": final_state["route"]
    }