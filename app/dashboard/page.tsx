"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import axios, { AxiosError } from "axios";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* -- Axios instance -------------------------------------------------------- */
const api = axios.create({ baseURL: `${BASE_URL}${API_VERSION}` });

// Attach auth token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/* -- Types ----------------------------------------------------------------- */
type Tab = "Students" | "Payments" | "Notice";
const TABS: Tab[] = ["Students", "Payments", "Notice"];

export interface Student {
    id: number;
    full_name: string;
    phone_number: string;
    student_class: string;
    year: number;
    address: string;
    parents_name: string;
    relation: string | null;
    parents_phone_number: string;
    application_fee: string;
    application_status: string;
    comments: string | null;
    profile_pic: string | null;
    certificates: string[];
    created_at: string;
    updated_at: string;
    email: string;
}

interface StudentListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Student[];
}

interface Notice {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface NoticeListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notice[];
}

interface Payment {
    id: number;
    txn_id: string;
    total_amount: string;
    payment_method: string;
    status: string;
    student: string;
    monthly_fee: string | null;
    created_at: string;
    updated_at: string;
}

interface PaymentListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Payment[];
}

const TAB_ICONS: Record<Tab, JSX.Element> = {
    Students: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    Payments: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
    ),
    Notice: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
};

/* -- Helpers --------------------------------------------------------------- */
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "-";
}
function initials(name: string) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* -- Inline styles matching login page theme ------------------------------- */
const theme = {
    bgPage:        "#0d1526",
    bgSidebar:     "#0a1020",
    bgCard:        "rgba(255,255,255,0.04)",
    bgCardHover:   "rgba(255,255,255,0.07)",
    bgInput:       "rgba(255,255,255,0.06)",
    bgHeader:      "rgba(10,16,32,0.85)",
    border:        "rgba(255,255,255,0.08)",
    borderFocus:   "rgba(56,189,248,0.6)",
    textPrimary:   "#f0f4ff",
    textSecondary: "rgba(240,244,255,0.5)",
    textMuted:     "rgba(240,244,255,0.3)",
    accentBlue:    "#38bdf8",
    accentBlueDim: "rgba(56,189,248,0.15)",
    accentGold:    "#f0a832",
    accentGoldDim: "rgba(240,168,50,0.15)",
    success:       "#34d399",
    successDim:    "rgba(52,211,153,0.12)",
    warning:       "#fbbf24",
    warningDim:    "rgba(251,191,36,0.12)",
    danger:        "#f87171",
    dangerDim:     "rgba(248,113,113,0.12)",
};

