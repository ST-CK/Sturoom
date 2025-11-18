from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import JSONResponse
import os, json, httpx, requests
from io import BytesIO
from datetime import datetime, timedelta, timezone
from typing import Tuple
from openai import OpenAI
from supabase import create_client
from PyPDF2 import PdfReader

# ----------------------------
# 🔥 초기 설정
# ----------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

def supabase():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

KST = timezone(timedelta(hours=9))
MAX_TOTAL_CHARS = 18000


# ----------------------------
# 🔥 Supabase 토큰 검증
# ----------------------------
def verify_token(token: str):
    if not token:
        raise HTTPException(status_code=401, detail="토큰 없음")
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {"Authorization": f"Bearer {token}", "apikey": SUPABASE_ANON_KEY}
    res = requests.get(url, headers=headers, timeout=10)
    if res.status_code == 200:
        return res.json()
    raise HTTPException(status_code=401, detail="Supabase 인증 실패")


# ----------------------------
# 🔥 유틸
# ----------------------------
async def download_file(url: str) -> Tuple[str, bytes]:
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as http:
        r = await http.get(url)
    if r.status_code != 200:
        raise RuntimeError(f"파일 다운로드 실패: {url}")
    return url.split("/")[-1].lower(), r.content


def extract_pdf(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    return "\n".join([page.extract_text() or "" for page in reader.pages])


def extract_pptx(content: bytes) -> str:
    from pptx import Presentation  # ⚠ Render import 에러 방지
    prs = Presentation(BytesIO(content))
    slides = []
    for slide in prs.slides:
        texts = [shape.text for shape in slide.shapes if hasattr(shape, "text") and shape.text]
        slides.append("\n".join(texts))
    return "\n".join(slides)


def safe_cut(text: str) -> str:
    return (text or "").strip()[:MAX_TOTAL_CHARS]


def build_prompt(text: str, mode: str):
    mode_map = {
        "multiple": "4지선다 객관식 문제",
        "ox": "OX 문제",
        "short": "서술형 문제",
        "mixed": "혼합형 문제",
    }
    return f"""
다음은 학습 자료입니다.
이 텍스트를 기반으로 {mode_map.get(mode, "혼합형 문제")} 3문제를 생성해 주세요.

조건:
1) JSON 배열 형태만 출력
2) 각 문항 = question, choices[], answer, explanation
3) choices 앞에 'A.' 'B.' 등 금지
4) JSON 외 텍스트 절대 금지

------
{text}
------
"""


# ----------------------------
# 🔥 세션 생성
# ----------------------------
@router.post("/session/start")
async def start_quiz_session(req: Request, authorization: str = Header(None)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 필요")

    token = authorization.split(" ")[1]
    user = verify_token(token)
    user_id = user["id"]

    body = await req.json()
    lecture = body.get("room_id")
    week = body.get("post_id")
    mode = body.get("mode", "mixed")

    db = supabase()

    s = db.table("quiz_sessions").insert({
        "user_id": user_id,
        "lecture_id": lecture,
        "week_id": week,
        "mode": mode,
        "quiz_count": 0,
        "created_at": datetime.now(KST).isoformat(),
    }).execute()

    session_id = s.data[0]["id"]

    r = db.table("quiz_runs").insert({
        "session_id": session_id,
        "user_id": user_id,
        "lecture_id": lecture,
        "week_id": week,
        "mode": mode,
        "started_at": datetime.now(KST).isoformat(),
    }).execute()

    return {"session_id": session_id, "run_id": r.data[0]["id"]}


# ----------------------------
# 🔥 기존 세션 재시작(run 생성)
# ----------------------------
@router.post("/run/start")
async def start_quiz_run(req: Request, authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "")
    user = verify_token(token)

    body = await req.json()
    session_id = body.get("session_id")

    db = supabase()

    s = db.table("quiz_sessions").select(
        "lecture_id, week_id, mode"
    ).eq("id", session_id).single().execute()

    session = s.data

    r = db.table("quiz_runs").insert({
        "session_id": session_id,
        "user_id": user["id"],
        "lecture_id": session["lecture_id"],
        "week_id": session["week_id"],
        "mode": session["mode"],
        "started_at": datetime.now(KST).isoformat(),
    }).execute()

    return {"session_id": session_id, "run_id": r.data[0]["id"]}


# ----------------------------
# 🔥 파일 → 퀴즈 생성
# ----------------------------
@router.post("/from-url")
async def generate_quiz_from_url(req: Request, authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "")
    verify_token(token)

    body = await req.json()
    file_urls = body.get("file_urls", [])
    mode = body.get("mode", "mixed")
    session_id = body.get("session_id")
    run_id = body.get("run_id")

    if not file_urls:
        return JSONResponse({"error": "file_urls 없음"}, status_code=400)

    texts = []
    for f in file_urls:
        url = f["url"] if isinstance(f, dict) else f
        fname, blob = await download_file(url)

        if fname.endswith(".pdf"):
            texts.append(extract_pdf(blob))
        else:
            texts.append(extract_pptx(blob))

    full_text = safe_cut("\n".join(texts))
    prompt = build_prompt(full_text, mode)

    # OpenAI 요청
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "JSON만 출력"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        raw = resp.choices[0].message.content.strip()
        json_text = raw[raw.find("["): raw.rfind("]") + 1]
        quiz_items = json.loads(json_text)
    except Exception as e:
        return JSONResponse({"error": f"OpenAI 오류: {e}"}, status_code=500)

    # Supabase 저장
    db = supabase()

    rows = [{
        "session_id": session_id,
        "question": q.get("question"),
        "choices": q.get("choices", []),
        "answer": q.get("answer"),
        "explanation": q.get("explanation"),
    } for q in quiz_items]

    inserted = db.table("quiz_questions").insert(rows).execute()
    count = len(inserted.data)

    db.table("quiz_runs").update({"quiz_count": count}).eq("id", run_id).execute()
    db.table("quiz_sessions").update({"quiz_count": count}).eq("id", session_id).execute()

    return {
        "message": "퀴즈 생성 완료",
        "quiz": inserted.data,
        "quiz_count": count,
        "session_id": session_id,
        "run_id": run_id,
    }


# ----------------------------
# 🔥 채점
# ----------------------------
@router.post("/attempt")
async def attempt(req: Request, authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "")
    verify_token(token)

    body = await req.json()
    question_id = body.get("question_id")
    user_answer = body.get("user_answer", "")

    db = supabase()

    q = db.table("quiz_questions").select(
        "answer, explanation"
    ).eq("id", question_id).single().execute()

    correct = q.data["answer"].strip()
    explanation = q.data["explanation"]

    return {
        "is_correct": user_answer.strip().lower() == correct.lower(),
        "correct_answer": correct,
        "explanation": explanation,
    }
