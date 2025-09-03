"use client";

import Login from "@/components/login/Login";

export default function ClientLogin() {
  return (
    <Login
      onSubmit={(id, pw, remember) => {
        console.log({ id, pw, remember });
        // TODO: 실제 로그인 처리
      }}
      onGoogle={() => console.log("google login")}
      onKakao={() => console.log("kakao login")}
      onNaver={() => console.log("naver login")}
    />
  );
}
