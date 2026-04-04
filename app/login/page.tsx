"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo.png";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

function SchoolLogo({ width = 46, height = 52 }: { width?: number; height?: number }) {
    return <Image src={LOGO_SRC} alt="School logo" width={width} height={height} style={{ objectFit: "contain" }} />;
}

// ── Toast notification ─────────────────────────────────────────────
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
            maxWidth: 360,
        }}>
            {type === "success"
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {message}
        </div>
    );
}

export default function SignInPage() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [toast, setToast]       = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
        if (!password) e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}${API_VERSION}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = data?.detail || data?.non_field_errors?.[0] || data?.email?.[0] || "Invalid credentials";
                showToast(msg, "error");
                return;
            }
            // Save to localStorage
            localStorage.setItem("access_token",  data.access);
            localStorage.setItem("refresh_token", data.refresh);
            localStorage.setItem("user",          JSON.stringify(data.user));
            showToast(data.message || "Successfully Logged In", "success");
            setTimeout(() => {
                if (data.user?.role === "staff") {
                    window.location.href = "/dashboard";
                } else {
                    window.location.href = "/";
                }
            }, 1500);        } catch {
            showToast("Unable to connect to server. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .field-input { width:100%; padding:13px 16px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:white; font-size:15px; outline:none; transition:border-color 0.2s,background 0.2s; box-sizing:border-box; }
        .field-input::placeholder { color:rgba(255,255,255,0.35); }
        .field-input:focus { border-color:#1690d8; background:rgba(255,255,255,0.09); }
        .field-input.error { border-color:#ef4444; }
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
                <div style={{ position:"absolute", top:"-15%", right:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,144,216,0.12),transparent 70%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:"-10%", left:"-8%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,178,62,0.08),transparent 70%)",  pointerEvents:"none" }}/>
                <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>

                {/* Left decorative panel */}
                <div style={{
                    flex:"0 0 42%", position:"relative", overflow:"hidden",
                    background:"linear-gradient(160deg,#091a38 0%,#0d2040 60%,#0a1830 100%)",
                    display:"flex", flexDirection:"column", justifyContent:"center",
                    padding:"60px 56px",
                }} className="hidden lg:flex">
                    {/* Mountain silhouette */}
                    <div style={{ position:"absolute", inset:0 }}>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#87a5bb 0%,#4a7090 35%,#2a5070 60%,#0a1830 100%)", opacity:0.25 }}/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(20,50,90,0) 0%,rgba(5,15,35,0.95) 100%)", clipPath:"polygon(0% 100%,8% 50%,18% 70%,28% 25%,38% 55%,48% 10%,58% 45%,68% 30%,78% 60%,88% 35%,100% 55%,100% 100%)" }}/>
                    </div>
                    {/* Glow orb */}
                    <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,144,216,0.18),transparent 70%)" }}/>

                    <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ marginBottom:48 }}>
                            <SchoolLogo width={52} height={58} />
                            <h1 style={{ fontFamily:"Georgia,'Times New Roman',serif", color:"white", fontSize:"clamp(2rem,3vw,2.75rem)", fontWeight:700, lineHeight:1.2, marginTop:20, marginBottom:0 }}>
                                Welcome back to<br/>
                                <span style={{ color:"#e2b23e" }}>Academia</span>
                            </h1>
                            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, lineHeight:1.7, marginTop:16, maxWidth:340 }}>
                                Sign in to access your school portal, academic records, and community resources.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                            {[
                                { icon:"📚", label:"Academic records & grades" },
                                { icon:"🏔️", label:"Boarding & house management" },
                                { icon:"📅", label:"Schedule & term dates" },
                                { icon:"💳", label:"Online payments" },
                            ].map((f) => (
                                <div key={f.label} style={{ display:"flex", alignItems:"center", gap:14 }}>
                                    <div style={{ width:36, height:36, borderRadius:10, background:"rgba(22,144,216,0.15)", border:"1px solid rgba(22,144,216,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{f.icon}</div>
                                    <span style={{ color:"rgba(255,255,255,0.7)", fontSize:14 }}>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: form panel */}
                <div style={{
                    flex:1, display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    padding:"40px 24px", position:"relative", zIndex:1,
                }}>
                    <div style={{ width:"100%", maxWidth:440, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>

                        {/* Mobile logo */}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:40 }}>
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
                            <h2 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"1.625rem", fontWeight:700, marginBottom:8 }}>Sign In</h2>
                            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginBottom:32 }}>
                                Don't have an account?{" "}
                                <Link href="/register" style={{ color:"#1690d8", textDecoration:"none", fontWeight:600 }}>
                                    Create one
                                </Link>
                            </p>

                            <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:20 }}>
                                {/* Email */}
                                <div>
                                    <label style={{ display:"block", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:8, letterSpacing:"0.04em" }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                                        placeholder="you@example.com" autoComplete="email"
                                        className={`field-input${errors.email ? " error" : ""}`}
                                    />
                                    {errors.email && <p style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                                        <label style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, letterSpacing:"0.04em" }}>
                                            Password
                                        </label>
                                        <Link href="/forgot-password" style={{ color:"#1690d8", fontSize:13, textDecoration:"none" }}>
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div style={{ position:"relative" }}>
                                        <input
                                            type={showPass ? "text" : "password"} value={password}
                                            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                                            placeholder="••••••••" autoComplete="current-password"
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
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={loading} className="submit-btn"
                                        style={{ background:"linear-gradient(135deg,#1690d8,#0d75bd)", color:"white", marginTop:8 }}>
                                    {loading
                                        ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Signing in…
                      </span>
                                        : "Sign In"
                                    }
                                </button>
                            </form>

                            {/* Divider */}
                            <div style={{ display:"flex", alignItems:"center", gap:16, margin:"28px 0" }}>
                                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
                                <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>or continue with</span>
                                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
                            </div>

                            {/* Social buttons */}
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                {[
                                    { name:"Google", icon:"G" },
                                    { name:"Microsoft", icon:"M" },
                                ].map(s => (
                                    <button key={s.name} style={{ padding:"11px 16px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                                    >
                                        <span style={{ width:20, height:20, borderRadius:4, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{s.icon}</span>
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <p style={{ textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:12, marginTop:24, lineHeight:1.6 }}>
                            By signing in, you agree to our{" "}
                            <a href="#" style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>Privacy Policy</a>
                        </p>
                    </div>
                </div>

                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </main>
        </>
    );
}