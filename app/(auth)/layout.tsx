import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Peta — Pencegahan Stunting & Tracker Gizi",
    template: "%s | Peta",
  },
  description:
    "Pantau gizi keluarga & cegah stunting sejak dini, berbasis WHO Growth Standards & AKG Indonesia.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}