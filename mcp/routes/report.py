from fastapi import APIRouter, HTTPException, Query
from datetime import date, datetime, timedelta
from typing import Dict, Any, List
from openai import OpenAI

import os

from config import supabase

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ------------------------------------------------------------------
# 공통 유틸
# ------------------------------------------------------------------
def parse_ts(v):
    """Supabase timestamptz 문자열을 datetime으로 변환"""
    if isinstance(v, datetime):
        return v
    if not isinstance(v, str):
        return None
    try:
        if v.endswith("Z"):
            return datetime.fromisoformat(v.replace("Z", "+00:00"))
        return datetime.fromisoformat(v)
    except Exception:
        return None


# ------------------------------------------------------------------
# 1. email → uuid 변환
# ------------------------------------------------------------------
def resolve_user_id(user_id: str) -> str:
    import re

    uuid_regex = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
        r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    )

    if uuid_regex.match(user_id):
        return user_id

    resp = supabase.table("profiles").select("id").eq("email", user_id).execute()
    if len(resp.data) == 0:
        raise HTTPException(status_code=404, detail="해당 email을 가진 사용자가 없습니다.")
    return resp.data[0]["id"]


# ------------------------------------------------------------------
# 2. 사용자 프로필
# ------------------------------------------------------------------
def get_user_profile(user_uuid: str) -> Dict[str, Any]:
    resp = (
        supabase.table("profiles")
        .select("full_name, email")
        .eq("id", user_uuid)
        .execute()
    )

    if not resp.data:
        return {"id": user_uuid, "name": None, "email": None}

    row = resp.data[0]
    return {
        "id": user_uuid,
        "name": row.get("full_name"),
        "email": row.get("email"),
    }


# ------------------------------------------------------------------
# 3. 출석 요약
# ------------------------------------------------------------------
def get_attendance_summary(user_uuid: str) -> Dict[str, Any]:
    res = (
        supabase.table("attendance_logs")
        .select("date, seconds, session_count")
        .eq("user_id", user_uuid)
        .order("date", desc=False)
        .execute()
    )

    rows = res.data or []

    # =========================
    # ⭐ trend 계산: 최근 14일간 접속시간(분)
    # =========================
    today = date.today()
    last_14 = [today - timedelta(days=i) for i in range(13, -1, -1)]  # 오래된 → 최근

    # 로그 dict: {"2025-11-21": seconds, ...}
    log_map = {}
    for r in rows:
        d = r.get("date")
        if isinstance(d, str):
            d = date.fromisoformat(d)
        log_map[d] = (r.get("seconds") or 0)

    trend = []
    for d in last_14:
        sec = log_map.get(d, 0)
        trend.append(round(sec / 60))  # 분 단위

    # =========================
    # 기존 출석 통계 계산 (네 코드 유지)
    # =========================

    if not rows:
        return {
            "days": 0,
            "total_seconds": 0,
            "sessions": 0,
            "current_streak": 0,
            "best_streak": 0,
            "this_week_seconds": 0,
            "today_seconds": 0,
            "daily": [],
            "trend": trend,     # ⭐ 추가됨
        }

    total_seconds = 0
    total_sessions = 0
    dates = set()

    monday = today - timedelta(days=today.weekday())
    daily = []
    this_week_seconds = 0

    for r in rows:
        d = r.get("date")
        if isinstance(d, str):
            d = date.fromisoformat(d)

        seconds = r.get("seconds", 0)
        session_count = r.get("session_count", 0)

        total_seconds += seconds
        total_sessions += session_count
        dates.add(d)

        if d >= monday:
            this_week_seconds += seconds

        daily.append({
            "date": d.isoformat(),
            "seconds": seconds
        })

    today_seconds = next(
        (r.get("seconds", 0) for r in rows if str(r.get("date")) == today.isoformat()),
        0
    )

    # streak 계산
    sorted_dates = sorted(dates)
    best_streak = 0
    current = 0
    prev = None

    for d in sorted_dates:
        if prev is None or (d - prev).days == 1:
            current += 1
        else:
            current = 1
        best_streak = max(best_streak, current)
        prev = d

    current_streak = 0
    cursor = today
    while cursor in dates:
        current_streak += 1
        cursor -= timedelta(days=1)

    return {
        "days": len(dates),
        "total_seconds": total_seconds,
        "today_seconds": today_seconds,
        "sessions": total_sessions,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "this_week_seconds": this_week_seconds,
        "daily": daily,
        "trend": trend,     # ⭐ 여기!
    }



