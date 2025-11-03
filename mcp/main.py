from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import quiz

app = FastAPI()

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(quiz.router, prefix="/quiz")

@app.get("/")
def root():
    return {"message": "AI Quiz Server is running!"}
