from fastapi import APIRouter, Request, HTTPException
from openai import OpenAI
import os

router = APIRouter()

# OpenAI 클라이언트 초기화
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Warning: OPENAI_API_KEY not set")
    client = None
else:
    client = OpenAI(api_key=api_key)

@router.post("/")
async def chat(req: Request):
    """
    학습/퀴즈/자료 기반 도우미 챗봇
    """
    if not client:
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured"
        )
    
    try:
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
                        "사용자가 퀴즈 제작, 학습 요약, 질문 만들기 등을 물어보면 "
                        "핵심만 간결하게, 따뜻하게 대답해줘."
                    )
                },
                {"role": "user", "content": user_message},
            ],
        )

        reply = response.choices[0].message.content
        return {"reply": reply}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
