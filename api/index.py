import sys
import os

# mcp 폴더를 import 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mcp'))

from main import app

# Vercel이 인식하는 핸들러
handler = app
