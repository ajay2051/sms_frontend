"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo.png";

function SchoolLogo({ width = 40, height = 45 }: { width?: number; height?: number }) {
    return <Image src={LOGO_SRC} alt="School logo" width={width} height={height} style={{ objectFit: "contain" }} />;
}

// Animated mountain SVG illustration
function MountainScene() {
    return (
        <svg width="100%" viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg"
             style={{ maxWidth: 560, display:"block", margin:"0 auto" }}>
            {/* Sky gradient */}
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0e2550" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#091a38" stopOpacity="0.6"/>
                </linearGradient>
                <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a5878"/>
                    <stop offset="100%" stopColor="#0a1830"/>
                </linearGradient>
                <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a3a5c"/>
                    <stop offset="100%" stopColor="#060f20"/>
                </linearGradient>
                <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ddeeff"/>
                    <stop offset="100%" stopColor="#9bbdd4"/>
                </linearGradient>
            </defs>

            <rect width="600" height="220" fill="url(#sky)"/>

            {/* Far mountains */}
            <polygon points="0,180 60,80 120,130 200,50 280,110 360,40 440,100 520,60 600,120 600,220 0,220" fill="url(#mtn1)" opacity="0.6"/>
            {/* Near mountains */}
            <polygon points="0,220 80,100 160,150 260,60 360,120 460,70 560,130 600,110 600,220" fill="url(#mtn2)" opacity="0.85"/>

            {/* Snow caps */}
            <polygon points="260,60 240,90 280,90" fill="url(#snow)" opacity="0.7"/>
            <polygon points="360,40 335,78 385,78" fill="url(#snow)" opacity="0.65"/>
            <polygon points="80,100 62,128 98,128" fill="url(#snow)" opacity="0.5"/>

            {/* Summit cross on tallest peak */}
            <line x1="360" y1="40" x2="360" y2="22" stroke="rgba(240,220,160,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="353" y1="28" x2="367" y2="28" stroke="rgba(240,220,160,0.8)" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Tiny building at base */}
            <rect x="270" y="166" width="60" height="38" fill="rgba(200,220,240,0.3)" rx="2"/>
            <rect x="285" y="158" width="30" height="46" fill="rgba(180,205,225,0.25)" rx="2"/>
            {/* Spire */}
            <polygon points="285,158 300,142 315,158" fill="rgba(140,170,195,0.4)"/>
            {/* Door */}
            <rect x="293" y="184" width="14" height="20" rx="7" fill="rgba(10,30,60,0.5)"/>

            {/* Trees */}
            {[230,245,325,340].map((x, i) => (
                <g key={i}>
                    <polygon points={`${x},190 ${x-7},210 ${x+7},210`} fill="rgba(20,50,40,0.7)"/>
                    <polygon points={`${x},200 ${x-5},216 ${x+5},216`} fill="rgba(15,40,30,0.6)"/>
                </g>
            ))}

            {/* 404 text embedded in scene */}
            <text x="300" y="100" textAnchor="middle" fill="rgba(255,255,255,0.06)"
                  fontSize="120" fontWeight="900" fontFamily="Georgia,serif" letterSpacing="-4">
                404
            </text>

            {/* Fog at base */}
            <rect x="0" y="190" width="600" height="30" fill="url(#sky)" opacity="0.5"/>
        </svg>
    );
}

// Quick links for navigation
const QUICK_LINKS = [
    { href:"/",            label:"Home",        icon:"🏠" },
    { href:"/login",       label:"Sign In",     icon:"🔑" },
    { href:"/register",    label:"Register",    icon:"📝" },
    { href:"/#admissions", label:"Admissions",  icon:"🎓" },
    { href:"/#boarding",   label:"Boarding",    icon:"🏔️" },
    { href:"/#academic",   label:"Academic",    icon:"📚" },
];

