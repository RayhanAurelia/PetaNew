import { Plus } from "lucide-react";
import Link from "next/link";
import type { NutritionLogDTO } from "@/components/dashboard/nutrition/nutritionTypes";
import type { SubjectDTO } from "@/components/dashboard/subjects/subjectTypes";

// --- Recent Foods List ---
export function RecentFoodsCard({ logs }: { logs: NutritionLogDTO[] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Makanan Hari Ini
        </h3>
        <Link
          href="/log"
          className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3 w-3" /> Tambah
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-500">
          Belum ada catatan makanan hari ini.
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto">
          {logs.slice(0, 4).map((log) => (
            <div key={log.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <span className="text-lg">🍽️</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-slate-800">
                  {log.foodName || "Makanan Custom"}
                </p>
                <p className="text-xs text-slate-500">
                  Waktu:{" "}
                  {new Date(log.loggedAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Active Subjects Card ---
export function SubjectsCard({ subjects }: { subjects: SubjectDTO[] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E3C]/10 text-[#1B5E3C]">
              {sub.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-semibold text-slate-800">
                {sub.name}
              </p>
              <p className="text-xs text-slate-500">
                {sub.isPrimary ? "Subjek Utama" : "Anggota"}
              </p>
            </div>
            <div
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.isPrimary ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
            >
              {sub.isPrimary ? "Utama" : "Anggota"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
