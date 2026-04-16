"use client";
import React, { useState } from "react";
import Link from "next/link";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* ── Mountain SVG background (matches login page aesthetic) ─────────── */
function MountainBg() {
    return (
        <svg
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
        >
            <polygon points="0,400 120,160 240,300 360,100 480,240 600,80 600,400" fill="#1690d8"/>
            <polygon points="0,400 80,220 180,330 300,140 420,260 540,120 600,180 600,400" fill="#0c2044" opacity="0.7"/>
            <polygon points="0,400 60,280 140,360 220,200 320,300 420,180 520,260 600,200 600,400" fill="#163470" opacity="0.5"/>
        </svg>
    );
}

/* ── Academia logo mark ──────────────────────────────────────────────── */
function LogoMark({ size = 52 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="25" stroke="rgba(56,169,235,0.6)" strokeWidth="1.5" fill="rgba(22,144,216,0.12)"/>
            <circle cx="26" cy="26" r="18" stroke="rgba(56,169,235,0.35)" strokeWidth="1" fill="none"/>
            <path d="M26 12 L34 30 H18 Z" fill="none" stroke="rgba(56,169,235,0.8)" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="26" cy="33" r="3" fill="rgba(56,169,235,0.7)"/>
            <line x1="16" y1="38" x2="36" y2="38" stroke="rgba(56,169,235,0.4)" strokeWidth="1"/>
        </svg>
    );
}

