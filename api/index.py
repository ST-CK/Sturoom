<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import sys
import os
import traceback

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

# 디버깅 정보 수집
debug_info = {
    "step": "initializing",
    "current_dir": os.path.dirname(os.path.abspath(__file__)),
    "parent_dir": os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
}

# 파일 구조 확인
try:
    current_dir = debug_info["current_dir"]
    debug_info["files_in_api"] = os.listdir(current_dir)
    
    routes_path = os.path.join(current_dir, "routes")
    if os.path.exists(routes_path):
        debug_info["routes_exists"] = True
        debug_info["files_in_routes"] = os.listdir(routes_path)
    else:
        debug_info["routes_exists"] = False
        
except Exception as e:
    debug_info["filesystem_error"] = str(e)

# 상대 import 시도
try:
    debug_info["step"] = "importing routes"
    from .routes import chat, quiz
    debug_info["import_status"] = "SUCCESS"
    
    # 라우터 등록
    app.include_router(chat.router, prefix="/chat", tags=["chat"])
    app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
    debug_info["routers_added"] = True
    
except ImportError as e:
    debug_info["import_error"] = str(e)
    debug_info["import_error_type"] = "ImportError"
    debug_info["import_traceback"] = traceback.format_exc()
    
    # import 실패 시 절대 import 시도
    try:
        debug_info["step"] = "trying absolute import"
        sys.path.insert(0, current_dir)
        from routes import chat, quiz
        
        app.include_router(chat.router, prefix="/chat", tags=["chat"])
        app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
        debug_info["absolute_import_status"] = "SUCCESS"
        debug_info["routers_added"] = True
        
    except Exception as e2:
        debug_info["absolute_import_error"] = str(e2)
        debug_info["absolute_import_traceback"] = traceback.format_exc()
        
except Exception as e:
    debug_info["unexpected_error"] = str(e)
    debug_info["unexpected_traceback"] = traceback.format_exc()

# 환경 변수 확인
debug_info["env_check"] = {
    "OPENAI_API_KEY": "SET" if os.getenv("OPENAI_API_KEY") else "NOT SET",
    "VERCEL": "SET" if os.getenv("VERCEL") else "NOT SET",
}

debug_info["python_version"] = sys.version
debug_info["sys_path_sample"] = sys.path[:3]

@app.get("/")
def root():
    if debug_info.get("routers_added"):
        return {
            "status": "MCP Python Server running", 
            "routes": ["/chat", "/quiz"],
            "debug_mode": True,
            "debug_info": debug_info
        }
    else:
        return {
            "status": "ERROR - Routers not loaded",
            "debug_info": debug_info
        }

@app.get("/debug")
def debug_endpoint():
    """상세 디버깅 정보"""
    return {
        "message": "Detailed debug information",
        "debug_info": debug_info
    }

# Vercel 핸들러
handler = Mangum(app, lifespan="off")
=======
import sys
import os

# mcp 폴더를 import 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mcp'))

from main import app

# Vercel이 인식하는 핸들러
handler = app
>>>>>>> 6421b70 (API 테스트)
