from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import JSONResponse
import os, json, httpx, requests
from io import BytesIO
from datetime import datetime, timedelta, timezone
from typing import Tuple
from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
from pptx import Presentation
from supabase import create_client, Client
from pathlib import Path

# ---------------- 초기 설정 ----------------
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")   # 🔥 수정됨
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

# ⚠ Supabase Python SDK는 서버에서만 사용 → Service Role 유지
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

router = APIRouter()

MAX_TOTAL_CHARS = 18000
KST = timezone(timedelta(hours=9))


# ---------------- 유틸 ----------------
def _safe_cut(text: str, limit: int) -> str:
    return (text or "").strip()[:limit]


async def _download_file(url: str) -> Tuple[str, bytes]:
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as http:
        r = await http.get(url)
    if r.status_code != 200:
        raise RuntimeError(f"다운로드 실패({r.status_code})")
    return url.split("/")[-1].lower(), r.content


def _extract_text_from_pdf(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    return "\n".join([page.extract_text() or "" for page in reader.pages])


def _extract_text_from_pptx(content: bytes) -> str:
    prs = Presentation(BytesIO(content))
    slides = []
    for slide in prs.slides:
        texts = [s.text for s in slide.shapes if hasattr(s, "text") and s.text]
        slides.append("\n".join(texts))
    return "\n".join(slides)


def _build_prompt(all_text: str, mode: str) -> str:
    mode_map = {
        "ox": "OX 형식 문제",
        "short": "서술형 문제",
        "multiple": "4지선다 객관식 문제",
        "mixed": "객관식/OX/서술형 혼합 문제",
    }
    return f"""
다음은 강의 자료 내용입니다.
이 내용을 바탕으로 {mode_map.get(mode, "혼합형 퀴즈")} 3문항을 만들어 주세요.

조건:
1) JSON 배열만 출력
2) 각 문항: question, choices, answer, explanation
3) 보기 앞에 'A.' 'B.' 금지
4) JSON 외 텍스트 금지

------
{_safe_cut(all_text, MAX_TOTAL_CHARS)}
------
"""


# ---------------- Supabase 토큰 검증 ----------------
def verify_supabase_token(token: str):
    """🔥 SERVICE ROLE KEY → ANON KEY로 수정해야 auth 검증 가능"""
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,    # 🔥 핵심 수정
    }
    res = requests.get(url, headers=headers, timeout=10)
    if res.status_code == 200:
        return res.json()
    raise HTTPException(status_code=401, detail="Supabase 인증 실패")


# ---------------- 세션 생성 ----------------
@router.post("/session/start")
async def start_quiz_session(req: Request, authorization: str = Header(None)):
    """새 세션 + 첫 run 생성"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰 없음")
    
    token = authorization.split(" ")[1]
    user_data = verify_supabase_token(token)
    user_id = user_data["id"]

    body = await req.json()
    room_id = body.get("room_id")
    week_id = body.get("post_id")
    mode = body.get("mode", "mixed")

    s_res = supabase.table("quiz_sessions").insert({
        "user_id": user_id,
        "lecture_id": room_id,
        "week_id": week_id,
        "mode": mode,
        "quiz_count": 0,
        "created_at": datetime.now(KST).isoformat()
    }).execute()

    session_id = s_res.data[0]["id"]

    r_res = supabase.table("quiz_runs").insert({
        "session_id": session_id,
        "user_id": user_id,
        "lecture_id": room_id,
        "week_id": week_id,
        "mode": mode,
        "started_at": datetime.now(KST).isoformat()
    }).execute()

    return JSONResponse({
        "session_id": session_id,
        "run_id": r_res.data[0]["id"]
    })


# ---------------- 기존 세션 재도전 ----------------
@router.post("/run/start")
async def start_quiz_run(req: Request, authorization: str = Header(None)):
    """기존 세션에서 run만 새로 생성"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰 없음")

    token = authorization.split(" ")[1]
    user_data = verify_supabase_token(token)
    user_id = user_data["id"]

    body = await req.json()
    session_id = body.get("session_id")

    s_res = supabase.table("quiz_sessions").select(
        "lecture_id, week_id, mode"
    ).eq("id", session_id).limit(1).execute()

    session = s_res.data[0]
    lecture_id = session["lecture_id"]
    week_id = session["week_id"]
    mode = session["mode"]

    r_res = supabase.table("quiz_runs").insert({
        "session_id": session_id,
        "user_id": user_id,
        "lecture_id": lecture_id,
        "week_id": week_id,
        "mode": mode,
        "started_at": datetime.now(KST).isoformat()
    }).execute()

    return JSONResponse({
        "session_id": session_id,
        "run_id": r_res.data[0]["id"]
    })


