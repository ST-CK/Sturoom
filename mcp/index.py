from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import sys
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes import
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from routes import chat, quiz

app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])

@app.get("/")
def root():
    return {
        "status": "MCP Python Server running", 
        "routes": ["/chat", "/quiz"]
    }

handler = Mangum(app, lifespan="off")
