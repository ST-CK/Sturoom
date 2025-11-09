from fastapi import FastAPI
from mangum import Mangum
import traceback
import sys

app = FastAPI()

@app.get("/")
def read_root():
    try:
        return {
            "message": "Chat API GET is working",
            "python_version": sys.version,
            "sys_path": sys.path[:3]
        }
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.post("/")
async def create_chat():
    try:
        return {"message": "Chat API POST is working"}
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

handler = Mangum(app, lifespan="off")



# from fastapi import FastAPI, Request, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from mangum import Mangum
# from openai import OpenAI
# import os

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "https://sturoom.vercel.app",
#         "https://*.vercel.app",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# api_key = os.getenv("OPENAI_API_KEY")
# if not api_key:
#     print("Warning: OPENAI_API_KEY not set")
#     client = None
# else:
#     client = OpenAI(api_key=api_key)

# @app.post("/")
# async def chat(req: Request):
#     """
#     학습/퀴즈/자료 기반 도우미 챗봇
#     """
#     if not client:
#         raise HTTPException(
#             status_code=500, 
#             detail="OpenAI API key not configured"
#         )
    
#     try:
#         data = await req.json()
#         user_message = data.get("message", "")

#         if not user_message:
#             return {"error": "message 필드가 비어 있습니다."}

#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "너는 학습 도우미 챗봇이야. "
#                         "사용자가 퀴즈 제작, 학습 요약, 질문 만들기 등을 물어보면 "
#                         "핵심만 간결하게, 따뜻하게 대답해줘."
#                     )
#                 },
#                 {"role": "user", "content": user_message},
#             ],
#         )

#         reply = response.choices[0].message.content
#         return {"reply": reply}
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/")
# def chat_root():
#     return {"message": "Chat API", "method": "POST"}

# handler = Mangum(app, lifespan="off")
