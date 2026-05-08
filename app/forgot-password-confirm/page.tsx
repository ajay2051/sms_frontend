"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* ── API ─────────────────────────────────────────────────────────────────── */
interface ResetPasswordPayload {
    new_password: string;
    confirm_new_password: string;
}

async function resetPassword(
    user_id: string,
    token: string,
    payload: ResetPasswordPayload
) {
    const { data } = await axios.patch(
        `${BASE_URL}${API_VERSION}/auth/forgot-password-confirm/${user_id}/${token}/`,
        payload
    );
    return data;
}

/* ── Mountain SVG background ─────────────────────────────────────────────── */
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

/* ── Logo mark ───────────────────────────────────────────────────────────── */
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

/* ── Password strength ───────────────────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
    if (!pw) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak",   color: "var(--danger)"   };
    if (score <= 3) return { score, label: "Fair",   color: "var(--gold-400)" };
    return              { score, label: "Strong", color: "#4ade80"           };
}

/* ── Eye toggle icon ─────────────────────────────────────────────────────── */
function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function ForgotPasswordConfirmPage({
                                                      params,
                                                  }: {
    params: { user_id: string; token: string };
}) {
    const searchParams = useSearchParams();
    const user_id = searchParams.get("user_id");
    const token   = searchParams.get("token");

    const [newPassword,     setNewPassword]     = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew,         setShowNew]         = useState(false);
    const [showConfirm,     setShowConfirm]     = useState(false);
    const [touched,         setTouched]         = useState({ new: false, confirm: false });

    const mutation = useMutation({
        mutationFn: (payload: ResetPasswordPayload) =>
            resetPassword(user_id!, token!, payload),
    });

    const submitting = mutation.isPending;
    const success    = mutation.isSuccess;
    const error      = mutation.isError
        ? ((mutation.error as AxiosError<{ message?: string }>)
            .response?.data?.message ?? "Something went wrong. Please try again.")
        : "";

    const strength       = getStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword;
    const newError       = touched.new     && newPassword.length > 0     && newPassword.length < 8;
    const confirmError   = touched.confirm && confirmPassword.length > 0 && !passwordsMatch;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTouched({ new: true, confirm: true });
        if (newPassword.length < 8 || !passwordsMatch) return;
        mutation.mutate({
            new_password:         newPassword,
            confirm_new_password: confirmPassword,
        });
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
                @keyframes bar-fill {
                    from { width: 0; }
                }
                .fpc-fade-up  { animation: fadeUp  0.55s cubic-bezier(0.16,1,0.3,1) both; }
                .fpc-fade-in  { animation: fadeIn  0.4s  cubic-bezier(0.16,1,0.3,1) both; }
                .fpc-d1  { animation-delay:  80ms; }
                .fpc-d2  { animation-delay: 160ms; }
                .fpc-d3  { animation-delay: 240ms; }
                .fpc-d4  { animation-delay: 320ms; }

                .fpc-input {
                    width: 100%;
                    padding: 0.8rem 2.75rem 0.8rem 1rem;
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
                .fpc-input::placeholder { color: rgba(255,255,255,0.3); }
                .fpc-input:focus {
                    border-color: var(--sky-400);
                    background: rgba(22,144,216,0.08);
                    box-shadow: 0 0 0 3px rgba(22,144,216,0.18);
                }
                .fpc-input-error {
                    border-color: var(--danger) !important;
                    background: rgba(229,62,62,0.06) !important;
                }
                .fpc-input-error:focus {
                    box-shadow: 0 0 0 3px rgba(229,62,62,0.15) !important;
                }
                .fpc-input-success {
                    border-color: #4ade80 !important;
                    background: rgba(74,222,128,0.05) !important;
                }

                .fpc-btn {
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
                .fpc-btn:not(:disabled):hover {
                    background: var(--sky-600);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(22,144,216,0.4);
                }
                .fpc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .fpc-eye-btn {
                    position: absolute;
                    right: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: rgba(255,255,255,0.35);
                    padding: 0;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s;
                }
                .fpc-eye-btn:hover { color: rgba(255,255,255,0.7); }

                .fpc-strength-bar {
                    height: 4px;
                    border-radius: 2px;
                    transition: width 0.4s cubic-bezier(0.16,1,0.3,1), background-color 0.3s;
                    animation: bar-fill 0.4s cubic-bezier(0.16,1,0.3,1);
                }

                .fpc-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    padding: 0.75rem 0;
                }
                .fpc-feature-icon {
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
                    .fpc-left  { display: none !important; }
                    .fpc-right { grid-column: 1 / -1 !important; }
                }
            `}</style>

            {/* LEFT PANEL */}
            <div className="fpc-left" style={{
                position: "relative",
                background: "linear-gradient(160deg, var(--navy-800) 0%, var(--navy-950) 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "3rem 3.5rem",
                overflow: "hidden",
            }}>
                <MountainBg />

                <div className="fpc-fade-up" style={{ marginBottom: "2.5rem", position: "relative" }}>
                    <LogoMark size={48} />
                </div>

                <div className="fpc-fade-up fpc-d1" style={{ position: "relative" }}>
                    <h1 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                        fontWeight: 700,
                        color: "var(--white)",
                        lineHeight: 1.2,
                        marginBottom: "1rem",
                    }}>
                        Set a new<br/>
                        <span style={{ color: "var(--gold-400)" }}>password</span>
                    </h1>
                    <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.75,
                        maxWidth: 340,
                        marginBottom: "2.5rem",
                    }}>
                        Choose a strong password you haven't used before. Your account will be secured immediately after updating.
                    </p>
                </div>

                {/* Tips */}
                <div className="fpc-fade-up fpc-d2" style={{ position: "relative" }}>
                    {[
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            ),
                            label: "At least 8 characters",
                            sub: "Longer passwords are harder to crack",
                        },
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            ),
                            label: "Mix letters, numbers & symbols",
                            sub: "e.g. MyP@ss2024! is strong",
                        },
                        {
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sky-300)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            ),
                            label: "Don't reuse old passwords",
                            sub: "Use a unique password for this account",
                        },
                    ].map((f, i) => (
                        <div key={i} className="fpc-feature-item">
                            <div className="fpc-feature-icon">{f.icon}</div>
                            <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--white)" }}>{f.label}</div>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="fpc-right" style={{
                background: "var(--navy-900)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 2rem",
            }}>

                {/* Brand header */}
                <div className="fpc-fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <LogoMark size={44} />
                    <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.5rem", fontWeight: 700,
                        color: "var(--white)",
                        letterSpacing: "0.06em",
                        marginTop: "0.75rem", marginBottom: "0.25rem",
                    }}>
                        Academia
                    </h2>
                    <p style={{
                        fontSize: "0.65rem", fontWeight: 600,
                        letterSpacing: "0.2em", textTransform: "uppercase",
                        color: "rgba(255,255,255,0.35)",
                    }}>
                        Collège Alpin International
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    width: "100%", maxWidth: 420,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 18,
                    padding: "2.25rem 2rem",
                }}>
                    {success ? (
                        /* Success state */
                        <div className="fpc-fade-up" style={{ textAlign: "center" }}>
                            <div style={{ position: "relative", display: "inline-block", marginBottom: "1.5rem" }}>
                                <div className="pulse-ring" style={{
                                    position: "absolute", inset: -10, borderRadius: "9999px",
                                    background: "rgba(74,222,128,0.15)",
                                }} />
                                <div style={{
                                    width: 72, height: 72, borderRadius: "9999px", position: "relative",
                                    background: "linear-gradient(135deg, #4ade80, var(--navy-700))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                            </div>

                            <h3 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.375rem", fontWeight: 700,
                                color: "var(--white)", marginBottom: "0.625rem",
                            }}>
                                Password Updated!
                            </h3>
                            <p style={{
                                fontSize: "0.85rem", color: "rgba(255,255,255,0.5)",
                                lineHeight: 1.75, marginBottom: "2rem",
                            }}>
                                Your password has been reset successfully. You can now sign in with your new password.
                            </p>

                            <Link
                                href="/login"
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: "0.5rem",
                                    padding: "0.875rem",
                                    borderRadius: 10,
                                    background: "var(--sky-500)",
                                    color: "white",
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.9375rem", fontWeight: 700,
                                    letterSpacing: "0.04em", textTransform: "uppercase",
                                    textDecoration: "none",
                                    transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.background = "var(--sky-600)";
                                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(22,144,216,0.4)";
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.background = "var(--sky-500)";
                                    (e.currentTarget as HTMLElement).style.transform = "none";
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                    <polyline points="10 17 15 12 10 7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <div className="fpc-fade-up" style={{ marginBottom: "1.75rem" }}>
                                <h3 style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1.5rem", fontWeight: 700,
                                    color: "var(--white)", marginBottom: "0.375rem",
                                }}>
                                    New Password
                                </h3>
                                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                    Enter and confirm your new password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} noValidate>

                                {/* New password */}
                                <div className="fpc-fade-up fpc-d1" style={{ marginBottom: "1.25rem" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "0.68rem", fontWeight: 600,
                                        letterSpacing: "0.1em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.45)",
                                        marginBottom: "0.5rem",
                                    }}>
                                        New Password <span style={{ color: "var(--sky-400)" }}>*</span>
                                    </label>

                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showNew ? "text" : "password"}
                                            className={`fpc-input${
                                                newError ? " fpc-input-error"
                                                    : touched.new && newPassword.length >= 8 ? " fpc-input-success"
                                                        : ""
                                            }`}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); mutation.reset(); }}
                                            onBlur={() => setTouched(t => ({ ...t, new: true }))}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="fpc-eye-btn"
                                            onClick={() => setShowNew(v => !v)}
                                            tabIndex={-1}
                                        >
                                            <EyeIcon open={showNew} />
                                        </button>
                                    </div>

                                    {/* Strength bar */}
                                    {newPassword.length > 0 && (
                                        <div style={{ marginTop: "0.5rem" }}>
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(5, 1fr)",
                                                gap: "3px",
                                                marginBottom: "0.3rem",
                                            }}>
                                                {[1,2,3,4,5].map(i => (
                                                    <div key={i} style={{
                                                        height: 4, borderRadius: 2,
                                                        background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)",
                                                        transition: "background 0.3s",
                                                    }} />
                                                ))}
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>
                                                    Password strength
                                                </span>
                                                {strength.label && (
                                                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: strength.color }}>
                                                        {strength.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {newError && (
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
                                            Password must be at least 8 characters
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className="fpc-fade-up fpc-d2" style={{ marginBottom: "1.5rem" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "0.68rem", fontWeight: 600,
                                        letterSpacing: "0.1em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,0.45)",
                                        marginBottom: "0.5rem",
                                    }}>
                                        Confirm Password <span style={{ color: "var(--sky-400)" }}>*</span>
                                    </label>

                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            className={`fpc-input${
                                                confirmError ? " fpc-input-error"
                                                    : touched.confirm && confirmPassword.length > 0 && passwordsMatch ? " fpc-input-success"
                                                        : ""
                                            }`}
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); mutation.reset(); }}
                                            onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="fpc-eye-btn"
                                            onClick={() => setShowConfirm(v => !v)}
                                            tabIndex={-1}
                                        >
                                            <EyeIcon open={showConfirm} />
                                        </button>
                                    </div>

                                    {confirmError && (
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
                                            Passwords do not match
                                        </div>
                                    )}

                                    {/* Match indicator */}
                                    {touched.confirm && confirmPassword.length > 0 && passwordsMatch && (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "0.375rem",
                                            marginTop: "0.375rem",
                                            fontSize: "0.7rem", fontWeight: 600, color: "#4ade80",
                                        }}>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            Passwords match
                                        </div>
                                    )}
                                </div>

                                {/* API error */}
                                {error && (
                                    <div className="fpc-fade-up" style={{
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
                                <div className="fpc-fade-up fpc-d3">
                                    <button
                                        type="submit"
                                        className="fpc-btn"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                </svg>
                                                Updating…
                                            </>
                                        ) : (
                                            <>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                </svg>
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Back to login */}
                            <div className="fpc-fade-up fpc-d4" style={{ textAlign: "center", marginTop: "1.5rem" }}>
                                <Link
                                    href="/login"
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "0.375rem",
                                        fontSize: "0.85rem", color: "rgba(255,255,255,0.45)",
                                        textDecoration: "none", transition: "color 0.15s",
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
                <p className="fpc-fade-in fpc-d4" style={{
                    marginTop: "2rem", fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.2)", textAlign: "center",
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