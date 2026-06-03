"use client";

import {
  BookOpen,
  LayoutDashboard,
  Loader,
  Search,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminSidebarSections,
  userSidebarSections,
  type SidebarItem,
} from "@/components/dashboard/sidebarConfig";

type Relationship =
  | "self"
  | "child"
  | "wife"
  | "husband"
  | "parent"
  | "sibling"
  | "other";
type LifeStage = "balita" | "anak" | "remaja" | "dewasa";

interface SearchSubjectHit {
  id: string;
  name: string;
  relationship: Relationship;
  lifeStage: LifeStage;
}
interface SearchArticleHit {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  targetLifeStage: LifeStage | null;
}
interface SearchResult {
  query: string;
  subjects: SearchSubjectHit[];
  articles: SearchArticleHit[];
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

const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  self: "Diri Sendiri",
  child: "Anak",
  wife: "Istri",
  husband: "Suami",
  parent: "Orang Tua",
  sibling: "Saudara",
  other: "Lainnya",
};

const STAGE_LABEL: Record<LifeStage, string> = {
  balita: "Balita",
  anak: "Anak",
  remaja: "Remaja",
  dewasa: "Dewasa",
};

const DEBOUNCE_MS = 300;

interface TopbarSearchProps {
  role: "user" | "admin";
}

export function TopbarSearch({ role }: TopbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Menu items dari sidebar config — searchable di sisi client.
  const menuItems = role === "admin" ? adminSidebarSections : userSidebarSections;
  const flatMenu: SidebarItem[] = menuItems.flatMap((s) => s.items);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    const myId = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });
      if (myId !== requestId.current) return;
      const json: ApiResponse<SearchResult> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      setResult(json.data);
    } catch {
      if (myId !== requestId.current) return;
      setResult({ query: trimmed, subjects: [], articles: [] });
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, runSearch]);

  // Tutup dropdown saat klik luar
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // ESC tutup dropdown, Cmd/Ctrl+K fokus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= 1;

  // Filter menu items secara client-side
  const menuHits =
    trimmed.length >= 1
      ? flatMenu.filter((item) =>
          item.label.toLowerCase().includes(trimmed.toLowerCase()),
        )
      : [];

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const subjectsHits = result?.subjects ?? [];
  const articleHits = result?.articles ?? [];
  const totalApiHits = subjectsHits.length + articleHits.length;
  const totalHits = menuHits.length + totalApiHits;

  return (
    <div ref={wrapperRef} className="relative w-full md:w-72">
      <div className="relative">
        {loading ? (
          <Loader className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-primary" />
        ) : (
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Cari menu, subjek, atau artikel..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResult(null);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Bersihkan pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {trimmed.length < 2 ? (
            <p className="p-4 text-xs text-slate-500">
              Ketik minimal 2 huruf untuk mulai mencari.
            </p>
          ) : loading && totalHits === 0 ? (
            <p className="flex items-center gap-2 p-4 text-xs text-slate-500">
              <Loader className="h-3 w-3 animate-spin" />
              Mencari...
            </p>
          ) : totalHits === 0 ? (
            <p className="p-4 text-xs text-slate-500">
              Tidak ada hasil untuk &quot;{trimmed}&quot;.
            </p>
          ) : (
            <div className="flex flex-col py-2">
              {menuHits.length > 0 && (
                <SearchGroup label="Menu">
                  {menuHits.map((item) => (
                    <ResultRow
                      key={item.href}
                      icon={<LayoutDashboard className="h-4 w-4" />}
                      title={item.label}
                      subtitle={item.description}
                      onClick={() => navigate(item.href)}
                    />
                  ))}
                </SearchGroup>
              )}

              {subjectsHits.length > 0 && (
                <SearchGroup label="Subjek">
                  {subjectsHits.map((s) => (
                    <ResultRow
                      key={s.id}
                      icon={<Users className="h-4 w-4" />}
                      title={s.name}
                      subtitle={`${RELATIONSHIP_LABEL[s.relationship]} · ${STAGE_LABEL[s.lifeStage]}`}
                      onClick={() => navigate(`/subjects/${s.id}/growth`)}
                    />
                  ))}
                </SearchGroup>
              )}

              {articleHits.length > 0 && (
                <SearchGroup label="Artikel">
                  {articleHits.map((a) => (
                    <ResultRow
                      key={a.id}
                      icon={<BookOpen className="h-4 w-4" />}
                      title={a.title}
                      subtitle={a.excerpt ?? undefined}
                      onClick={() =>
                        navigate(`/articles/${encodeURIComponent(a.slug)}`)
                      }
                    />
                  ))}
                </SearchGroup>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

function ResultRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 px-3 py-2 text-left transition hover:bg-brand-soft"
      >
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {title}
          </span>
          {subtitle && (
            <span className="block truncate text-[11px] text-slate-500">
              {subtitle}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

