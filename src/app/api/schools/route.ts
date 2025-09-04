import { NextResponse } from "next/server";

/**
 * Wikidata 기반 학교 자동완성 API
 * - 한국(Q884) 한정
 * - 초등(Q9842)·중(Q149566)·고(Q9826)·대(Q3918)
 * - WDQS(스팍클) 5xx 재시도 + REST(wbsearchentities) 폴백
 */

const UA = "KR-School-Finder/0.3 (localhost dev; contact@example.com)";

// 따옴표/역슬래시 이스케이프
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

// WDQS(SPARQL) 실행 유틸: 5xx 재시도 내장
async function runQuery(sparql: string) {
  for (let i = 0; i < 2; i++) {
    const res = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/sparql-query; charset=UTF-8",
        "User-Agent": UA,
      },
      body: sparql,
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      return json?.results?.bindings ?? [];
    }

    // 5xx면 짧게 재시도
    if (res.status >= 500) {
      await new Promise((r) => setTimeout(r, 300 + i * 400));
      continue;
    }

    // 4xx 등은 즉시 에러
    throw new Error(`WDQS ${res.status}`);
  }
  throw new Error("WDQS 5xx");
}

// mwapi 검색(SPARQL 내부) — 기본 경로
const buildSearchQuery = (term: string, lang: "ko" | "en", limit: number) => `
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX mwapi:   <https://www.mediawiki.org/ontology#API/>
PREFIX bd:      <http://www.bigdata.com/rdf#>
PREFIX wdt:     <http://www.wikidata.org/prop/direct/>
PREFIX wd:      <http://www.wikidata.org/entity/>

SELECT ?item ?itemLabel ?class ?classLabel ?regionLabel WHERE {
  SERVICE wikibase:mwapi {
    bd:serviceParam wikibase:endpoint "www.wikidata.org" .
    bd:serviceParam wikibase:api "Search" .
    bd:serviceParam mwapi:srsearch "${esc(term)}" .
    bd:serviceParam mwapi:srlimit "${Math.min(limit, 20)}" .
    bd:serviceParam mwapi:srnamespace "0" .
    bd:serviceParam mwapi:language "${lang}" .
    ?item wikibase:apiOutputItem mwapi:search .
  }
  VALUES ?baseClass { wd:Q9842 wd:Q149566 wd:Q9826 wd:Q3918 }
  ?item wdt:P31/wdt:P279* ?baseClass .
  ?item wdt:P17 wd:Q884 .
  OPTIONAL { ?item wdt:P131 ?region . }
  BIND(?baseClass AS ?class)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ko,en" . }
}
LIMIT ${Math.min(limit, 20)}
`;

// 폴백 1: REST wbsearchentities로 QID 목록 얻기
async function wbSearch(term: string, lang: "ko" | "en", limit: number): Promise<string[]> {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", term);
  url.searchParams.set("language", lang);
  url.searchParams.set("type", "item");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(Math.min(limit, 20)));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`wbsearch ${res.status}`);
  const json = await res.json();
  return (json?.search ?? []).map((s: any) => s.id).filter(Boolean); // ["Q123", ...]
}

// 폴백 2: QID 집합 중 한국의 학교만 필터링
const buildFilterQuery = (qids: string[]) => `
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wd:  <http://www.wikidata.org/entity/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>

SELECT ?item ?itemLabel ?class ?classLabel ?regionLabel WHERE {
  VALUES ?item { ${qids.map((id) => `wd:${id}`).join(" ")} }
  VALUES ?baseClass { wd:Q9842 wd:Q149566 wd:Q9826 wd:Q3918 }
  ?item wdt:P31/wdt:P279* ?baseClass .
  ?item wdt:P17 wd:Q884 .
  OPTIONAL { ?item wdt:P131 ?region . }
  BIND(?baseClass AS ?class)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ko,en" . }
}
LIMIT ${Math.min(qids.length, 50)}
`;

// kind 매핑
const KIND_MAP: Record<string, string> = {
  "http://www.wikidata.org/entity/Q9842": "초등학교",
  "http://www.wikidata.org/entity/Q149566": "중학교",
  "http://www.wikidata.org/entity/Q9826": "고등학교",
  "http://www.wikidata.org/entity/Q3918": "대학교",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") || "").trim();
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit") || "30"), 50));

  if (!qRaw) return NextResponse.json({ items: [] }, { status: 200 });

  // 검색어에 큰따옴표 등 특수문자 포함 시 SPARQL 안정성 위해 약간 정제
  const q = qRaw.replace(/\s+/g, " ").slice(0, 100);

  try {
    let rows: any[] = [];

    // 1차: 한글 mwapi 검색
    try {
      rows = await runQuery(buildSearchQuery(q, "ko", limit));
      // 2차: 없으면 영어
      if (!rows.length) rows = await runQuery(buildSearchQuery(q, "en", limit));
    } catch (_) {
      // WDQS 에러 → 폴백으로 진행
    }

    // 폴백: REST 검색 → QID 집합 → 필터 SPARQL
    if (!rows.length) {
      try {
        const idsKo = await wbSearch(q, "ko", limit);
        const ids = idsKo.length ? idsKo : await wbSearch(q, "en", limit);
        rows = ids.length ? await runQuery(buildFilterQuery(ids)) : [];
      } catch (_) {
        rows = [];
      }
    }

    const items = rows
      .map((r: any) => ({
        name: r.itemLabel?.value || "",
        kind: KIND_MAP[r.class?.value] || r.classLabel?.value || "학교",
        region: r.regionLabel?.value || "",
      }))
      .filter((x: any) => x.name)
      .reduce((acc: any[], cur: any) => {
        if (!acc.find(a => a.name === cur.name && a.kind === cur.kind && a.region === cur.region)) acc.push(cur);
        return acc;
      }, []);

    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    console.error("schools api fatal:", e);
    return NextResponse.json({ items: [], error: String(e) }, { status: 500 });
  }
}
