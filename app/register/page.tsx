"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

const LOGO_SRC = "/logo.png";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "student" | "teacher" | "staff";

interface RegisterPayload {
    email: string;
    password: string;
    role: Role;
}

interface RegisterResponse {
    // extend as needed based on your actual API response shape
    detail?: string;
    email?: string[];
    password?: string[];
}

// ─── API function ─────────────────────────────────────────────────────────────

async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await axios.post<RegisterResponse>(
        `${BASE_URL}${API_VERSION}/auth/create_users/`,
        payload,
    );
    return data;
}

// ─── Sub-components (unchanged) ───────────────────────────────────────────────

function SchoolLogo({ width = 46, height = 52 }: { width?: number; height?: number }) {
    return <Image src={LOGO_SRC} alt="School logo" width={width} height={height} style={{ objectFit: "contain" }} />;
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 999,
            padding: "14px 24px", borderRadius: 12,
            background: type === "success" ? "linear-gradient(135deg,#0e2550,#1690d8)" : "linear-gradient(135deg,#7f1d1d,#dc2626)",
            color: "white", fontSize: 14, fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", gap: 10,
            animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            maxWidth: 380,
        }}>
            {type === "success"
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {message}
        </div>
    );
}

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", ok: password.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "Number", ok: /\d/.test(password) },
        { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ["#ef4444","#f97316","#eab308","#22c55e"];
    const labels = ["Weak","Fair","Good","Strong"];

    if (!password) return null;

    return (
        <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                {[0,1,2,3].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? colors[score-1] : "rgba(255,255,255,0.1)", transition:"background 0.3s" }}/>
                ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color: score > 0 ? colors[score-1] : "rgba(255,255,255,0.3)" }}>
                    {score > 0 ? labels[score-1] : ""}
                </span>
                <div style={{ display:"flex", gap:12 }}>
                    {checks.map(c => (
                        <span key={c.label} style={{ fontSize:10, color: c.ok ? "#22c55e" : "rgba(255,255,255,0.25)", display:"flex", alignItems:"center", gap:3 }}>
                            {c.ok ? "?" : "?"} {c.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const [email, setEmail]               = useState("");
    const [password, setPassword]         = useState("");
    const [confirmPass, setConfirmPass]   = useState("");
    const [role, setRole]                 = useState<Role>("student");
    const [showPass, setShowPass]         = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [toast, setToast]               = useState<{ message: string; type: "success"|"error" } | null>(null);
    const [errors, setErrors]             = useState<Record<string,string>>({});

    const showToast = (message: string, type: "success"|"error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const validate = () => {
        const e: Record<string,string> = {};
        if (!email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 8) e.password = "Password must be at least 8 characters";
        if (!confirmPass) e.confirmPass = "Please confirm your password";
        else if (password !== confirmPass) e.confirmPass = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── TanStack mutation ──────────────────────────────────────────────────────
    const { mutate, isPending } = useMutation<RegisterResponse, AxiosError<RegisterResponse>, RegisterPayload>({
        mutationFn: registerUser,
        onSuccess: () => {
            showToast("Account created successfully! Please Check Email For Verification...", "success");
            // setTimeout(() => { window.location.href = "/login"; }, 2000);
        },
        onError: (error) => {
            const data = error.response?.data;
            const msg =
                data?.email?.[0] ??
                data?.password?.[0] ??
                data?.detail ??
                "Registration failed. Please try again.";
            showToast(msg, "error");
        },
    });

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        mutate({ email, password, role });
    };

    const clearError = (field: string) => setErrors(p => { const n = { ...p }; delete n[field]; return n; });

    return (
        <>
            <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .field-input { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:white; font-size:15px; outline:none; transition:border-color 0.2s,background 0.2s; box-sizing:border-box; }
        .field-input::placeholder { color:rgba(255,255,255,0.35); }
        .field-input:focus { border-color:#1690d8; background:rgba(255,255,255,0.09); }
        .field-input.error { border-color:#ef4444; }
        .role-btn { flex:1; padding:11px 16px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.25s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .role-btn.active { background:rgba(22,144,216,0.18); border-color:#1690d8; color:white; }
        .role-btn:hover:not(.active) { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.25); color:rgba(255,255,255,0.85); }
        .submit-btn { width:100%; padding:14px; border-radius:10px; border:none; cursor:pointer; font-size:14px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; transition:all 0.3s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(22,144,216,0.4); }
        .submit-btn:disabled { opacity:0.65; cursor:not-allowed; }
      `}</style>

            {toast && <Toast message={toast.message} type={toast.type} />}

            <main style={{
                minHeight: "100vh", display: "flex",
                background: "linear-gradient(160deg,#050f22 0%,#091a38 40%,#0e2550 70%,#0c1e3a 100%)",
                position: "relative", overflow: "hidden",
            }}>
                {/* Background decorations */}
                <div style={{ position:"absolute", top:"-15%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,178,62,0.1),transparent 70%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:"-10%", left:"-8%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,144,216,0.1),transparent 70%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>

                {/* Left panel */}
                <div style={{
                    flex:"0 0 42%", position:"relative", overflow:"hidden",
                    background:"linear-gradient(160deg,#091a38 0%,#0d2040 60%,#0a1830 100%)",
                    display:"flex", flexDirection:"column", justifyContent:"center",
                    padding:"60px 56px",
                }}>
                    <div style={{ position:"absolute", inset:0 }}>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#5a8fb0 0%,#2a5070 35%,#0a2040 70%,#050f22 100%)", opacity:0.3 }}/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(5,15,34,0) 0%,rgba(5,15,34,0.9) 100%)", clipPath:"polygon(0% 100%,6% 55%,16% 72%,26% 30%,36% 58%,46% 15%,56% 48%,66% 33%,76% 62%,86% 38%,100% 58%,100% 100%)" }}/>
                    </div>
                    <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translate(-50%,-50%)", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,178,62,0.12),transparent 70%)" }}/>

                    <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ marginBottom:48 }}>
                            <SchoolLogo width={52} height={58} />
                            <h1 style={{ fontFamily:"Georgia,'Times New Roman',serif", color:"white", fontSize:"clamp(2rem,3vw,2.75rem)", fontWeight:700, lineHeight:1.2, marginTop:20 }}>
                                Join the<br/>
                                <span style={{ color:"#e2b23e" }}>Academia</span>
                                {" "}community
                            </h1>
                            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, lineHeight:1.7, marginTop:16, maxWidth:340 }}>
                                Create your account to access personalised learning, boarding resources, and school community features.
                            </p>
                        </div>

                        {/* Steps */}
                        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                            {[
                                { step:"01", label:"Create your account", desc:"Enter your school email and choose a secure password" },
                                { step:"02", label:"Select your role",     desc:"Are you a student or a staff member?" },
                                { step:"03", label:"Access the portal",    desc:"Sign in and explore your personalised dashboard" },
                            ].map(s => (
                                <div key={s.step} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(226,178,62,0.15)", border:"1px solid rgba(226,178,62,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#e2b23e", flexShrink:0 }}>{s.step}</div>
                                    <div>
                                        <div style={{ color:"rgba(255,255,255,0.85)", fontSize:14, fontWeight:600 }}>{s.label}</div>
                                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: form */}
                <div style={{
                    flex:1, display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    padding:"40px 24px", position:"relative", zIndex:1,
                    overflowY:"auto",
                }}>
                    <div style={{ width:"100%", maxWidth:460, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>

                        {/* Mobile logo */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36 }}>
                            <SchoolLogo width={44} height={50} />
                            <p style={{ fontFamily:"Georgia,serif", color:"white", fontSize:18, letterSpacing:"0.18em", margin:"8px 0 2px" }}>Academia</p>
                            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase" }}>Collège Alpin International</p>
                        </div>

                        {/* Card */}
                        <div style={{
                            background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
                            border:"1px solid rgba(255,255,255,0.1)", borderRadius:20,
                            padding:"40px 36px",
                        }}>
                            <h2 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"1.625rem", fontWeight:700, marginBottom:8 }}>Create Account</h2>
                            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginBottom:32 }}>
                                Already have an account?{" "}
                                <Link href="/login" style={{ color:"#1690d8", textDecoration:"none", fontWeight:600 }}>Sign in</Link>
                            </p>

                            <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:20 }}>

                                {/* Role selector */}
                                <div>
                                    <label style={{ display:"block", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:10, letterSpacing:"0.04em" }}>
                                        I am a
                                    </label>
                                    <div style={{ display:"flex", gap:10 }}>
                                        <button type="button" onClick={() => setRole("student")} className={`role-btn${role==="student"?" active":""}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                            Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("teacher")}
                                            className={`role-btn${role==="teacher"?" active":""}`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="1.8"
                                                 strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="12" rx="2"/>
                                                <path d="M8 20h8"/>
                                                <path d="M12 16v4"/>
                                            </svg>
                                            Teacher
                                        </button>
                                        <button type="button" onClick={() => setRole("staff")} className={`role-btn${role==="staff"?" active":""}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            Staff
                                        </button>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={{ display:"block", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:8, letterSpacing:"0.04em" }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email" value={email} onChange={e => { setEmail(e.target.value); clearError("email"); }}
                                        placeholder="you@school.edu" autoComplete="email"
                                        className={`field-input${errors.email ? " error" : ""}`}
                                    />
                                    {errors.email && <p style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label style={{ display:"block", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:8, letterSpacing:"0.04em" }}>
                                        Password
                                    </label>
                                    <div style={{ position:"relative" }}>
                                        <input
                                            type={showPass ? "text" : "password"} value={password}
                                            onChange={e => { setPassword(e.target.value); clearError("password"); }}
                                            placeholder="Create a strong password" autoComplete="new-password"
                                            className={`field-input${errors.password ? " error" : ""}`}
                                            style={{ paddingRight:48 }}
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4, display:"flex" }}>
                                            {showPass
                                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            }
                                        </button>
                                    </div>
                                    {errors.password && <p style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{errors.password}</p>}
                                    <PasswordStrength password={password} />
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label style={{ display:"block", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:8, letterSpacing:"0.04em" }}>
                                        Confirm Password
                                    </label>
                                    <div style={{ position:"relative" }}>
                                        <input
                                            type={showConfirm ? "text" : "password"} value={confirmPass}
                                            onChange={e => { setConfirmPass(e.target.value); clearError("confirmPass"); }}
                                            placeholder="Repeat your password" autoComplete="new-password"
                                            className={`field-input${errors.confirmPass ? " error" : ""}`}
                                            style={{ paddingRight:48 }}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4, display:"flex" }}>
                                            {showConfirm
                                                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            }
                                        </button>
                                    </div>
                                    {errors.confirmPass && <p style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{errors.confirmPass}</p>}
                                    {/* Match indicator */}
                                    {confirmPass && password && (
                                        <p style={{ fontSize:12, marginTop:6, color: password === confirmPass ? "#22c55e" : "#f87171", display:"flex", alignItems:"center", gap:4 }}>
                                            {password === confirmPass ? "? Passwords match" : "? Passwords do not match"}
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={isPending} className="submit-btn"
                                        style={{ background:"linear-gradient(135deg,#e2b23e,#b8860b)", color:"#06152e", marginTop:8 }}>
                                    {isPending
                                        ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                            Creating account…
                                          </span>
                                        : "Create Account"
                                    }
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:24, lineHeight:1.6 }}>
                            By registering, you agree to our{" "}
                            <a href="#" style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}