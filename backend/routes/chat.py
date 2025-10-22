from fastapi import APIRouter, Request
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter()

@router.post("/")
async def chat(req: Request):
    """
    서비스 전용 챗봇: 학습/퀴즈/자료 기반 도우미
    body: { "message": "AI 퀴즈 만드는 방법 알려줘" }
    """
    data = await req.json()
    user_message = data.get("message", "")

    if not user_message:
        return {"error": "message 필드가 비어 있습니다."}

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "너는 학습 도우미 챗봇이야. "
                    "사용자가 퀴즈 제작, 학습 내용 요약, 질문 만들기 등을 물어보면 "
                    "친절하게 도와줘. "
                    "불필요한 말 없이 핵심만 간결히, 그러나 따뜻하게 대답해."
                )
            },
            {"role": "user", "content": user_message},
        ],
    )

    reply = response.choices[0].message.content
    return {"reply": reply}
