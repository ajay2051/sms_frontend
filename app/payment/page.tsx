"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* ── Fee schedule by class ────────────────────────────────────────────── */
const CLASS_FEES: Record<number, number> = {
    1:  1000,  2:  1200,  3:  1400,  4:  1600,
    5:  1800,  6:  2000,  7:  2200,  8:  2400,
    9:  2800, 10:  3000, 11:  3400, 12:  3800,
};

/* ── Payment methods ─────────────────────────────────────────────────── */
type PaymentMethod = "esewa" | "khalti_ime" | "stripe";

interface PaymentMethodOption {
    id: PaymentMethod;
    name: string;
    tagline: string;
    color: string;
    accentColor: string;
    logo: React.ReactNode;
}

function EsewaLogo() {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#5BAD3B"/>
            <text x="11" y="26" fill="white" fontSize="22" fontWeight="700"
                  fontFamily="Georgia, serif" fontStyle="italic">e</text>
            <rect x="26" y="17.5" width="7" height="3" rx="1.5" fill="white"/>
        </svg>
    );
}

/** Khalti by IME — red wordmark with paper-plane motif, matching the merged brand */
function KhaltiImeLogo() {
    return (
        <svg width="52" height="36" viewBox="0 0 52 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* background pill */}
            <rect width="52" height="36" rx="8" fill="#E8000D"/>
            {/* "khalti" bold wordmark */}
            <text x="7" y="17" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="-0.3">khalti</text>
            {/* paper-plane icon (simplified) */}
            <g transform="translate(37, 5) rotate(30)">
                <polygon points="0,0 10,4 0,8" fill="white" opacity="0.95"/>
                <line x1="0" y1="4" x2="6" y2="4" stroke="#E8000D" strokeWidth="1.2"/>
            </g>
            {/* "by IME" small text */}
            <text x="7" y="27" fill="rgba(255,255,255,0.75)" fontSize="6.5" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.5">by IME</text>
        </svg>
    );
}

function StripeLogo() {
    return (
        <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
            <rect width="52" height="36" rx="8" fill="#F6F9FC"/>
            <text x="6" y="24" fill="#635BFF" fontSize="14" fontWeight="800"
                  fontFamily="Arial Black, sans-serif" letterSpacing="-0.5">stripe</text>
            <polygon points="38,8 34,19 37,19 33,28 41,15 37.5,15 41,8" fill="#635BFF"/>
        </svg>
    );
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: "esewa",
        name: "eSewa",
        tagline: "Nepal's most popular digital wallet",
        color: "rgba(96,187,70,0.12)",
        accentColor: "#60BB46",
        logo: <EsewaLogo />,
    },
    {
        id: "khalti_ime",
        name: "Khalti by IME",
        tagline: "Khalti & IME Pay — now one platform",
        color: "rgba(232,0,13,0.12)",
        accentColor: "#E8000D",
        logo: <KhaltiImeLogo />,
    },
    {
        id: "stripe",
        name: "Stripe",
        tagline: "International cards & global payments",
        color: "rgba(103,114,229,0.15)",
        accentColor: "#818CF8",
        logo: <StripeLogo />,
    },
];

/* ── Types ───────────────────────────────────────────────────────────── */
interface StudentData {
    id: number;
    full_name: string;
    student_class: number;
    application_fee: string;
}

/* ── Small helpers ───────────────────────────────────────────────────── */
function formatNPR(amount: number) {
    return new Intl.NumberFormat("en-NP").format(amount);
}

function generateTxnId() {
    return "TXN" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase();
}

/* ── Shimmer skeleton ────────────────────────────────────────────────── */
function Skeleton({ width, height }: { width?: string; height?: string }) {
    return (
        <div style={{
            width: width ?? "100%",
            height: height ?? "1rem",
            borderRadius: 6,
            background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
        }} />
    );
}

