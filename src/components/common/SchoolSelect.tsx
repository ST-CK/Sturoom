"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { name: string; kind: string; region: string };

export default function SchoolSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: { name: string; kind?: string }) => void;
}) {
  const [query, setQuery] = useState(value || "");
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounced = useMemo(() => {
    let id: any;
    return (fn: () => void) => {
      clearTimeout(id);
      id = setTimeout(fn, 250);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounced(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(query)}&limit=30`);
        const data = await res.json();
        setItems(data.items ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    });
  }, [query, debounced]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        placeholder="학교명을 입력하세요 (예: 한림초)"
        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border bg-white shadow">
          {loading && <div className="px-4 py-3 text-sm text-gray-500">검색 중…</div>}
          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">검색 결과 없음</div>
          )}
          {!loading &&
            items.map((it, idx) => (
              <button
                key={`${it.name}-${it.region}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // blur 방지
                  onChange({ name: it.name, kind: it.kind });
                  setQuery(it.name);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 px-4 py-2 text-left hover:bg-gray-50"
              >
                <span className="font-medium">{it.name}</span>
                <span className="text-xs text-gray-500">· {it.kind}{it.region ? ` · ${it.region}` : ""}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
