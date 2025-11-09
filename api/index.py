import sys
import os

# Vercel 환경에서 mcp 폴더 경로 추가
current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
mcp_dir = os.path.join(parent_dir, 'mcp')

# mcp를 Python 경로에 추가
if os.path.exists(mcp_dir):
    sys.path.insert(0, mcp_dir)

try:
    from main import app
    from mangum import Mangum
    
    # Vercel 서버리스 핸들러
    handler = Mangum(app, lifespan="off")
    
except Exception as e:
    # 디버깅용 에러 반환
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    debug_app = FastAPI()
    
    @debug_app.get("/")
    def root():
        return JSONResponse({
            "error": str(e),
            "mcp_dir": mcp_dir,
            "mcp_exists": os.path.exists(mcp_dir),
            "sys_path": sys.path[:5]
        }, status_code=500)
    
    from mangum import Mangum
    handler = Mangum(debug_app, lifespan="off")
