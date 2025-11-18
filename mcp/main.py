from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quiz, chat


from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("📌 FASTAPI OPENAI KEY:", OPENAI_API_KEY)

app = FastAPI()

# ✅ CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sturoom.vercel.app",  # 배포 시 추가
        "https://sturoom.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록 (API prefix 포함)
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/api")
def root():
    return {
        "status": "MCP Python Server running",
        "routes": ["/api/quiz", "/api/chat"],
    }