export default function NotFoundPage() {
    const [path, setPath] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [count, setCount] = useState(10);
    const [autoRedirect, setAutoRedirect] = useState(false);

    useEffect(() => {
        setPath(window.location.pathname);
    }, []);

    // Optional auto-redirect countdown (disabled by default — user can enable)
    useEffect(() => {
        if (!autoRedirect) return;
        if (count <= 0) { window.location.href = "/"; return; }
        const t = setTimeout(() => setCount(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [autoRedirect, count]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <>
            <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glitch1  { 0%,100%{clip-path:inset(0 0 95% 0)} 20%{clip-path:inset(10% 0 60% 0)} 40%{clip-path:inset(40% 0 30% 0)} 60%{clip-path:inset(70% 0 10% 0)} 80%{clip-path:inset(85% 0 5% 0)} }
        @keyframes glitch2  { 0%,100%{clip-path:inset(80% 0 5% 0);transform:translateX(-4px)} 20%{clip-path:inset(50% 0 30% 0);transform:translateX(4px)} 50%{clip-path:inset(20% 0 65% 0);transform:translateX(-2px)} 80%{clip-path:inset(5% 0 85% 0);transform:translateX(2px)} }
        .nav-link { color:rgba(255,255,255,0.5); text-decoration:none; font-size:14px; display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); transition:all 0.2s; }
        .nav-link:hover { color:white; background:rgba(22,144,216,0.12); border-color:rgba(22,144,216,0.3); transform:translateY(-1px); }
        .home-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,144,216,0.4); }
        .back-btn:hover { background:rgba(255,255,255,0.08)!important; border-color:rgba(255,255,255,0.25)!important; color:white!important; }
        .search-input { width:100%; padding:12px 48px 12px 16px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:white; font-size:14px; outline:none; transition:border-color 0.2s,background 0.2s; box-sizing:border-box; }
        .search-input::placeholder { color:rgba(255,255,255,0.3); }
        .search-input:focus { border-color:#1690d8; background:rgba(255,255,255,0.09); }
      `}</style>

            <main style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg,#050f22 0%,#091a38 40%,#0e2550 70%,#0c1e3a 100%)",
                display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
            }}>
                {/* Background grid */}
                <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>
                {/* Glow orbs */}
                <div style={{ position:"absolute", top:"-10%", right:"-5%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,144,216,0.1),transparent 65%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:"-10%", left:"-5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,178,62,0.07),transparent 65%)", pointerEvents:"none" }}/>

                {/* Minimal navbar */}
                <nav style={{
                    position:"relative", zIndex:10, display:"flex", alignItems:"center",
                    justifyContent:"space-between", padding:"20px 40px",
                    borderBottom:"1px solid rgba(255,255,255,0.06)",
                }}>
                    <Link href="/" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
                        <SchoolLogo />
                        <div>
                            <p style={{ fontFamily:"Georgia,serif", color:"white", fontSize:16, letterSpacing:"0.16em", margin:0 }}>Academia</p>
                            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:8, letterSpacing:"0.2em", textTransform:"uppercase", margin:"2px 0 0" }}>Collège Alpin International</p>
                        </div>
                    </Link>
                    <Link href="/login">
                        <button style={{ padding:"9px 22px", border:"1.5px solid rgba(255,255,255,0.25)", borderRadius:999, background:"transparent", color:"rgba(255,255,255,0.75)", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                        >Sign In</button>
                    </Link>
                </nav>

                {/* Main content */}
                <div style={{
                    flex:1, display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", padding:"40px 24px", position:"relative", zIndex:1,
                }}>

                    {/* Mountain illustration */}
                    <div style={{ width:"100%", maxWidth:560, marginBottom:8, animation:"float 6s ease-in-out infinite" }}>
                        <MountainScene />
                    </div>

                    {/* 404 number with glitch effect */}
                    <div style={{ position:"relative", marginBottom:16, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
                        <h1 style={{
                            fontFamily:"Georgia,'Times New Roman',serif",
                            fontSize:"clamp(5rem,15vw,9rem)", fontWeight:900,
                            color:"rgba(255,255,255,0.9)", lineHeight:1, margin:0,
                            letterSpacing:"-0.04em", position:"relative",
                        }}>
                            404
                            {/* Glitch layers */}
                            <span aria-hidden style={{ position:"absolute", inset:0, color:"#1690d8", animation:"glitch1 4s infinite linear", opacity:0.7 }}>404</span>
                            <span aria-hidden style={{ position:"absolute", inset:0, color:"#e2b23e", animation:"glitch2 4s infinite linear 2s", opacity:0.5 }}>404</span>
                        </h1>
                    </div>

                    {/* Text */}
                    <div style={{ textAlign:"center", maxWidth:480, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
                        <h2 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"clamp(1.25rem,3vw,1.75rem)", fontWeight:700, marginBottom:12, lineHeight:1.3 }}>
                            Lost in the Alps?
                        </h2>
                        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15, lineHeight:1.75, marginBottom:8 }}>
                            The page you're looking for has gone off-piste. It may have been moved, deleted, or perhaps it never existed.
                        </p>
                        {path && (
                            <p style={{ color:"rgba(22,144,216,0.7)", fontSize:13, fontFamily:"monospace", marginBottom:32, wordBreak:"break-all" }}>
                                {path}
                            </p>
                        )}
                    </div>

                    {/* Search box */}
                    <div style={{ width:"100%", maxWidth:400, marginBottom:36, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
                        <form onSubmit={handleSearch} style={{ position:"relative" }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search for a page…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" style={{
                                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                                background:"none", border:"none", cursor:"pointer",
                                color:"rgba(255,255,255,0.4)", display:"flex", padding:4,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="7.5"/><line x1="17" y1="17" x2="22" y2="22"/>
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* CTA buttons */}
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:48, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}>
                        <Link href="/" style={{ textDecoration:"none" }}>
                            <button className="home-btn" style={{
                                padding:"13px 32px", borderRadius:12, border:"none",
                                background:"linear-gradient(135deg,#1690d8,#0d75bd)",
                                color:"white", fontSize:14, fontWeight:700,
                                letterSpacing:"0.1em", textTransform:"uppercase",
                                cursor:"pointer", transition:"all 0.3s",
                                display:"flex", alignItems:"center", gap:8,
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Back to Home
                            </button>
                        </Link>
                        <button
                            className="back-btn"
                            onClick={() => window.history.back()}
                            style={{
                                padding:"13px 28px", borderRadius:12,
                                border:"1.5px solid rgba(255,255,255,0.15)",
                                background:"rgba(255,255,255,0.04)",
                                color:"rgba(255,255,255,0.65)", fontSize:14, fontWeight:600,
                                cursor:"pointer", transition:"all 0.2s",
                                display:"flex", alignItems:"center", gap:8,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            Go Back
                        </button>
                    </div>

                    {/* Quick links */}
                    <div style={{ width:"100%", maxWidth:560, animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}>
                        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center", marginBottom:16 }}>
                            Or explore these pages
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                            {QUICK_LINKS.map(link => (
                                <Link key={link.href} href={link.href} className="nav-link">
                                    <span style={{ fontSize:16 }}>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Auto-redirect option */}
                    <div style={{ marginTop:36, textAlign:"center", animation:"fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}>
                        {!autoRedirect ? (
                            <button
                                onClick={() => setAutoRedirect(true)}
                                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:12, cursor:"pointer", textDecoration:"underline", textDecorationColor:"rgba(255,255,255,0.15)" }}
                            >
                                Auto-redirect me to home
                            </button>
                        ) : (
                            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13, display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
                                <div style={{
                                    width:28, height:28, borderRadius:"50%",
                                    border:"2px solid rgba(22,144,216,0.4)",
                                    borderTopColor:"#1690d8",
                                    animation:"spin 1s linear infinite",
                                }}/>
                                Redirecting to home in <span style={{ color:"#1690d8", fontWeight:700 }}>{count}s</span>
                                <button onClick={() => setAutoRedirect(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:12, textDecoration:"underline" }}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    position:"relative", zIndex:1, textAlign:"center",
                    padding:"20px 40px", borderTop:"1px solid rgba(255,255,255,0.06)",
                }}>
                    <p style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>
                        Need help? Contact{" "}
                        <a href="mailto:info@academia.ch" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>info@academia.ch</a>
                        {" "}· Error code: 404 Page Not Found
                    </p>
                </div>

                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </main>
        </>
    );
}