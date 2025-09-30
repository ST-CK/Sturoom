import { Band, HeatDot, Metrics } from "./types";
import { dateAdd } from "./utils";

const DAYS = 20 * 7;
const today = new Date();

// 간단 시드 랜덤
let seed = 42;
const rnd = () => { seed^=seed<<13; seed^=seed>>17; seed^=seed<<5; return Math.abs(seed)/0x7fffffff; };

// 잔디 데이터(최근 20주)
export const heatmapData: HeatDot[] = Array.from({ length: DAYS }, (_, i) => {
  const date = dateAdd(today, -DAYS + i + 1);
  const visited = rnd() > 0.18;
  const value = visited ? Math.floor(rnd() * 4) + 1 : 0; // 0~4 강도
  return { date, visited, value };
});

export const aiBands: Band[] = [
  { label: "이해력/사실요약", level: "매우 우수", value: 92 },
  { label: "토픽이해", level: "우수", value: 84 },
  { label: "정보 탐색", level: "보통", value: 66 },
  { label: "요약하기", level: "다소 미흡", value: 54 },
  { label: "추론/연계", level: "미흡", value: 38 },
  { label: "정서 표현", level: "보통", value: 62 },
];

export const metrics: Metrics = {
  presence: { todayMin: 38, avg7Min: 42, weekMin: 285, trend: [25,40,38,42,30,45,48] },
  study:    { totalH: 16, totalM: 8, avgPerSessionMin: 23, sessions: 41, trend: [12,18,20,17,22,24,26] },
  volume:   { problems: 850, videosMin: 968, weekDiffProblems: 36, weekDiffVideos: 120 },
  accuracy: { rate: 0.70, diff: -0.08 },
};
