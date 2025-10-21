"use client";
import { useEffect } from "react";

export default function HideFooterOnMount() {
  useEffect(() => {
    // Footer 숨김 상태로 전환
    document.body.setAttribute("data-hide-footer", "true");
    // 나갈 때 원복
    return () => {
      document.body.removeAttribute("data-hide-footer");
    };
  }, []);

  return null;
}
