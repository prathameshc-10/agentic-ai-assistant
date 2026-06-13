from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7
)

async def run_chat_agent(message: str, history: list) -> str:
    # Convert history into LangChain message format
    messages = [SystemMessage(content="You are a helpful, friendly AI assistant.")]

    for h in history:
        if h["role"] == "user":
            messages.append(HumanMessage(content=h["content"]))
        else:
            messages.append(AIMessage(content=h["content"]))

    messages.append(HumanMessage(content=message))

    response = await llm.ainvoke(messages)
    return response.content