"use client";

import {
  AlertTriangle,
  Beef,
  Droplet,
  ExternalLink,
  Flame,
  Loader,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type FoodDTO,
} from "./foodTypes";

interface FoodDetailModalProps {
  open: boolean;
  foodId: string | null;
  /** Data ringkas dari hasil search supaya bisa langsung tampil tanpa refetch. */
  preview?: FoodDTO | null;
  onClose: () => void;
}

interface ApiOk<T> {
  success: true;
  data: T;
}
interface ApiErr {
  success: false;
  error: { code: string; message: string };
}
type ApiResponse<T> = ApiOk<T> | ApiErr;

export function FoodDetailModal({
  open,
  foodId,
  preview,
  onClose,
}: FoodDetailModalProps) {
  const [food, setFood] = useState<FoodDTO | null>(preview ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !foodId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (preview) setFood(preview);

    (async () => {
      try {
        const res = await fetch(`/api/foods/${encodeURIComponent(foodId)}`, {
          cache: "no-store",
        });
        const json: ApiResponse<FoodDTO> = await res.json();
        if (cancelled) return;
        if (!json.success) throw new Error(json.error.message);
        setFood(json.data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Gagal memuat detail makanan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, foodId, preview]);

  const display = food ?? preview ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={display?.name ?? "Detail Makanan"}
      description={
        display?.brand
          ? `${display.brand} · per 100 gram`
          : "Detail nutrisi per 100 gram"
      }
      size="md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Tutup
        </button>
      }
    >
      {loading && !display && (
        <div className="flex items-center justify-center p-8 text-sm text-slate-500">
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Memuat detail...
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {display && (
        <div className="flex flex-col gap-5">
          {/* Image + identity */}
          <div className="flex items-start gap-4">
            {display.imageUrl ? (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* Pakai img bukan next/image karena hostname OFF dinamis */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={display.imageUrl}
                  alt={display.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-primary">
                <Flame className="h-8 w-8" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${CATEGORY_COLOR[display.category]}`}
                >
                  {CATEGORY_LABEL[display.category]}
                </span>
                {display.source === "openfoodfacts" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    OpenFoodFacts
                  </span>
                )}
                {display.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary ring-1 ring-brand-primary/20">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <Flame className="h-5 w-5 text-brand-warning" />
                <span className="text-3xl font-bold tabular-nums text-slate-900">
                  {display.caloriesPer100g}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  kcal / 100g
                </span>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4">
            <Macro
              icon={<Beef className="h-4 w-4" />}
              label="Protein"
              value={display.proteinPer100g}
              unit="g"
            />
            <Macro
              icon={<Wheat className="h-4 w-4" />}
              label="Karbohidrat"
              value={display.carbsPer100g}
              unit="g"
            />
            <Macro
              icon={<Droplet className="h-4 w-4" />}
              label="Lemak"
              value={display.fatPer100g}
              unit="g"
            />
          </div>

          {/* Optional fiber */}
          {display.fiberPer100g != null && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Serat
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {display.fiberPer100g} g
              </span>
            </div>
          )}

          {/* External link */}
          {display.source === "openfoodfacts" && display.externalId && (
            <a
              href={`https://world.openfoodfacts.org/product/${display.externalId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-brand-primary transition hover:text-brand-primary-dark hover:underline"
            >
              Lihat sumber di OpenFoodFacts
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <p className="rounded-xl bg-blue-50 px-3 py-2 text-[11px] text-blue-700 ring-1 ring-blue-100">
            Data nutrisi disediakan oleh komunitas OpenFoodFacts (CC-BY-SA).
            Untuk catatan konsumsi medis-grade, gunakan database manual yang sudah
            diverifikasi tim PETA.
          </p>
        </div>
      )}
    </Modal>
  );
}

function Macro({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="text-brand-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
        {value}
        <span className="ml-0.5 text-xs font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