export default function ForgotPasswordPage() {
    const [email, setEmail]       = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess]   = useState(false);
    const [error, setError]       = useState("");
    const [touched, setTouched]   = useState(false);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const showEmailError = touched && email.length > 0 && !emailValid;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(true);
        if (!emailValid) return;
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(`${BASE_URL}${API_VERSION}/auth/forgot-password/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.message ?? `Error ${res.status}`);
            }
            setSuccess(true);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "var(--navy-950)",
        }}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(0.88); opacity: 0.7; }
                    50%  { transform: scale(1.06); opacity: 0.3; }
                    100% { transform: scale(0.88); opacity: 0.7; }
                }
                .fp-fade-up   { animation: fadeUp  0.55s cubic-bezier(0.16,1,0.3,1) both; }
                .fp-fade-in   { animation: fadeIn  0.4s  cubic-bezier(0.16,1,0.3,1) both; }
                .fp-delay-1   { animation-delay: 80ms;  }
                .fp-delay-2   { animation-delay: 160ms; }
                .fp-delay-3   { animation-delay: 240ms; }
                .fp-delay-4   { animation-delay: 320ms; }

                .fp-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: rgba(255,255,255,0.06);
                    border: 1.5px solid rgba(255,255,255,0.12);
                    border-radius: 10px;
                    font-family: var(--font-body);
                    font-size: 0.9rem;
                    color: var(--white);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    box-sizing: border-box;
                    colorScheme: dark;
                }
                .fp-input::placeholder { color: rgba(255,255,255,0.3); }
                .fp-input:focus {
                    border-color: var(--sky-400);
                    background: rgba(22,144,216,0.08);
                    box-shadow: 0 0 0 3px rgba(22,144,216,0.18);
                }
                .fp-input-error {
                    border-color: var(--danger) !important;
                    background: rgba(229,62,62,0.06) !important;
                }
                .fp-input-error:focus {
                    box-shadow: 0 0 0 3px rgba(229,62,62,0.15) !important;
                }

                .fp-btn {
                    width: 100%;
                    padding: 0.875rem;
                    border-radius: 10px;
                    background: var(--sky-500);
                    color: white;
                    border: none;
                    font-family: var(--font-body);
                    font-size: 0.9375rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                .fp-btn:not(:disabled):hover {
                    background: var(--sky-600);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(22,144,216,0.4);
                }
                .fp-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .fp-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    padding: 0.75rem 0;
                }
                .fp-feature-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .pulse-ring { animation: pulse-ring 2.2s ease-in-out infinite; }

                @media (max-width: 768px) {
                    .fp-left-panel { display: none !important; }
                    .fp-right-panel { grid-column: 1 / -1 !important; }
                }
            `}</style>

            {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
            <div className="fp-left-panel" style={{
                position: "relative",
                background: "linear-gradient(160deg, var(--navy-800) 0%, var(--navy-950) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "3rem 3.5rem",
                overflow: "hidden",
            }}>
                <MountainBg />

                {/* Logo */}
                <div className="fp-fade-up" style={{ marginBottom: "2.5rem", position: "relative" }}>
                    <LogoMark size={48} />
                </div>

                {/* Headline */}
                <div className="fp-fade-up fp-delay-1" style={{ position: "relative" }}>
                    <h1 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                        fontWeight: 700,
                        color: "var(--white)",
                        lineHeight: 1.2,
                        marginBottom: "1rem",
                    }}>
                        Forgot your<br/>
                        <span style={{ color: "var(--gold-400)" }}>password?</span>
                    </h1>
                    <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.75,
                        maxWidth: 340,
                        marginBottom: "2.5rem",
                    }}>
                        No worries. Enter your registered email address and we'll send you a secure link to reset your password.
                    </p>
                </div>

                {/* Feature list */}
                <div className="fp-fade-up fp-delay-2" style={{ position: "relative" }}>
                    {[
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            ),
                            label: "Secure reset link",
                            sub: "Time-limited & single-use token",
                        },
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                </svg>
                            ),
                            label: "Sent instantly to your email",
                            sub: "Check your inbox & spam folder",
                        },
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky-300)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            ),
                            label: "Account stays protected",
                            sub: "No changes without confirmation",
                        },
                    ].map((f, i) => (
                        <div key={i} className="fp-feature-item">
                            <div className="fp-feature-icon">{f.icon}</div>
                            <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--white)" }}>{f.label}</div>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
            <div className="fp-right-panel" style={{
                background: "var(--navy-900)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 2rem",
                position: "relative",
            }}>

                {/* Brand header */}
                <div className="fp-fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <LogoMark size={44} />
                    <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--white)",
                        letterSpacing: "0.06em",
                        marginTop: "0.75rem",
                        marginBottom: "0.25rem",
                    }}>
                        Academia
                    </h2>
                    <p style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.35)",
                    }}>
                        Collège Alpin International
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    width: "100%",
                    maxWidth: 420,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 18,
                    padding: "2.25rem 2rem",
                }}>
                    {success ? (
                        /* ── Success state ── */
                        <div className="fp-fade-up" style={{ textAlign: "center" }}>
                            <div style={{ position: "relative", display: "inline-block", marginBottom: "1.5rem" }}>
                                <div className="pulse-ring" style={{
                                    position: "absolute", inset: -10, borderRadius: "9999px",
                                    background: "rgba(22,144,216,0.2)",
                                }} />
                                <div style={{
                                    width: 72, height: 72, borderRadius: "9999px",
                                    background: "linear-gradient(135deg, var(--sky-400), var(--navy-700))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative",
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                            </div>

                            <h3 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.375rem", fontWeight: 700,
                                color: "var(--white)", marginBottom: "0.625rem",
                            }}>
                                Check your inbox
                            </h3>
                            <p style={{
                                fontSize: "0.85rem", color: "rgba(255,255,255,0.5)",
                                lineHeight: 1.75, marginBottom: "1.75rem",
                            }}>
                                We've sent a password reset link to{" "}
                                <strong style={{ color: "var(--sky-300)" }}>{email}</strong>.
                                The link will expire shortly.
                            </p>

                            {/* Tips */}
                            <div style={{
                                background: "rgba(22,144,216,0.07)",
                                border: "1px solid rgba(22,144,216,0.15)",
                                borderRadius: 10,
                                padding: "0.875rem 1rem",
                                textAlign: "left",
                                marginBottom: "1.75rem",
                            }}>
                                {[
                                    "Check your spam or junk folder if you don't see it.",
                                    "The link is valid for a limited time.",
                                    "You can only use the link once.",
                                ].map((tip, i) => (
                                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: i < 2 ? "0.5rem" : 0 }}>
                                        <span style={{ color: "var(--sky-400)", fontSize: "0.75rem", marginTop: 2, flexShrink: 0 }}>•</span>
                                        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{tip}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => { setSuccess(false); setEmail(""); setTouched(false); }}
                                style={{
                                    width: "100%", padding: "0.75rem",
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.07)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    color: "var(--white)",
                                    fontFamily: "var(--font-body)", fontSize: "0.875rem",
                                    fontWeight: 600, cursor: "pointer",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.11)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                            >
                                Try a different email
                            </button>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <>
                            <div className="fp-fade-up" style={{ marginBottom: "1.75rem" }}>
                                <h3 style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1.5rem", fontWeight: 700,
                                    color: "var(--white)", marginBottom: "0.375rem",
                                }}>
                                    Reset Password
                                </h3>
                                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                    Enter your account email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate>
                                {/* Email field */}
                                <div className="fp-fade-up fp-delay-1" style={{ marginBottom: "1.25rem" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "0.68rem", fontWeight: 600,
                                        letterSpacing: "0.1em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.45)",
                                        marginBottom: "0.5rem",
                                    }}>
                                        Email Address <span style={{ color: "var(--sky-400)" }}>*</span>
                                    </label>

                                    <div style={{ position: "relative" }}>
                                        <span style={{
                                            position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                                            color: showEmailError ? "var(--danger)" : "rgba(255,255,255,0.3)",
                                            pointerEvents: "none",
                                        }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                <polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            className={`fp-input${showEmailError ? " fp-input-error" : ""}`}
                                            style={{ paddingLeft: "2.5rem" }}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(""); }}
                                            onBlur={() => setTouched(true)}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>

                                    {showEmailError && (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "0.375rem",
                                            marginTop: "0.375rem",
                                            fontSize: "0.7rem", fontWeight: 600, color: "var(--danger)",
                                        }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            Please enter a valid email address
                                        </div>
                                    )}
                                </div>

                                {/* API error */}
                                {error && (
                                    <div className="fp-fade-up" style={{
                                        display: "flex", alignItems: "center", gap: "0.5rem",
                                        padding: "0.75rem 1rem", borderRadius: 10,
                                        background: "rgba(229,62,62,0.1)",
                                        border: "1px solid rgba(229,62,62,0.2)",
                                        color: "var(--danger)",
                                        fontSize: "0.825rem", fontWeight: 500,
                                        marginBottom: "1.25rem",
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="fp-fade-up fp-delay-2">
                                    <button
                                        type="submit"
                                        className="fp-btn"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                </svg>
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                                </svg>
                                                Send Reset Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Back to login */}
                            <div className="fp-fade-up fp-delay-3" style={{ textAlign: "center", marginTop: "1.5rem" }}>
                                <Link
                                    href="/login"
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "0.375rem",
                                        fontSize: "0.85rem", color: "rgba(255,255,255,0.45)",
                                        textDecoration: "none",
                                        transition: "color 0.15s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "var(--sky-300)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12"/>
                                        <polyline points="12 19 5 12 12 5"/>
                                    </svg>
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="fp-fade-in fp-delay-4" style={{
                    marginTop: "2rem",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.2)",
                    textAlign: "center",
                }}>
                    By continuing, you agree to our{" "}
                    <Link href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}