# ---------------- 퀴즈 생성 (파일 → 퀴즈) ----------------
@router.post("/from-url")   # 🔥 POST로 고정 (PUT 제거)
async def generate_quiz_from_url(req: Request, authorization: str = Header(None)):
    """파일 다운로드 → 텍스트 추출 → OpenAI → Supabase 저장"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰 없음")

    token = authorization.split(" ")[1]
    user_data = verify_supabase_token(token)

    data = await req.json()
    file_urls = data.get("file_urls") or []
    mode = data.get("mode", "mixed")
    session_id = data.get("session_id")
    run_id = data.get("run_id")
    room_id = data.get("room_id")
    week_id = data.get("week_id")

    if not file_urls:
        return JSONResponse({"error": "file_urls 없음"}, status_code=400)

    aggregated = []
    for f in file_urls:
        url = f["url"] if isinstance(f, dict) else f
        fname, blob = await _download_file(url)

        text = (
            _extract_text_from_pdf(blob)
            if fname.endswith(".pdf")
            else _extract_text_from_pptx(blob)
        )
        aggregated.append(text)

    all_text = "\n".join(aggregated)
    prompt = _build_prompt(all_text, mode)

    # ---------------- OpenAI ----------------
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "JSON만 출력"},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2
        )
        raw = resp.choices[0].message.content.strip()
        json_text = raw[raw.find("["): raw.rfind("]") + 1]
        quiz_items = json.loads(json_text)
    except Exception as e:
        return JSONResponse({"error": f"OpenAI 오류: {e}"}, status_code=500)

    # ---------------- Supabase 저장 ----------------
    try:
        qs = []
        for q in quiz_items:
            qs.append({
                "session_id": session_id,
                "question": q.get("question"),
                "choices": q.get("choices") or [],      # 🔥 여기 수정됨
                "answer": q.get("answer"),
                "explanation": q.get("explanation"),
            })

        inserted = supabase.table("quiz_questions").insert(qs).execute()
        count = len(inserted.data)

        supabase.table("quiz_runs").update({
            "quiz_count": count
        }).eq("id", run_id).execute()

        supabase.table("quiz_sessions").update({
            "quiz_count": count
        }).eq("id", session_id).execute()

        return JSONResponse({
            "message": "퀴즈 생성 완료",
            "quiz": inserted.data,
            "quiz_count": count,
            "session_id": session_id,
            "run_id": run_id,
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# ---------------- 채점 ----------------
@router.post("/attempt")
async def attempt(req: Request, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰 없음")

    body = await req.json()

    question_id = body.get("question_id")
    user_answer = body.get("user_answer", "")

    q_res = supabase.table("quiz_questions").select(
        "answer, explanation"
    ).eq("id", question_id).limit(1).execute()

    correct = q_res.data[0]["answer"].strip()
    explanation = q_res.data[0]["explanation"]

    is_correct = user_answer.strip().lower() == correct.lower()

    return JSONResponse({
        "is_correct": is_correct,
        "correct_answer": correct,
        "explanation": explanation,
    })
