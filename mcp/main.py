from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 기존 라우터
from routes import quiz, chat

# attendance 라우터
from routes.attendance import router as attendance_router

# report 라우터 (지금부터 만들 기능)
from routes.report import router as report_router

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sturoom.vercel.app",
        "https://sturoom.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기존 라우터
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# 출석 라우터 추가
app.include_router(attendance_router, prefix="/attendance", tags=["attendance"])

# 📌 리포트 라우터 추가 (⭐ 지금부터 이거 쓰는 거!)
app.include_router(report_router, prefix="/api/report", tags=["report"])


@app.get("/api")
def root():
    return {
        "status": "MCP Python Server running",
        "routes": [
            "/api/quiz",
            "/api/chat",
            "/attendance",
            "/api/report"
        ],
    }
