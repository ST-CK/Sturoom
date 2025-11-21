from fastapi import APIRouter, HTTPException, Request
from datetime import date
from config import supabase

router = APIRouter()

@router.post("/log")
async def log_attendance(request: Request):
    body = await request.json()

    user_id = body.get("user_id")
    delta = body.get("seconds", 1)

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    today = date.today().isoformat()

    try:
        # 🔥 maybe_single() 제거하고 정상 동작하는 방식으로 변경
        existing_res = (
            supabase.table("attendance_logs")
            .select("seconds, session_count")
            .eq("user_id", user_id)
            .eq("date", today)
            .execute()
        )

        rows = existing_res.data or []
        existing = rows[0] if rows else None

        previous_seconds = existing.get("seconds", 0) if existing else 0
        previous_sessions = existing.get("session_count", 0) if existing else 0

        new_seconds = previous_seconds + delta

        # 세션 카운트: 오늘 첫 기록이면 +1
        new_session_count = previous_sessions
        if previous_seconds == 0:
            new_session_count += 1

        supabase.table("attendance_logs").upsert(
            {
                "user_id": user_id,
                "date": today,
                "seconds": new_seconds,
                "session_count": new_session_count,
            },
            on_conflict="user_id, date",
        ).execute()

        return {
            "success": True,
            "seconds": new_seconds,
            "session_count": new_session_count,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