# ------------------------------------------------------------------
# 4. 퀴즈 요약
# ------------------------------------------------------------------
def calculate_run_stats(session_id: str) -> Dict[str, Any]:
    answers = (
        supabase.table("quiz_answers")
        .select("is_correct")
        .eq("session_id", session_id)
        .execute()
    )

    rows = answers.data or []
    if not rows:
        return {"total": 0, "correct": 0, "incorrect": 0, "score": 0}

    total = len(rows)
    correct = sum(1 for r in rows if r.get("is_correct") is True)
    incorrect = total - correct
    score = (correct / total) * 100

    return {
        "total": total,
        "correct": correct,
        "incorrect": incorrect,
        "score": score,
    }


def get_quiz_summary(user_uuid: str) -> Dict[str, Any]:
    runs_res = (
        supabase.table("quiz_runs")
        .select("id, session_id, started_at")
        .eq("user_id", user_uuid)
        .order("started_at", desc=False)
        .execute()
    )

    runs = runs_res.data or []
    if not runs:
        return {
            "total_runs": 0,
            "average_score": 0,
            "best_score": 0,
            "latest_score": 0,
            "total_questions": 0,
            "total_correct": 0,
            "total_incorrect": 0,
            "accuracy_overall": 0,
        }

    run_scores = []
    total_questions = 0
    total_correct = 0
    total_incorrect = 0

    for run in runs:
        stats = calculate_run_stats(run["session_id"])
        total_questions += stats["total"]
        total_correct += stats["correct"]
        total_incorrect += stats["incorrect"]
        run_scores.append(stats["score"])

    average_score = sum(run_scores) / len(run_scores)
    best_score = max(run_scores)
    latest_score = run_scores[0]

    accuracy = (total_correct / total_questions) * 100 if total_questions else 0

    return {
        "total_runs": len(run_scores),
        "average_score": round(average_score, 2),
        "best_score": round(best_score, 2),
        "latest_score": round(latest_score, 2),
        "total_questions": total_questions,
        "total_correct": total_correct,
        "total_incorrect": total_incorrect,
        "accuracy_overall": round(accuracy, 2),
    }


# ------------------------------------------------------------------
# 5. 최종 리포트 API
# ------------------------------------------------------------------
@router.get("/summary")
def get_summary(user_id: str = Query(...)):
    user_uuid = resolve_user_id(user_id)

    profile = get_user_profile(user_uuid)
    attendance = get_attendance_summary(user_uuid)
    quiz = get_quiz_summary(user_uuid)

    attendance_rate = min(attendance["days"] * 10, 100)

    quiz_summary_legacy = {
        "total_runs": quiz["total_runs"],
        "average_score": quiz["average_score"],
        "best_score": quiz["best_score"],
        "latest_score": quiz["latest_score"],
    }

    return {
        "user": profile,
        "attendance": attendance,
        "quiz": quiz,
        "attendance_count": attendance["days"],
        "attendance_rate": attendance_rate,
        "quiz_summary": quiz_summary_legacy,
    }

@router.post("/ai-summary")
def ai_summary(payload: dict):
    try:
        user_data = payload.get("summary")
        if not user_data:
            raise HTTPException(status_code=400, detail="summary 데이터가 필요합니다.")

        prompt = f"""
        다음은 학습자의 학습 리포트 데이터입니다:

        {user_data}

        아래 형식의 JSON을 생성하라:

        {{
          "overview": "학습 전체 요약 (2~3문장)",
          "strengths": ["강점1", "강점2", "강점3"],
          "weaknesses": ["개선점1", "개선점2", "개선점3"],
          "recommendation": "학습 방향 추천 (3~4문장)",
          "title": "한 줄 타이틀",
          "metrics": {{
              "focus_score": 0,
              "balance_score": 0,
              "readiness_score": 0
          }}
        }}

        조건:
        - 반드시 JSON만 출력
        - 설명, 주석, 백틱 등 금지
        """

        # 🔥 GPT 호출
        res = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "너는 JSON만 출력하는 AI 리포트 분석기다."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        # 🔥 응답 전체를 터미널에 그대로 출력
        print("\n================ GPT RAW RESPONSE ================")
        print(res)
        print("==================================================\n")

        # 🔥 본문 추출
        raw = res.choices[0].message.content

        print("=== RAW CONTENT ===")
        print(raw)
        print("===================\n")

        if not raw or raw.strip() == "":
            print("🔥 GPT content is EMPTY")
            raise ValueError("GPT 응답이 비어 있음")

        import re, json
        json_match = re.search(r"\{[\s\S]*\}", raw)
        if not json_match:
            print("🔥 JSON 매칭 실패! GPT RAW TEXT ↓↓↓")
            print(raw)
            raise ValueError("JSON 블록을 찾지 못함")

        json_str = json_match.group(0)
        result = json.loads(json_str)

        return {"ai_report": result}

    except Exception as e:
        print("🔥 AI SUMMARY ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