/* ── Section card (reused style from admissions) ─────────────────────── */
function SectionCard({ icon, title, children }: {
    icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "2.5px solid var(--sky-500)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "1.25rem",
            overflow: "hidden",
        }}>
            <div style={{ padding: "1.5rem 1.75rem" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    marginBottom: "1.25rem", paddingBottom: "1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
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
export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [student, setStudent]           = useState<StudentData | null>(null);
    const [loadingStudent, setLoadingStudent] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [submitting, setSubmitting]     = useState(false);
    const [success, setSuccess]           = useState(false);
    const [txnId, setTxnId]               = useState("");
    const [apiError, setApiError]         = useState("");

    /* ── Load student from URL param (passed after admissions success) ── */
    useEffect(() => {
        const studentId = searchParams.get("student_id");
        if (!studentId) {
            setLoadingStudent(false);
            return;
        }
        fetch(`${BASE_URL}${API_VERSION}/student/${studentId}/`)
            .then(r => r.json())
            .then((data: StudentData) => setStudent(data))
            .catch(() => setApiError("Failed to load student data."))
            .finally(() => setLoadingStudent(false));
    }, [searchParams]);

    const studentClass = student?.student_class ?? null;
    const totalAmount  = studentClass ? (CLASS_FEES[studentClass] ?? 0) : 0;
    const appFee       = student ? parseFloat(student.application_fee ?? "0") : 0;
    const grandTotal   = totalAmount + appFee;

    async function handlePay() {
        if (!selectedMethod || !student) return;
        setSubmitting(true);
        setApiError("");
        const txn = generateTxnId();
        try {
            const res = await fetch(`${BASE_URL}${API_VERSION}/payment/create/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    txn_id: txn,
                    total_amount: grandTotal,
                    payment_method: selectedMethod,
                    status: "pending",
                    student: student.id,
                    monthly_fee: totalAmount,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail ?? `Error ${res.status}`);
            }
            setTxnId(txn);
            setSuccess(true);
        } catch (err: any) {
            setApiError(err.message ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Success screen ─────────────────────────────────────────────── */
    if (success) return (
        <div className="animate-fade-up" style={{
            minHeight: "100vh", background: "var(--navy-900)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "1.25rem", textAlign: "center", padding: "2rem",
        }}>
            <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
      `}</style>
            <div style={{ position: "relative" }}>
                <div style={{
                    position: "absolute", inset: -10, borderRadius: "9999px",
                    background: "rgba(22,144,216,0.2)",
                    animation: "pulse-ring 2s ease-in-out infinite",
                }} />
                <div style={{
                    width: 80, height: 80, borderRadius: "9999px",
                    background: "linear-gradient(135deg, var(--sky-400), var(--navy-700))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>
            <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 700, color: "var(--white)", marginBottom: "0.5rem" }}>
                    Payment Initiated
                </h1>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", maxWidth: 360, lineHeight: 1.75 }}>
                    Your payment is being processed via <strong style={{ color: "var(--sky-300)" }}>
                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
                </strong>. You will receive a confirmation shortly.
                </p>
            </div>
            {/* TXN details card */}
            <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.75rem",
                display: "flex", flexDirection: "column", gap: "0.625rem",
                minWidth: 300, textAlign: "left",
            }}>
                {[
                    ["Transaction ID", txnId],
                    ["Amount Paid", `NPR ${formatNPR(grandTotal)}`],
                    ["Method", PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name ?? ""],
                    ["Student", student?.full_name ?? ""],
                ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
                        <span style={{ fontSize: "0.8125rem", color: "var(--white)", fontWeight: 600, fontFamily: label === "Transaction ID" ? "monospace" : undefined }}>{value}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={() => router.push("/")}
                style={{
                    padding: "0.65rem 1.75rem", borderRadius: "9999px",
                    background: "rgba(255,255,255,0.08)", color: "var(--white)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                }}
            >
                Go to Dashboard
            </button>
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--navy-900)",
            padding: "2.5rem 3rem",
        }}>
            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .method-card {
          transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .method-card:hover {
          transform: translateY(-2px);
        }
        .pay-btn:not(:disabled):hover {
          background: var(--sky-600) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(22,144,216,0.35);
        }
      `}</style>

            <div style={{ maxWidth: 860, margin: "0 auto" }}>

                {/* Header */}
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
                        Admissions
                    </p>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 700, color: "var(--white)", lineHeight: 1.2, marginBottom: "0.75rem" }}>
                        Complete Your <span style={{ color: "var(--gold-400)" }}>Payment</span>
                    </h1>
                    <p style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520 }}>
                        Select a payment method and complete your admission fee to finalize your enrollment.
                    </p>
                </div>

                {/* Fee Summary */}
                <div className="animate-fade-up delay-100">
                    <SectionCard
                        title="Fee Summary"
                        icon={
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"/>
                                <line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                        }
                    >
                        {loadingStudent ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <Skeleton height="1.2rem" />
                                <Skeleton height="1.2rem" width="60%" />
                                <Skeleton height="1.2rem" width="80%" />
                            </div>
                        ) : student ? (
                            <div>
                                {/* Student info row */}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "0.875rem",
                                    padding: "0.875rem 1rem",
                                    background: "rgba(22,144,216,0.07)",
                                    border: "1px solid rgba(22,144,216,0.15)",
                                    borderRadius: "var(--radius-md)",
                                    marginBottom: "1.25rem",
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                        background: "linear-gradient(135deg, var(--sky-400), var(--navy-700))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.875rem", fontWeight: 700, color: "white",
                                    }}>
                                        {student.full_name?.charAt(0)?.toUpperCase() ?? "S"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--white)" }}>{student.full_name}</div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--sky-300)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                            Grade {student.student_class} · Student ID #{student.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Fee rows */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                    {[
                                        { label: `Monthly Tuition Fee (Grade ${studentClass})`, amount: totalAmount, muted: false },
                                        { label: "Application Fee", amount: appFee, muted: false },
                                    ].map((row, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "0.75rem 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                                        }}>
                                            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--white)" }}>
                        NPR {formatNPR(row.amount)}
                      </span>
                                        </div>
                                    ))}
                                    {/* Grand total */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "1rem 0 0.25rem",
                                    }}>
                                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--white)" }}>Total Amount Due</span>
                                        <span style={{
                                            fontSize: "1.375rem", fontWeight: 700,
                                            fontFamily: "var(--font-display)",
                                            background: "linear-gradient(90deg, var(--sky-300), var(--gold-300))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                      NPR {formatNPR(grandTotal)}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: "1.5rem", textAlign: "center",
                                color: "rgba(255,255,255,0.4)", fontSize: "0.875rem",
                            }}>
                                No student data found. Please complete the admission form first.
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Payment Methods */}
                <div className="animate-fade-up delay-200">
                    <SectionCard
                        title="Select Payment Method"
                        icon={
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        }
                    >
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.875rem",
                        }}>
                            {PAYMENT_METHODS.map(method => {
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        className="method-card"
                                        onClick={() => setSelectedMethod(method.id)}
                                        style={{
                                            background: isSelected ? method.color : "rgba(255,255,255,0.03)",
                                            border: `1.5px solid ${isSelected ? method.accentColor : "rgba(255,255,255,0.09)"}`,
                                            borderRadius: "var(--radius-lg)",
                                            padding: "1.125rem 1.25rem",
                                            display: "flex", alignItems: "center", gap: "0.875rem",
                                            cursor: "pointer", textAlign: "left",
                                            boxShadow: isSelected ? `0 0 0 3px ${method.accentColor}22` : "none",
                                            position: "relative", overflow: "hidden",
                                        }}
                                    >
                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <span style={{
                                                position: "absolute", top: 10, right: 10,
                                                width: 18, height: 18, borderRadius: "50%",
                                                background: method.accentColor,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                                        )}
                                        <div style={{ flexShrink: 0 }}>{method.logo}</div>
                                        <div>
                                            <div style={{
                                                fontSize: "0.9rem", fontWeight: 700,
                                                color: isSelected ? "var(--white)" : "rgba(255,255,255,0.8)",
                                                marginBottom: "0.2rem",
                                            }}>
                                                {method.name}
                                            </div>
                                            <div style={{
                                                fontSize: "0.68rem", fontWeight: 500,
                                                color: isSelected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                                                lineHeight: 1.4,
                                            }}>
                                                {method.tagline}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected method info */}
                        {selectedMethod && (
                            <div className="animate-fade-up" style={{
                                marginTop: "1rem",
                                padding: "0.875rem 1rem",
                                background: "rgba(22,144,216,0.07)",
                                border: "1px solid rgba(22,144,216,0.15)",
                                borderRadius: "var(--radius-md)",
                                display: "flex", alignItems: "center", gap: "0.625rem",
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sky-400)" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>
                  You will be redirected to{" "}
                                    <strong style={{ color: "var(--sky-300)" }}>
                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
                  </strong>{" "}
                                    to complete the payment of{" "}
                                    <strong style={{ color: "var(--gold-300)" }}>NPR {formatNPR(grandTotal)}</strong>.
                </span>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Submit */}
                <div className="animate-fade-up delay-300" style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    gap: "0.75rem", marginTop: "0.5rem",
                }}>
                    {apiError && (
                        <div style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                            fontSize: "0.825rem", fontWeight: 500,
                            background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.2)", color: "var(--danger)",
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {apiError}
                        </div>
                    )}

                    <button
                        type="button"
                        className="pay-btn"
                        disabled={submitting || !selectedMethod || !student}
                        onClick={handlePay}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.7rem 2.25rem", borderRadius: "9999px",
                            background: "var(--sky-500)", color: "white", border: "none",
                            fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 600,
                            cursor: (submitting || !selectedMethod || !student) ? "not-allowed" : "pointer",
                            opacity: (submitting || !selectedMethod || !student) ? 0.45 : 1,
                            transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                        }}
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                Processing…
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                                    <line x1="2" y1="10" x2="22" y2="10"/>
                                </svg>
                                {selectedMethod
                                    ? `Pay NPR ${formatNPR(grandTotal)} via ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}`
                                    : "Select a Payment Method"}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}