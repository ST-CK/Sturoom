import sys
import os

# mcp 경로 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mcp'))

from main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
