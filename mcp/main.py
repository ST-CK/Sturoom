from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quiz, chat

app = FastAPI()

# ✅ CORS (Vercel 배포 주소 추가 예정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sturoom.vercel.app",  # ✅ 배포 후 실제 Vercel URL 추가
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # ✅ /api prefix로 변경 (Vercel에서 인식되도록)
# app.include_router(quiz.router, prefix="/api/quiz")
# app.include_router(chat.router, prefix="/api/chat")

# # ✅ 루트 엔드포인트도 /api로 이동
# @app.get("/api")
# def root():
#     return {"status": "MCP Python Server running", "routes": ["/api/quiz", "/api/chat"]}
# 라우터 등록


app.include_router(quiz.router, prefix="/quiz")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def root():
    return {"status": "MCP Python Server running", "routes": ["/quiz", "/chat"]}

