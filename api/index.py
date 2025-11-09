from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sturoom.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 상대 import
from .routes import chat, quiz

app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])

@app.get("/")
def root():
    return {
        "status": "MCP Python Server running", 
        "routes": ["/chat", "/quiz"]
    }

# ✅ Vercel 핸들러
handler = Mangum(app, lifespan="off")
