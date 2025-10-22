from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quiz, chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기능별 라우터 등록
app.include_router(quiz.router, prefix="/quiz")
app.include_router(chat.router, prefix="/chat")

@app.get("/")
def root():
    return {"status": "MCP Python Server running", "routes": ["/quiz", "/chat"]}
