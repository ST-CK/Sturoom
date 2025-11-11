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

# ---------------- 초기 설정 ----------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not (OPENAI_API_KEY and SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY):
    raise RuntimeError("환경변수 누락: OPENAI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
router = APIRouter()
MAX_TOTAL_CHARS = 18000
KST = timezone(timedelta(hours=9))  # 🇰🇷 한국 시간대


# ---------------- 유틸 ----------------
def _safe_cut(text: str, limit: int) -> str:
    return (text or "").strip()[:limit]


async def _download_file(url: str) -> Tuple[str, bytes]:
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as http:
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
        texts = [shape.text for shape in slide.shapes if hasattr(shape, "text") and shape.text]
        slides.append("\n".join(texts))
    return "\n".join(slides)


def _build_prompt(all_text: str, mode: str) -> str:
    if mode == "ox":
        mode_desc = "OX 형식 문제 (정답은 O 또는 X)"
    elif mode == "short":
        mode_desc = "서술형 문제 (짧은 한 문장으로 답변)"
    elif mode == "multiple":
        mode_desc = "객관식 4지선다 문제"
    else:
        mode_desc = "객관식 4지선다, OX, 서술형을 섞은 혼합형 문제"

    return f"""
다음은 강의 자료의 통합 텍스트입니다.
이 내용을 바탕으로 학습 이해도를 평가할 수 있는 {mode_desc} 3문항을 만들어 주세요.

요구사항:
1. JSON 배열로만 출력
2. 각 문항은 question, choices(보기 리스트), answer(정답), explanation(해설)을 포함
3. 보기에는 'A.', 'B.' 같은 접두사를 붙이지 마세요.
4. 출력은 JSON 배열만 반환하세요.

-----
{_safe_cut(all_text, MAX_TOTAL_CHARS)}
-----
"""


# ---------------- Supabase 토큰 검증 함수 (핵심 수정) ----------------
def verify_supabase_token(token: str):
    """사용자 토큰을 Supabase REST API로 직접 검증 (apikey 헤더 추가)"""
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY,
    }
    res = requests.get(url, headers=headers)

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Supabase 인증 실패")

    return res.json()


# ---------------- 세션 & 실행(run) 생성 ----------------
@router.post("/session/start")
async def start_quiz_session(req: Request, authorization: str = Header(None)):
    """
    ✅ Safari/Vercel 호환 버전 — Authorization 헤더 기반 Supabase 인증 포함
    """
    data = await req.json()
    room_id = data.get("room_id")
    week_id = data.get("post_id")
    mode = data.get("mode", "mixed")

    # 1️⃣ Authorization 헤더 확인
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 없습니다.")
    token = authorization.split(" ")[1]

    # 2️⃣ Supabase REST API로 토큰 검증 (수정된 부분)
    try:
        user_data = verify_supabase_token(token)
        user_id = user_data["id"]
        print(f"🧩 인증된 사용자: {user_id}")
    except Exception as e:
        print("❌ Supabase 인증 실패:", e)
        raise HTTPException(status_code=401, detail="Supabase 인증 실패")

    # 3️⃣ 세션 / 런 생성
    try:
        existing = (
            supabase.table("quiz_sessions")
            .select("id")
            .eq("user_id", user_id)
            .eq("lecture_id", room_id)
            .eq("week_id", week_id)
            .limit(1)
            .execute()
        )

        if existing.data and len(existing.data) > 0:
            session_id = existing.data[0]["id"]
            print(f"♻️ 기존 세션 재사용: {session_id}")
        else:
            session = {
                "user_id": user_id,
                "lecture_id": room_id,
                "week_id": week_id,
                "mode": mode,
                "quiz_count": 0,
                "created_at": datetime.now(KST).isoformat(),
            }
            s_res = supabase.table("quiz_sessions").insert(session).execute()
            session_id = s_res.data[0]["id"]
            print(f"🆕 새 세션 생성: {session_id}")

        run = {
            "session_id": session_id,
            "user_id": user_id,
            "lecture_id": room_id,
            "week_id": week_id,
            "mode": mode,
            "started_at": datetime.now(KST).isoformat(),
        }
        r_res = supabase.table("quiz_runs").insert(run).execute()
        run_id = r_res.data[0]["id"]

        print(f"✅ 세션/런 준비 완료: session={session_id}, run={run_id}")
        return JSONResponse({"session_id": session_id, "run_id": run_id})

    except Exception as e:
        print("❌ 세션 생성 실패:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})


# ---------------- 퀴즈 생성 ----------------
@router.post("/from-url")
async def generate_quiz_from_url(req: Request):
    data = await req.json()
    file_urls = data.get("file_urls") or []
    mode = (data.get("mode") or "multiple").strip().lower()
    user_id = data.get("user_id")
    room_id = data.get("room_id")
    week_id = data.get("week_id")
    session_id = data.get("session_id")
    run_id = data.get("run_id")

    if not file_urls:
        return JSONResponse(status_code=400, content={"error": "파일 URL이 없습니다."})

    aggregated = []
    for file in file_urls:
        try:
            url = file.get("url") if isinstance(file, dict) else file
            fname, blob = await _download_file(url)
            text = _extract_text_from_pdf(blob) if fname.endswith(".pdf") else _extract_text_from_pptx(blob)
            aggregated.append(f"\n### {fname}\n{text}")
        except Exception as e:
            print(f"⚠️ 파일 처리 실패: {url} ({e})")

    all_text = "\n".join(aggregated)
    prompt = _build_prompt(all_text, mode)

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "너는 교육용 퀴즈를 JSON으로만 반환하는 AI 교사야."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        quiz_text = resp.choices[0].message.content
        json_str = quiz_text[quiz_text.find("["):quiz_text.rfind("]") + 1]
        quiz_data = json.loads(json_str)
    except Exception as e:
        print("❌ OpenAI 처리 실패:", e)
        return JSONResponse(status_code=500, content={"error": f"OpenAI 처리 실패: {str(e)}"})

    # ✅ Supabase 저장
    try:
        questions = []
        for q in quiz_data:
            answer = q.get("answer") or q.get("correct_answer") or ""
            explanation = q.get("explanation") or ""
            choices = q.get("choices") or q.get("options")
            cleaned_choices = []
            if isinstance(choices, list):
                for c in choices:
                    if isinstance(c, str):
                        c = c.replace("A. ", "").replace("B. ", "").replace("C. ", "").replace("D. ", "").strip()
                    cleaned_choices.append(c)

            questions.append({
                "session_id": session_id,
                "question": q.get("question", "").strip(),
                "choices": cleaned_choices,
                "answer": answer.strip(),
                "explanation": explanation.strip(),
            })

        inserted = supabase.table("quiz_questions").insert(questions).execute()

        # ✅ quiz_runs 업데이트
        supabase.table("quiz_runs").update({"quiz_count": len(inserted.data)}).eq("id", run_id).execute()
        # ✅ quiz_sessions 업데이트
        supabase.table("quiz_sessions").update({"quiz_count": len(inserted.data)}).eq("id", session_id).execute()

        # ✅ 첫 메시지 저장
        supabase.table("quiz_messages").insert({
            "session_id": session_id,
            "run_id": run_id,
            "user_id": user_id,
            "role": "ai",
            "kind": "quiz",
            "payload": json.dumps({"quiz": inserted.data}),
            "order_index": 1
        }).execute()

        return JSONResponse({
            "message": "퀴즈 생성 및 저장 완료",
            "session_id": session_id,
            "run_id": run_id,
            "quiz_count": len(inserted.data),
            "quiz": inserted.data
        })
    except Exception as e:
        print("❌ Supabase 저장 실패:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

