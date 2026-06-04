"use client";

import { BadgeCheck, Salad } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
} from "@/components/dashboard/foods/foodTypes";
import type { FoodAdminDTO } from "./adminFoodTypes";

interface FoodPreviewModalProps {
  open: boolean;
  food: FoodAdminDTO | null;
  onClose: () => void;
}

/** Pratinjau bagaimana data makanan tampil sebagai kartu gizi. */
export function FoodPreviewModal({ open, food, onClose }: FoodPreviewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Pratinjau Makanan"
      description="Beginilah tampilan kartu data gizi makanan ini."
    >
      {food && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-soft text-brand-primary">
                {food.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Salad className="h-8 w-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-lg font-bold text-slate-900">
                    {food.name}
                  </h3>
                  {food.isVerified && (
                    <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ring-1 ${CATEGORY_COLOR[food.category]}`}
                  >
                    {CATEGORY_LABEL[food.category]}
                  </span>
                  {food.brand && <span className="truncate">{food.brand}</span>}
                </div>
              </div>
            </div>

            {food.description && (
              <p className="mt-4 text-sm text-slate-600">{food.description}</p>
            )}

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nilai gizi per 100 gram
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Nutri label="Kalori" value={food.caloriesPer100g} suffix="kkal" accent />
              <Nutri label="Protein" value={food.proteinPer100g} suffix="g" />
              <Nutri label="Karbo" value={food.carbsPer100g} suffix="g" />
              <Nutri label="Lemak" value={food.fatPer100g} suffix="g" />
              <Nutri
                label="Serat"
                value={food.fiberPer100g ?? 0}
                suffix="g"
              />
            </div>
          </div>

          {!food.isVerified && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Belum diverifikasi — data gizi belum ditinjau.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Nutri({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: number;
  suffix: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 text-center">
      <p
        className={`text-base font-bold tabular-nums ${accent ? "text-brand-primary" : "text-slate-900"}`}
      >
        {value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label} ({suffix})
      </p>
    </div>
  );
}
