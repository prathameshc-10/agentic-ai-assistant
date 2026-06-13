from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from tavily import TavilyClient
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

async def run_web_search_agent(message: str) -> str:
    # Step 1: Search the web
    search_results = tavily.search(query=message, max_results=5)

    # Step 2: Format results as context
    context = "\n\n".join([
        f"Source: {r['url']}\nContent: {r['content']}"
        for r in search_results.get("results", [])
    ])

    # Step 3: Ask Gemini to summarize/answer using this context
    messages = [
        SystemMessage(content=(
            "You are a research assistant. Use the search results below "
            "to answer the user's question accurately. Cite sources by URL "
            "where relevant. If the results don't contain the answer, say so."
        )),
        HumanMessage(content=f"Search results:\n{context}\n\nQuestion: {message}")
    ]

    response = await llm.ainvoke(messages)
    return response.content