import { rooms } from "./_data";
import RoomCard from "../../components/library/RoomCard";

export default function LibraryListPage() {
  return (
    <div className="mx-auto w-4/5 max-w-5xl py-8">
      <h1 className="mb-6 px-1 text-2xl font-bold tracking-tight">강의자료실</h1>

      <div className="grid grid-cols-1 gap-6 px-1 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <RoomCard
            key={r.id}
            id={r.id}
            title={r.title}
            instructor={r.instructor}
            track={r.track ?? "교과(오프라인)"}
            thumbnail={r.thumbnail ?? null}
            isNew={!!r.isNew}
          />
        ))}
      </div>
    </div>
  );
}
