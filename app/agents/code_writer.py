from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.2  # lower = more precise/deterministic for code
)

async def run_code_agent(message: str) -> str:
    messages = [
        SystemMessage(content=(
            "You are an expert software engineer. "
            "Write clean, correct, well-commented code. "
            "Explain your code briefly after writing it."
        )),
        HumanMessage(content=message)
    ]

    response = await llm.ainvoke(messages)
    return response.content