/* -- CSS injection --------------------------------------------------------- */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: ${theme.bgPage};
    color: ${theme.textPrimary};
    min-height: 100vh;
  }

  .app-shell {
    display: grid;
    grid-template-columns: var(--sw, 240px) 1fr;
    grid-template-rows: 60px 1fr;
    min-height: 100vh;
    transition: grid-template-columns 0.25s ease;
  }
  .app-shell.collapsed { --sw: 68px; }

  .app-sidebar {
    grid-row: 1 / -1;
    background: ${theme.bgSidebar};
    border-right: 1px solid ${theme.border};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .app-header {
    background: ${theme.bgHeader};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid ${theme.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .app-main {
    padding: 32px;
    overflow-y: auto;
    background: ${theme.bgPage};
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    background: transparent;
    border: none;
    color: ${theme.textSecondary};
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background 0.15s ease, color 0.15s ease;
    width: 100%;
    text-align: left;
    white-space: nowrap;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: ${theme.textPrimary}; }
  .nav-item.active { background: rgba(56,189,248,0.12); color: ${theme.accentBlue}; }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }
  .data-table thead tr { border-bottom: 1px solid ${theme.border}; }
  .data-table th {
    text-align: left;
    padding: 11px 16px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: ${theme.textMuted};
  }
  .data-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.12s ease;
  }
  .data-table tbody tr:hover { background: rgba(255,255,255,0.03); }
  .data-table td { padding: 13px 16px; color: ${theme.textSecondary}; vertical-align: middle; }

  .dark-input {
    background: ${theme.bgInput};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    color: ${theme.textPrimary};
    font-family: inherit;
    font-size: 0.85rem;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s ease;
    width: 100%;
  }
  .dark-input::placeholder { color: ${theme.textMuted}; }
  .dark-input:focus { border-color: ${theme.borderFocus}; }
  textarea.dark-input { resize: vertical; line-height: 1.6; }

  /* Select override for dark theme */
  select.dark-input {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(240,244,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
    cursor: pointer;
  }
  select.dark-input option {
    background: #0d1526;
    color: #f0f4ff;
  }

  .btn-primary {
    background: ${theme.accentBlue};
    color: #0a1020;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 8px 16px;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.1s ease;
    letter-spacing: 0.02em;
  }
  .btn-primary:hover { opacity: 0.88; }
  .btn-primary:active { transform: scale(0.98); }

  .btn-ghost {
    background: rgba(255,255,255,0.06);
    color: ${theme.textSecondary};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 7px 14px;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: ${theme.textPrimary}; }
  .btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Active filter button */
  .btn-ghost.filter-active {
    background: rgba(56,189,248,0.12);
    color: ${theme.accentBlue};
    border-color: rgba(56,189,248,0.3);
  }

  .btn-detail {
    background: ${theme.accentBlueDim};
    color: ${theme.accentBlue};
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 5px 11px;
    cursor: pointer;
    transition: background 0.15s ease;
    white-space: nowrap;
  }
  .btn-detail:hover { background: rgba(56,189,248,0.25); }

  .btn-edit {
    background: rgba(255,255,255,0.05);
    color: ${theme.textSecondary};
    border: 1px solid ${theme.border};
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 5px 11px;
    cursor: pointer;
    transition: background 0.15s ease;
    white-space: nowrap;
  }
  .btn-edit:hover { background: rgba(255,255,255,0.1); color: ${theme.textPrimary}; }

  .btn-delete {
    background: ${theme.dangerDim};
    color: ${theme.danger};
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 5px 11px;
    cursor: pointer;
    transition: background 0.15s ease;
    white-space: nowrap;
  }
  .btn-delete:hover { background: rgba(248,113,113,0.22); }

  .avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(56,189,248,0.15);
    color: ${theme.accentBlue};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.04em;
    border: 1px solid rgba(56,189,248,0.2);
  }

  .stat-card {
    border-radius: 14px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid ${theme.border};
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.06;
    background: radial-gradient(ellipse at top right, white, transparent 60%);
  }
  .stat-card-navy { background: linear-gradient(135deg, #0d1e3a 0%, #0a1020 100%); }
  .stat-card-blue { background: linear-gradient(135deg, #0c2a3f 0%, #0a1020 100%); }
  .stat-card-gold { background: linear-gradient(135deg, #271900 0%, #0a1020 100%); }
  .stat-card-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
  .stat-card-value { font-size: 2.4rem; font-weight: 700; line-height: 1; }

  .dark-card {
    background: rgba(255,255,255,0.035);
    border: 1px solid ${theme.border};
    border-radius: 14px;
    overflow: hidden;
  }

  @keyframes shimmer {
    0%   { opacity: 0.3; }
    50%  { opacity: 0.7; }
    100% { opacity: 0.3; }
  }
  .skeleton { height: 13px; border-radius: 4px; background: rgba(255,255,255,0.08); animation: shimmer 1.5s ease-in-out infinite; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .fade-up { animation: fadeUp 0.3s ease forwards; }

  .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; }
  .breadcrumb-sep { color: ${theme.textMuted}; }
  .breadcrumb-active { color: ${theme.accentBlue}; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 0.7rem; }

  .error-banner {
    background: ${theme.dangerDim};
    border: 1px solid rgba(248,113,113,0.2);
    color: ${theme.danger};
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .search-wrap .dark-input { padding-left: 34px; }

  .mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.78rem; }

  /* Filter bar */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* Active filter chip */
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(56,189,248,0.1);
    color: ${theme.accentBlue};
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 20px;
    padding: 3px 10px 3px 10px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.03em;
  }
  .filter-chip button {
    background: none;
    border: none;
    color: ${theme.accentBlue};
    cursor: pointer;
    padding: 0;
    line-height: 1;
    opacity: 0.7;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
  }
  .filter-chip button:hover { opacity: 1; }
`;

/* -- CSS injector ---------------------------------------------------------- */
function GlobalStyles() {
    useEffect(() => {
        const id = "academia-global-styles";
        if (document.getElementById(id)) return;
        const tag = document.createElement("style");
        tag.id = id;
        tag.textContent = GLOBAL_CSS;
        document.head.appendChild(tag);
        return () => { document.getElementById(id)?.remove(); };
    }, []);
    return null;
}

/* -- Status badge ---------------------------------------------------------- */
function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase();
    const map: Record<string, { bg: string; color: string; border: string }> = {
        approved:  { bg: theme.successDim, color: theme.success, border: "rgba(52,211,153,0.25)" },
        completed: { bg: theme.successDim, color: theme.success, border: "rgba(52,211,153,0.25)" },
        pending:   { bg: theme.warningDim, color: theme.warning, border: "rgba(251,191,36,0.25)" },
        rejected:  { bg: theme.dangerDim,  color: theme.danger,  border: "rgba(248,113,113,0.25)" },
        failed:    { bg: theme.dangerDim,  color: theme.danger,  border: "rgba(248,113,113,0.25)" },
    };
    const s = map[key] ?? { bg: "rgba(56,189,248,0.1)", color: theme.accentBlue, border: "rgba(56,189,248,0.25)" };
    return (
        <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20,
            padding: "3px 10px", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            {capitalize(status)}
        </span>
    );
}

/* -- Table wrapper ---------------------------------------------------------- */
function TableWrap({ children }: { children: React.ReactNode }) {
    return (
        <div className="dark-card" style={{ overflowX: "auto" }}>
            <table className="data-table">{children}</table>
        </div>
    );
}

/* -- Skeleton row ---------------------------------------------------------- */
function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} style={{ padding: "14px 16px" }}>
                    <div className="skeleton" style={{ width: `${60 + Math.random() * 30}%` }}/>
                </td>
            ))}
        </tr>
    );
}

/* -- Filter chip ----------------------------------------------------------- */
function FilterChip({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
    return (
        <span className="filter-chip">
            <span style={{ opacity: 0.6 }}>{label}:</span> {value}
            <button onClick={onRemove} title="Remove filter">×</button>
        </span>
    );
}

/* -- API fetchers ---------------------------------------------------------- */
async function fetchPayments(params: Record<string, string>): Promise<PaymentListResponse> {
    const { data } = await api.get<PaymentListResponse>("/payment/all-payments/", { params });
    return data;
}

async function fetchStudents(params: Record<string, string>): Promise<StudentListResponse> {
    const { data } = await api.get<StudentListResponse>("/student/list/", { params });
    return data;
}

async function fetchNotices(params: Record<string, string>): Promise<NoticeListResponse> {
    const { data } = await api.get<NoticeListResponse>("/notice/list/", { params });
    return data;
}

async function createNotice(payload: { title: string; description: string }): Promise<Notice> {
    const { data } = await api.post<Notice>("/notice/create/", payload);
    return data;
}

/* -- Payments tab ---------------------------------------------------------- */
function PaymentsTab({ onCount }: { onCount: (n: number) => void }) {
    const [page,          setPage]          = useState(1);
    const [search,        setSearch]        = useState("");
    const [statusFilter,  setStatusFilter]  = useState("");
    const [methodFilter,  setMethodFilter]  = useState("");
    const PAGE_SIZE = 10;

    const PAYMENT_STATUSES  = ["pending", "completed", "failed"];
    const PAYMENT_METHODS   = ["cash", "esewa", "khalti", "bank_transfer", "card"];

    function resetFilters() {
        setSearch("");
        setStatusFilter("");
        setMethodFilter("");
        setPage(1);
    }

    const hasActiveFilters = search || statusFilter || methodFilter;

    const params: Record<string, string> = { page: String(page), page_size: String(PAGE_SIZE) };
    if (search)       params.search         = search;
    if (statusFilter) params.status         = statusFilter;
    if (methodFilter) params.payment_method = methodFilter;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["payments", page, search, statusFilter, methodFilter],
        queryFn: () => fetchPayments(params),
    });

    useEffect(() => {
        if (data) onCount(data.count);
    }, [data, onCount]);

    const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;
    const errorMsg = isError ? (error instanceof AxiosError ? error.message : "Failed to load payments.") : "";

    return (
        <div className="fade-up">
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: theme.textPrimary, fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
                    Payments
                </h2>
                <p style={{ color: theme.textMuted, fontSize: "0.78rem", marginTop: 4 }}>
                    {isLoading ? "Loading…" : `${data?.count ?? 0} transaction${data?.count !== 1 ? "s" : ""}`}
                </p>
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div className="filter-bar">
                    {/* Search */}
                    <div className="search-wrap" style={{ flex: "1 1 200px", maxWidth: 260 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            className="dark-input"
                            placeholder="Search by student or class…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        className="dark-input"
                        style={{ width: "auto", minWidth: 140 }}
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        {PAYMENT_STATUSES.map(s => (
                            <option key={s} value={s}>{capitalize(s)}</option>
                        ))}
                    </select>

                    {/* Method filter */}
                    <select
                        className="dark-input"
                        style={{ width: "auto", minWidth: 160 }}
                        value={methodFilter}
                        onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Methods</option>
                        {PAYMENT_METHODS.map(m => (
                            <option key={m} value={m}>{capitalize(m.replace("_", " "))}</option>
                        ))}
                    </select>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button className="btn-ghost" onClick={resetFilters} style={{ whiteSpace: "nowrap" }}>
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {search        && <FilterChip label="Search"  value={search}                          onRemove={() => { setSearch("");       setPage(1); }} />}
                        {statusFilter  && <FilterChip label="Status"  value={capitalize(statusFilter)}        onRemove={() => { setStatusFilter("");  setPage(1); }} />}
                        {methodFilter  && <FilterChip label="Method"  value={capitalize(methodFilter.replace("_"," "))} onRemove={() => { setMethodFilter("");  setPage(1); }} />}
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="error-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errorMsg}
                </div>
            )}

            <TableWrap>
                <thead>
                <tr>
                    {["#", "Transaction ID", "Student", "Method", "Amount", "Monthly Fee", "Status", "Created", "Updated"]
                        .map(h => <th key={h}>{h}</th>)}
                </tr>
                </thead>
                <tbody>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                    : !data?.results.length
                        ? <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px 16px", color: theme.textMuted }}>
                            No payments found.
                        </td></tr>
                        : data.results.map(p => (
                            <tr key={p.id}>
                                <td style={{ color: theme.textMuted, fontSize: "0.78rem" }}>{p.id}</td>
                                <td><span className="mono" style={{ color: theme.accentBlue }}>{p.txn_id}</span></td>
                                <td style={{ fontWeight: 600, color: theme.textPrimary }}>{p.student}</td>
                                <td style={{ color: theme.textPrimary }}>{p.payment_method}</td>
                                <td style={{ fontWeight: 700, color: theme.textPrimary }}>
                                    NPR {Number(p.total_amount).toLocaleString()}
                                </td>
                                <td style={{ color: theme.textSecondary }}>
                                    {p.monthly_fee ? `NPR ${Number(p.monthly_fee).toLocaleString()}` : "—"}
                                </td>
                                <td><StatusBadge status={p.status} /></td>
                                <td style={{ color: theme.textMuted }}>{fmtDate(p.created_at)}</td>
                                <td style={{ color: theme.textMuted }}>{fmtDate(p.updated_at)}</td>
                            </tr>
                        ))
                }
                </tbody>
            </TableWrap>

            {!isLoading && totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                    <p style={{ fontSize: "0.78rem", color: theme.textMuted }}>
                        Page {page} of {totalPages} · {data?.count} total
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost" disabled={!data?.previous} onClick={() => setPage(p => p - 1)}>← Prev</button>
                        <button className="btn-ghost" disabled={!data?.next}     onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -- Notice form ----------------------------------------------------------- */
function NoticeForm({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
    const queryClient = useQueryClient();
    const [title,  setTitle]  = useState("");
    const [desc,   setDesc]   = useState("");
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

    const special = new Set("@_!#$%^&*()<>?/\\|}{~:");

    function validate() {
        const e: typeof errors = {};
        if (!title.trim()) e.title = "Title is required.";
        else if ([...title].some(c => special.has(c))) e.title = "No special characters allowed.";
        if (!desc.trim()) e.description = "Description is required.";
        return e;
    }

    const mutation = useMutation({
        mutationFn: createNotice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notices"] });
            onSave();
        },
        onError: (err: AxiosError<{ title?: string[]; description?: string[]; message?: string }>) => {
            const data = err.response?.data;
            if (data?.title)       setErrors(v => ({ ...v, title: data.title![0] }));
            if (data?.description) setErrors(v => ({ ...v, description: data.description![0] }));
        },
    });

    function handleSubmit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        mutation.mutate({ title: title.trim(), description: desc.trim() });
    }

    const apiError = mutation.isError && !mutation.error?.response?.data?.title && !mutation.error?.response?.data?.description
        ? ((mutation.error as AxiosError<{ message?: string }>).response?.data?.message ?? "Network error. Please try again.")
        : "";

    return (
        <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <button onClick={onBack} className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Notice
                </button>
                <span style={{ color: theme.textMuted }}>›</span>
                <span style={{ fontSize: "0.8rem", color: theme.textMuted }}>Create Notice</span>
            </div>

            <div className="dark-card" style={{ maxWidth: 560 }}>
                <div style={{ padding: "22px 28px", borderBottom: `1px solid ${theme.border}` }}>
                    <h2 style={{ color: theme.textPrimary, fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                        Create Notice
                    </h2>
                    <p style={{ color: theme.textMuted, fontSize: "0.78rem", marginTop: 4 }}>
                        Broadcast a notice to all students
                    </p>
                </div>

                <div style={{ padding: 28 }}>
                    {apiError && (
                        <div className="error-banner" style={{ marginBottom: 18 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {apiError}
                        </div>
                    )}

                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: "block", marginBottom: 7, fontSize: "0.68rem", fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase", color: theme.textMuted }}>
                            Title
                        </label>
                        <input
                            className="dark-input"
                            style={errors.title ? { borderColor: theme.danger } : {}}
                            value={title}
                            onChange={e => { setTitle(e.target.value); setErrors(v => ({ ...v, title: undefined })); }}
                            placeholder="e.g. Term Dates 2024-25"
                        />
                        {errors.title && (
                            <p style={{ color: theme.danger, fontSize: "0.72rem", marginTop: 5 }}>{errors.title}</p>
                        )}
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: "block", marginBottom: 7, fontSize: "0.68rem", fontWeight: 600,
                            letterSpacing: "0.08em", textTransform: "uppercase", color: theme.textMuted }}>
                            Description
                        </label>
                        <textarea
                            className="dark-input"
                            style={errors.description ? { borderColor: theme.danger, minHeight: 120 } : { minHeight: 120 }}
                            value={desc}
                            onChange={e => { setDesc(e.target.value); setErrors(v => ({ ...v, description: undefined })); }}
                            placeholder="Write the notice content here..."
                            rows={5}
                        />
                        {errors.description && (
                            <p style={{ color: theme.danger, fontSize: "0.72rem", marginTop: 5 }}>{errors.description}</p>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                        <button className="btn-ghost" onClick={onBack} disabled={mutation.isPending}>Cancel</button>
                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={mutation.isPending}
                            style={{ display: "flex", alignItems: "center", gap: 7, opacity: mutation.isPending ? 0.65 : 1 }}
                        >
                            {mutation.isPending ? (
                                <>
                                    <svg style={{ animation: "spin 0.8s linear infinite" }} width="13" height="13"
                                         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                         strokeLinecap="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Saving…
                                </>
                            ) : "Save Notice"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* -- Notice tab ------------------------------------------------------------ */
function NoticeTabWithCount({ onCount }: { onCount: (n:number)=>void }) {
    const [view, setView] = useState<"list" | "create">("list");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const params: Record<string, string> = { page: String(page), page_size: String(PAGE_SIZE) };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["notices", page],
        queryFn: () => fetchNotices(params),
        enabled: view === "list",
    });

    useEffect(() => {
        if (data) onCount(data.count);
    }, [data, onCount]);

    function handleSaved() {
        setView("list");
        setPage(1);
    }

    const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;
    const errorMsg = isError ? (error instanceof AxiosError ? error.message : "Failed to load notices.") : "";

    if (view === "create") return <NoticeForm onBack={() => setView("list")} onSave={handleSaved} />;

    return (
        <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h2 style={{ color: theme.textPrimary, fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>
                        Notice Board
                    </h2>
                    <p style={{ color: theme.textMuted, fontSize: "0.78rem", marginTop: 4 }}>
                        {isLoading ? "Loading…" : `${data?.count ?? 0} notice${data?.count !== 1 ? "s" : ""} published`}
                    </p>
                </div>
                <button
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                    onClick={() => setView("create")}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create Notice
                </button>
            </div>

            {errorMsg && (
                <div className="error-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errorMsg}
                </div>
            )}

            <TableWrap>
                <thead>
                <tr>{["#", "Title", "Description", "Created", "Updated"].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                    : !data?.results.length
                        ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px 16px", color: theme.textMuted }}>
                            No notices found.
                        </td></tr>
                        : data.results.map(n => (
                            <tr key={n.id}>
                                <td style={{ color: theme.textMuted, fontSize: "0.78rem" }}>{n.id}</td>
                                <td style={{ fontWeight: 600, color: theme.textPrimary }}>{n.title}</td>
                                <td style={{ maxWidth: 320, color: theme.textSecondary }}>
                                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {n.description}
                                    </span>
                                </td>
                                <td style={{ color: theme.textMuted }}>{fmtDate(n.created_at)}</td>
                                <td style={{ color: theme.textMuted }}>{fmtDate(n.updated_at)}</td>
                            </tr>
                        ))
                }
                </tbody>
            </TableWrap>

            {!isLoading && totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                    <p style={{ fontSize: "0.78rem", color: theme.textMuted }}>
                        Page {page} of {totalPages} · {data?.count} total
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost" disabled={page === 1}          onClick={() => setPage(p => p - 1)}>← Prev</button>
                        <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -- Stat card ------------------------------------------------------------- */
function StatCard({ label, value, variant, iconColor, icon }: {
    label: string; value: string|number; variant: string; iconColor: string; icon: React.ReactNode
}) {
    return (
        <div className={`stat-card ${variant}`}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <p className="stat-card-label" style={{ color: iconColor, opacity:0.9 }}>{label}</p>
                <span style={{ color: iconColor, opacity:0.6 }}>{icon}</span>
            </div>
            <p className="stat-card-value" style={{ color: iconColor }}>{value}</p>
        </div>
    );
}

/* -- Loading screen -------------------------------------------------------- */
function LoadingScreen() {
    return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:theme.bgPage}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
                <svg style={{animation:"spin 1s linear infinite"}} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.accentBlue} strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p style={{fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:theme.textMuted}}>Verifying session…</p>
            </div>
        </div>
    );
}

/* -- Sidebar --------------------------------------------------------------- */
export function DashboardSidebar({
                                     activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onSignOut,
                                 }: {
    activeTab?: Tab; setActiveTab?: (t:Tab)=>void;
    sidebarOpen: boolean; setSidebarOpen: (v:boolean|((p:boolean)=>boolean))=>void;
    onSignOut: ()=>void;
}) {
    return (
        <aside className="app-sidebar">
            <div style={{padding:"18px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${theme.border}`}}>
                <div style={{width:38,height:38,borderRadius:10,background:"rgba(56,189,248,0.12)",border:`1px solid rgba(56,189,248,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.accentBlue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
                {sidebarOpen && (
                    <div style={{overflow:"hidden"}}>
                        <p style={{color:theme.accentGold,fontSize:"0.95rem",fontWeight:700,margin:0,whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>Academia</p>
                        <p style={{color:theme.textMuted,margin:0,whiteSpace:"nowrap",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500}}>Admin Dashboard</p>
                    </div>
                )}
            </div>

            <nav style={{flex:1,padding:"10px 8px"}}>
                {TABS.map(tab => {
                    const active = activeTab === tab;
                    return (
                        <button key={tab} onClick={()=>setActiveTab?.(tab)}
                                className={`nav-item ${active?"active":""}`} style={{marginBottom:2,justifyContent:sidebarOpen?"flex-start":"center"}}>
                            <span style={{flexShrink:0}}>{TAB_ICONS[tab]}</span>
                            {sidebarOpen && <span>{tab}</span>}
                            {active && sidebarOpen && (
                                <span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:theme.accentBlue,flexShrink:0}}/>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div style={{padding:"10px 8px",borderTop:`1px solid ${theme.border}`}}>
                <button onClick={onSignOut} className="nav-item" style={{marginBottom:4,justifyContent:sidebarOpen?"flex-start":"center"}}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
                <button onClick={()=>setSidebarOpen(v=>!v)} className="nav-item" style={{justifyContent:sidebarOpen?"flex-end":"center"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {sidebarOpen?<polyline points="15 18 9 12 15 6"/>:<polyline points="9 18 15 12 9 6"/>}
                    </svg>
                    {sidebarOpen && <span style={{fontSize:"0.73rem"}}>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

/* -- Students tab ---------------------------------------------------------- */
function StudentsTabWithCount({ onCount }: { onCount: (n:number)=>void }) {
    const router = useRouter();
    const [page,          setPage]          = useState(1);
    const [search,        setSearch]        = useState("");
    const [classFilter,   setClassFilter]   = useState("");
    const [statusFilter,  setStatusFilter]  = useState("");
    const PAGE_SIZE = 10;

    const STUDENT_CLASSES  = ["1","2","3","4","5","6","7","8","9","10","11","12"];
    const STUDENT_STATUSES = ["pending", "approved", "rejected"];

    function resetFilters() {
        setSearch("");
        setClassFilter("");
        setStatusFilter("");
        setPage(1);
    }

    const hasActiveFilters = search || classFilter || statusFilter;

    const params: Record<string, string> = { page: String(page), page_size: String(PAGE_SIZE) };
    if (search)       params.search        = search;
    if (classFilter)  params.student_class = classFilter;
    if (statusFilter) params.status        = statusFilter;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["students", page, search, classFilter, statusFilter],
        queryFn: () => fetchStudents(params),
    });

    useEffect(() => {
        if (data) onCount(data.count);
    }, [data, onCount]);

    const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;
    const errorMsg = isError ? (error instanceof AxiosError ? error.message : "Failed to load students.") : "";

    return (
        <div className="fade-up">
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: theme.textPrimary, fontSize: "1.35rem", fontWeight: 700, margin: 0 }}>Students</h2>
                <p style={{ color: theme.textMuted, fontSize: "0.78rem", marginTop: 4 }}>
                    {data ? `${data.count} record${data.count !== 1 ? "s" : ""} found` : "Loading…"}
                </p>
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div className="filter-bar">
                    {/* Search */}
                    <div className="search-wrap" style={{ flex: "1 1 200px", maxWidth: 260 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            className="dark-input"
                            placeholder="Search by name, phone, year…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Class filter */}
                    <select
                        className="dark-input"
                        style={{ width: "auto", minWidth: 140 }}
                        value={classFilter}
                        onChange={e => { setClassFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Classes</option>
                        {STUDENT_CLASSES.map(c => (
                            <option key={c} value={c}>Grade {c}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        className="dark-input"
                        style={{ width: "auto", minWidth: 150 }}
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        {STUDENT_STATUSES.map(s => (
                            <option key={s} value={s}>{capitalize(s)}</option>
                        ))}
                    </select>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button className="btn-ghost" onClick={resetFilters} style={{ whiteSpace: "nowrap" }}>
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {search       && <FilterChip label="Search" value={search}                   onRemove={() => { setSearch("");      setPage(1); }} />}
                        {classFilter  && <FilterChip label="Class"  value={`Grade ${classFilter}`}   onRemove={() => { setClassFilter("");  setPage(1); }} />}
                        {statusFilter && <FilterChip label="Status" value={capitalize(statusFilter)} onRemove={() => { setStatusFilter(""); setPage(1); }} />}
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="error-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errorMsg}
                </div>
            )}

            <TableWrap>
                <thead>
                <tr>{["#","Student","Email","Phone","Class","Year","Status","Fee","Actions"].map(h=><th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                {isLoading
                    ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={9}/>)
                    : !data?.results.length
                        ? <tr><td colSpan={9} style={{textAlign:"center",padding:"48px 16px",color:theme.textMuted}}>No students found.</td></tr>
                        : data.results.map(s=>(
                            <tr key={s.id}>
                                <td style={{color:theme.textMuted,fontSize:"0.78rem"}}>{s.id}</td>
                                <td>
                                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                                        {s.profile_pic
                                            ? <img src={s.profile_pic} alt={s.full_name} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:`1px solid ${theme.border}`}}/>
                                            : <div className="avatar-circle">{initials(s.full_name)}</div>
                                        }
                                        <span style={{fontWeight:600,color:theme.textPrimary}}>{s.full_name}</span>
                                    </div>
                                </td>
                                <td style={{fontSize:"0.78rem",color:theme.textMuted}}>{s.email}</td>
                                <td style={{color:theme.textSecondary}}>{s.phone_number}</td>
                                <td style={{color:theme.textPrimary}}>Grade {s.student_class}</td>
                                <td style={{color:theme.textMuted}}>{s.year}</td>
                                <td><StatusBadge status={s.application_status}/></td>
                                <td style={{fontWeight:700,color:theme.accentGold}}>NPR {Number(s.application_fee).toLocaleString()}</td>
                                <td>
                                    <div style={{display:"flex",gap:6,flexWrap:"nowrap"}}>
                                        <button className="btn-detail" onClick={()=>router.push(`/dashboard/students/${s.id}`)}>Approve</button>
                                        <button className="btn-delete">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                }
                </tbody>
            </TableWrap>

            {!isLoading && data && totalPages > 1 && (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16}}>
                    <p style={{fontSize:"0.78rem",color:theme.textMuted}}>Page {page} of {totalPages} · {data.count} total</p>
                    <div style={{display:"flex",gap:8}}>
                        <button className="btn-ghost" disabled={!data.previous} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                        <button className="btn-ghost" disabled={!data.next}     onClick={()=>setPage(p=>p+1)}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -- QueryClient singleton ------------------------------------------------- */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000,
        },
    },
});

/* -- Main Dashboard -------------------------------------------------------- */
function DashboardPageInner() {
    useAuthGuard();
    const [activeTab,    setActiveTab]    = useState<Tab>("Students");
    const [sidebarOpen,  setSidebarOpen]  = useState(true);
    const [studentCount, setStudentCount] = useState<number>(0);
    const [noticeCount,  setNoticeCount]  = useState<number>(0);
    const [paymentCount, setPaymentCount] = useState<number>(0);

    function handleSignOut() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    return (
        <>
            <GlobalStyles/>
            <div className={`app-shell ${sidebarOpen?"":"collapsed"}`}>
                <DashboardSidebar
                    activeTab={activeTab} setActiveTab={setActiveTab}
                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                    onSignOut={handleSignOut}
                />

                <header className="app-header">
                    <div className="breadcrumb">
                        <span style={{color:theme.textMuted,fontSize:"0.75rem"}}>Dashboard</span>
                        <span className="breadcrumb-sep">/</span>
                        <span className="breadcrumb-active">{activeTab}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:`rgba(56,189,248,0.12)`,border:`1px solid rgba(56,189,248,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",fontWeight:700,color:theme.accentBlue,letterSpacing:"0.04em"}}>AD</div>
                        <div>
                            <p style={{fontSize:"0.8rem",fontWeight:700,color:theme.textPrimary,margin:0}}>Admin</p>
                            <p style={{fontSize:"0.7rem",color:theme.textMuted,margin:0}}>admin@academia.ch</p>
                        </div>
                    </div>
                </header>

                <main className="app-main">
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
                        <StatCard
                            label="Total Students" value={studentCount || "—"} variant="stat-card-navy"
                            iconColor={theme.accentBlue}
                            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                        />
                        <StatCard
                            label="Total Payments" value={paymentCount || "—"} variant="stat-card-blue"
                            iconColor={theme.accentBlue}
                            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                        />
                        <StatCard
                            label="Total Notices" value={noticeCount || "—"} variant="stat-card-gold"
                            iconColor={theme.accentGold}
                            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                        />
                    </div>

                    {activeTab === "Students" && <StudentsTabWithCount onCount={setStudentCount}/>}
                    {activeTab === "Payments" && <PaymentsTab onCount={setPaymentCount} />}
                    {activeTab === "Notice"   && <NoticeTabWithCount onCount={setNoticeCount} />}
                </main>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <DashboardPageInner />
        </QueryClientProvider>
    );
}