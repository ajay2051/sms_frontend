"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* ── Months ──────────────────────────────────────────────────────────── */
const MONTHS = [
    { value: "January",   short: "Jan", num: 1  },
    { value: "February",  short: "Feb", num: 2  },
    { value: "March",     short: "Mar", num: 3  },
    { value: "April",     short: "Apr", num: 4  },
    { value: "May",       short: "May", num: 5  },
    { value: "June",      short: "Jun", num: 6  },
    { value: "July",      short: "Jul", num: 7  },
    { value: "August",    short: "Aug", num: 8  },
    { value: "September", short: "Sep", num: 9  },
    { value: "October",   short: "Oct", num: 10 },
    { value: "November",  short: "Nov", num: 11 },
    { value: "December",  short: "Dec", num: 12 },
];

const currentMonth = new Date().getMonth(); // 0-indexed

/* ── Section card ────────────────────────────────────────────────────── */
function SectionCard({ icon, title, children }: {
    icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
    return (
        <div className="fee-section-card">
            <div style={{ padding: "1.5rem 1.75rem" }}>
                <div className="fee-section-header">
                    <span style={{ color: "var(--sky-400)" }}>{icon}</span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: "var(--white)", margin: 0 }}>
                        {title}
                    </h2>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ── Main ─────────────────────────────────────────────────────────────── */
export default function FeePage() {
    const router = useRouter();

    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [submitting, setSubmitting]         = useState(false);
    const [success, setSuccess]               = useState(false);
    const [successMonths, setSuccessMonths]   = useState<string[]>([]);
    const [apiError, setApiError]             = useState("");

    function toggleMonth(month: string) {
        setSelectedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
        setApiError("");
    }

    function selectAll() {
        setSelectedMonths(MONTHS.map(m => m.value));
    }
    function clearAll() {
        setSelectedMonths([]);
    }

    /* Submit one POST per selected month (API takes single month per call) */
    async function handleSubmit() {
        if (!selectedMonths.length) return;
        setSubmitting(true);
        setApiError("");
        try {
            for (const month of selectedMonths) {
                const res = await fetch(`${BASE_URL}${API_VERSION}/fee/create/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                        "Content-Type": "application/json",   // ✅ THIS LINE FIXES IT
                    },
                    body: JSON.stringify({ month }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(`${month}: ${data?.detail ?? `Error ${res.status}`}`);
                }
            }
            setSuccessMonths([...selectedMonths]);
            setSuccess(true);
            setTimeout(() => {
                router.push("/payment?from=fee");
            }, 1500);
        } catch (err: any) {
            setApiError(err.message ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Success screen ───────────────────────────────────────────────── */
    if (success) return (
        <div className="animate-fade-up" style={{
            minHeight: "100vh", background: "var(--navy-900)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "1.25rem", textAlign: "center", padding: "2rem",
        }}>
            <style>{`
                @keyframes pulse-ring {
                    0%   { transform: scale(0.85); opacity: 0.8; }
                    50%  { transform: scale(1.05); opacity: 0.4; }
                    100% { transform: scale(0.85); opacity: 0.8; }
                }
                .fee-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
            `}</style>

            <div style={{ position: "relative" }}>
                <div className="fee-pulse-ring" style={{
                    position: "absolute", inset: -10, borderRadius: "9999px",
                    background: "rgba(22,144,216,0.2)",
                }} />
                <div style={{
                    width: 80, height: 80, borderRadius: "9999px", position: "relative",
                    background: "linear-gradient(135deg, var(--sky-400), var(--navy-700))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>

            <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.5rem" }}>
                    Fee Submitted
                </h1>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", maxWidth: 380, lineHeight: 1.75 }}>
                    Monthly fee records have been created for the following months.
                </p>
            </div>

            {/* Month pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", maxWidth: 400 }}>
                {successMonths.map(m => (
                    <span key={m} style={{
                        padding: "0.3rem 0.875rem", borderRadius: "9999px",
                        fontSize: "0.75rem", fontWeight: 700,
                        letterSpacing: "0.05em", textTransform: "uppercase",
                        background: "rgba(22,144,216,0.18)", color: "var(--sky-300)",
                        border: "1px solid rgba(22,144,216,0.3)",
                    }}>{m}</span>
                ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                    onClick={() => { setSuccess(false); setSelectedMonths([]); }}
                    style={{
                        padding: "0.65rem 1.5rem", borderRadius: "9999px",
                        background: "rgba(255,255,255,0.08)", color: "var(--white)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Submit Another
                </button>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "0.65rem 1.5rem", borderRadius: "9999px",
                        background: "var(--sky-500)", color: "white", border: "none",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );

    /* ── Main page ────────────────────────────────────────────────────── */
    return (
        <div style={{ minHeight: "100vh", background: "var(--navy-900)", padding: "2.5rem 3rem" }}>
            <style>{`
                /* Section card */
                .fee-section-card {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-top: 2.5px solid var(--sky-500);
                    border-radius: var(--radius-lg);
                    margin-bottom: 1.25rem;
                    overflow: hidden;
                }
                .fee-section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                /* Month grid */
                .fee-month-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                }
                @media (max-width: 640px) {
                    .fee-month-grid { grid-template-columns: repeat(3, 1fr); }
                }

                /* Month card */
                .fee-month-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    padding: 1rem 0.5rem;
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    border: 1.5px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.03);
                    transition: border-color 0.18s, background 0.18s, transform 0.15s, box-shadow 0.18s;
                    user-select: none;
                }
                .fee-month-card:hover:not(.fee-month-selected) {
                    border-color: rgba(56,169,235,0.4);
                    background: rgba(56,169,235,0.06);
                    transform: translateY(-2px);
                }
                .fee-month-selected {
                    border-color: var(--sky-400) !important;
                    background: rgba(22,144,216,0.14) !important;
                    box-shadow: 0 0 0 3px rgba(22,144,216,0.18);
                    transform: translateY(-1px);
                }
                .fee-month-current .fee-month-num {
                    color: var(--gold-400);
                }
                .fee-month-checkmark {
                    position: absolute;
                    top: 7px;
                    right: 7px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--sky-400);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Summary row */
                .fee-summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.625rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                /* Error banner */
                .fee-error-banner {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.825rem;
                    font-weight: 500;
                    background: rgba(229,62,62,0.1);
                    border: 1px solid rgba(229,62,62,0.2);
                    color: var(--danger);
                }

                /* Submit button */
                .fee-submit-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.7rem 2.25rem;
                    border-radius: 9999px;
                    background: var(--sky-500);
                    color: white;
                    border: none;
                    font-family: var(--font-body);
                    font-size: 0.9375rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
                }
                .fee-submit-btn:not(:disabled):hover {
                    background: var(--sky-600);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(22,144,216,0.35);
                }
                .fee-submit-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }

                /* Quick action btns */
                .fee-quick-btn {
                    padding: 0.3rem 0.875rem;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.6);
                    transition: background 0.15s, color 0.15s;
                }
                .fee-quick-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: var(--white);
                }
            `}</style>

            <div style={{ maxWidth: 860, margin: "0 auto" }}>

                {/* ── Header ── */}
                <div className="animate-fade-up" style={{ marginBottom: "2rem" }}>
                    <span style={{
                        display: "block", width: 36, height: 3, borderRadius: 2,
                        background: "linear-gradient(90deg, var(--gold-400), var(--sky-400))",
                        marginBottom: "0.625rem",
                    }} />
                    <p style={{
                        fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: "var(--sky-400)", marginBottom: "0.25rem",
                    }}>
                        Fees
                    </p>
                    <h1 style={{
                        fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,4vw,2.5rem)",
                        fontWeight: 700, color: "var(--white)", lineHeight: 1.2, marginBottom: "0.75rem",
                    }}>
                        Monthly <span style={{ color: "var(--gold-400)" }}>Fee Payment</span>
                    </h1>
                    <p style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520 }}>
                        Select one or more months to submit your monthly fee records.
                    </p>
                </div>

                {/* ── Month selector ── */}
                <div className="animate-fade-up delay-100">
                    <SectionCard
                        title="Select Month(s)"
                        icon={
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        }
                    >
                        {/* Quick actions row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                                {selectedMonths.length === 0
                                    ? "No months selected"
                                    : `${selectedMonths.length} month${selectedMonths.length > 1 ? "s" : ""} selected`}
                            </span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="fee-quick-btn" onClick={selectAll} type="button">Select All</button>
                                <button className="fee-quick-btn" onClick={clearAll} type="button">Clear</button>
                            </div>
                        </div>

                        {/* Month grid */}
                        <div className="fee-month-grid">
                            {MONTHS.map((month) => {
                                const isSelected = selectedMonths.includes(month.value);
                                const isCurrent  = month.num - 1 === currentMonth;
                                return (
                                    <button
                                        key={month.value}
                                        type="button"
                                        onClick={() => toggleMonth(month.value)}
                                        className={[
                                            "fee-month-card",
                                            isSelected  ? "fee-month-selected"  : "",
                                            isCurrent   ? "fee-month-current"   : "",
                                        ].join(" ")}
                                    >
                                        {/* Checkmark */}
                                        {isSelected && (
                                            <span className="fee-month-checkmark">
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </span>
                                        )}

                                        {/* Current dot */}
                                        {isCurrent && !isSelected && (
                                            <span style={{
                                                position: "absolute", top: 7, right: 7,
                                                width: 6, height: 6, borderRadius: "50%",
                                                background: "var(--gold-400)",
                                            }} />
                                        )}

                                        {/* Month number */}
                                        <span className="fee-month-num" style={{
                                            fontSize: "1.25rem", fontWeight: 700,
                                            fontFamily: "var(--font-display)",
                                            color: isSelected ? "var(--sky-300)" : isCurrent ? "var(--gold-400)" : "rgba(255,255,255,0.35)",
                                            lineHeight: 1,
                                        }}>
                                            {String(month.num).padStart(2, "0")}
                                        </span>

                                        {/* Month name */}
                                        <span style={{
                                            fontSize: "0.75rem", fontWeight: 600,
                                            letterSpacing: "0.06em", textTransform: "uppercase",
                                            color: isSelected ? "var(--white)" : "rgba(255,255,255,0.55)",
                                        }}>
                                            {month.short}
                                        </span>

                                        {/* Full name */}
                                        <span style={{
                                            fontSize: "0.6rem", fontWeight: 500,
                                            color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                                        }}>
                                            {month.value}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Current month legend */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)", display: "block" }} />
                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Current month</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(22,144,216,0.35)", border: "1.5px solid var(--sky-400)", display: "block" }} />
                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Selected</span>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* ── Summary ── */}
                {selectedMonths.length > 0 && (
                    <div className="animate-fade-up delay-200">
                        <SectionCard
                            title="Submission Summary"
                            icon={
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="9" y1="15" x2="15" y2="15"/>
                                </svg>
                            }
                        >
                            <div>
                                {/* Sort selected months in calendar order */}
                                {[...selectedMonths]
                                    .sort((a, b) => MONTHS.findIndex(m => m.value === a) - MONTHS.findIndex(m => m.value === b))
                                    .map((month, i, arr) => (
                                        <div key={month} className="fee-summary-row" style={i === arr.length - 1 ? { borderBottom: "none" } : {}}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                                <span style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    background: "rgba(22,144,216,0.15)",
                                                    border: "1px solid rgba(22,144,216,0.25)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.65rem", fontWeight: 700, color: "var(--sky-300)",
                                                }}>
                                                    {String(MONTHS.find(m => m.value === month)?.num ?? "").padStart(2, "0")}
                                                </span>
                                                <span style={{ fontSize: "0.875rem", color: "var(--white)", fontWeight: 500 }}>{month}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleMonth(month)}
                                                style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: "rgba(255,255,255,0.35)", fontSize: "1rem",
                                                    padding: "0 0.25rem", lineHeight: 1,
                                                    transition: "color 0.15s",
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                                                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                }

                                {/* Total count */}
                                <div style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    marginTop: "0.875rem", paddingTop: "0.875rem",
                                    borderTop: "1px solid rgba(255,255,255,0.07)",
                                }}>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--white)" }}>
                                        Total Months
                                    </span>
                                    <span style={{
                                        fontSize: "1.375rem", fontWeight: 700,
                                        fontFamily: "var(--font-display)",
                                        background: "linear-gradient(90deg, var(--sky-300), var(--gold-300))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}>
                                        {selectedMonths.length}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── Submit ── */}
                <div className="animate-fade-up delay-300" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {apiError && (
                        <div className="fee-error-banner">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {apiError}
                        </div>
                    )}

                    <button
                        type="button"
                        className="fee-submit-btn"
                        disabled={submitting || selectedMonths.length === 0}
                        onClick={handleSubmit}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                Submitting…
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                {selectedMonths.length === 0
                                    ? "Select at least one month"
                                    : `Submit ${selectedMonths.length} Month${selectedMonths.length > 1 ? "s" : ""}`}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}