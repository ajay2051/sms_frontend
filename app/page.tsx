"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {apiFetch} from "@/lib/apiFetch";

const LOGO_SRC    = "/logo.png";
const HERO_BG_SRC = "/school_bg.jpg";

const NAV_TABS = ["HOME", "ACADEMIC", "BOARDING", "CO-CURRICULAR"] as const;
type NavTab = typeof NAV_TABS[number];

const TAB_SECTION_MAP: Record<NavTab, string> = {
    HOME:            "section-hero",
    ACADEMIC:        "section-academic",
    BOARDING:        "section-boarding",
    "CO-CURRICULAR": "section-cocurricular",
};

interface ProfileData {
    full_name:   string;
    email:       string;
    profile_pic: string | null;
}

function SchoolLogo({ width = 46, height = 52 }: { width?: number; height?: number }) {
    return <Image src={LOGO_SRC} alt="School logo" width={width} height={height} style={{ objectFit: "contain" }} />;
}

function Crest({ size = 52 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size, borderRadius: size * 0.2, background: "linear-gradient(135deg,#e2b23e,#b8860b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Image src={LOGO_SRC} alt="Crest" width={size * 0.75} height={size * 0.75} style={{ objectFit: "contain" }} />
        </div>
    );
}

function AccentBar() {
    return <div style={{ width: 40, height: 3, borderRadius: 2, marginBottom: 12, background: "linear-gradient(90deg,#e8b84b,#38a9eb)" }} />;
}

function SlideBtns() {
    return (
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            {["Uncover", "Find Out More"].map(label => (
                <button key={label}
                        style={{ border: "1.5px solid rgba(255,255,255,0.5)", color: "white", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 20px", borderRadius: 999, background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "white"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                >{label}</button>
            ))}
        </div>
    );
}

/* ── Profile dropdown ───────────────────────────────────────────────────── */
function ProfileDropdown({ profile, onSignOut }: { profile: ProfileData; onSignOut: () => void }) {
    const [open, setOpen] = useState(false);
    const ref             = useRef<HTMLDivElement>(null);
    const router          = useRouter();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const initials = (name: string) =>
        name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();

    const Avatar = ({ size }: { size: number }) => (
        <div style={{
            width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
            background: "rgba(22,144,216,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            {profile.profile_pic
                ? <img src={profile.profile_pic} alt={profile.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ color: "white", fontSize: size * 0.28, fontWeight: 700, letterSpacing: "0.04em" }}>{initials(profile.full_name)}</span>
            }
        </div>
    );

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    width: 38, height: 38, borderRadius: "50%", padding: 0, cursor: "pointer", overflow: "hidden",
                    border: `2px solid ${open ? "#facc15" : "rgba(255,255,255,0.55)"}`,
                    background: "none", transition: "border-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#facc15")}
                onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; }}
            >
                <Avatar size={34} />
            </button>

            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 12px)", right: 0, minWidth: 220,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.6)", overflow: "hidden",
                    animation: "ddIn 0.14s ease forwards", zIndex: 200,
                }}>
                    {/* User info */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ border: "1.5px solid rgba(255,255,255,0.18)", borderRadius: "50%", flexShrink: 0 }}>
                            <Avatar size={36} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ color: "white", fontSize: "0.82rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.full_name}</p>
                            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.68rem", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.email}</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <div style={{ padding: "6px 0" }}>
                        <button
                            onClick={() => { setOpen(false); router.push("/profile"); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit Profile
                        </button>

                        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

                        <button
                            onClick={() => { setOpen(false); onSignOut(); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", color: "rgba(248,113,113,0.85)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.07)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.65)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes ddIn {
                    from { opacity:0; transform:translateY(-6px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function HomePage() {
    const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

    const [activeLang,  setActiveLang]  = useState<"EN"|"FR">("EN");
    const [activeTab,   setActiveTab]   = useState<NavTab>("HOME");
    const [navScrolled, setNavScrolled] = useState(false);
    const [isLoggedIn,  setIsLoggedIn]  = useState(false);
    const [profile,     setProfile]     = useState<ProfileData | null>(null);

    /* Fetch profile once on mount if logged in */
    // In HomePage — replace the fetch block inside useEffect
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        setIsLoggedIn(true);

        apiFetch(
            "/student/profile/",
            {},
            () => { setIsLoggedIn(false); setProfile(null); }   // called before redirect
        )
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(json => {
                const d = json?.data;
                if (d) setProfile({ full_name: d.full_name, email: d.email, profile_pic: d.profile_pic ?? null });
            })
            .catch(() => {});
    }, []);

    /* Scroll listener for nav + active tab */
    useEffect(() => {
        const fn = () => {
            setNavScrolled(window.scrollY > 60);
            const tabs = Object.entries(TAB_SECTION_MAP) as [NavTab, string][];
            for (let i = tabs.length - 1; i >= 0; i--) {
                const el = document.getElementById(tabs[i][1]);
                if (el && window.scrollY >= el.offsetTop - 200) { setActiveTab(tabs[i][0]); break; }
            }
        };
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const handleTabClick = (tab: NavTab) => {
        setActiveTab(tab);
        document.getElementById(TAB_SECTION_MAP[tab])?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    function handleSignOut() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setProfile(null);
    }

    return (
        <>
            {/* ── FIXED NAVBAR ─────────────────────────────────── */}
            <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:72, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:navScrolled?"rgba(9,26,56,0.96)":"transparent", backdropFilter:navScrolled?"blur(12px)":"none", boxShadow:navScrolled?"0 2px 24px rgba(0,0,0,0.25)":"none", transition:"background 0.35s,box-shadow 0.35s" }}>

                {/* Lang toggle */}
                <div style={{ display:"flex", gap:10 }}>
                    {(["EN","FR"] as const).map(lang => (
                        <button key={lang} onClick={() => setActiveLang(lang)} style={{ background:"none", border:"none", borderBottom:activeLang===lang?"2px solid #facc15":"2px solid transparent", padding:"2px 2px 3px", color:activeLang===lang?"white":"rgba(255,255,255,0.5)", fontSize:11, fontWeight:700, letterSpacing:"0.15em", cursor:"pointer" }}>{lang}</button>
                    ))}
                </div>

                {/* Centre logo */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <SchoolLogo width={40} height={44} />
                    <p style={{ fontFamily:"Georgia,serif", color:"white", fontSize:17, letterSpacing:"0.18em", margin:"4px 0 0" }}>Academia</p>
                    <p style={{ color:"rgba(255,255,255,0.5)", fontSize:8, letterSpacing:"0.22em", textTransform:"uppercase", margin:"2px 0 0" }}>Collège Alpin International</p>
                </div>

                {/* Right side */}
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    {isLoggedIn && (
                        <>
                            <Link href="/admissions" style={{ color:"rgba(255,255,255,0.85)", fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", textDecoration:"none", padding:"6px 0", borderBottom:"1.5px solid transparent", transition:"all 0.2s" }}
                                  onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#facc15")}
                                  onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
                            >ONLINE ADMISSION</Link>
                            <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>|</span>
                            <Link href="/fee" style={{ color:"rgba(255,255,255,0.85)", fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", textDecoration:"none", padding:"6px 0", borderBottom:"1.5px solid transparent", transition:"all 0.2s" }}
                                  onMouseEnter={e => (e.currentTarget.style.borderBottomColor = "#facc15")}
                                  onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
                            >ONLINE FEE PAYMENT</Link>
                            <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>|</span>
                        </>
                    )}

                    {isLoggedIn ? (
                        profile
                            ? <ProfileDropdown profile={profile} onSignOut={handleSignOut} />
                            : <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"2px solid rgba(255,255,255,0.2)" }} />
                    ) : (
                        <Link href="/login">
                            <button style={{ padding:"10px 28px", border:"1.5px solid rgba(255,255,255,0.85)", borderRadius:999, background:"transparent", color:"white", fontSize:10, fontWeight:700, letterSpacing:"0.2em", cursor:"pointer", transition:"all 0.3s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background="white"; e.currentTarget.style.color="#111"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="white"; }}
                            >SIGN IN</button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* ── FIXED EXPLORE TAB BAR ────────────────────────── */}
            <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:90, background:"rgba(9,26,56,0.92)", backdropFilter:"blur(10px)", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", padding:"14px 32px" }}>
                <span style={{ color:"rgba(255,255,255,0.45)", fontSize:10, letterSpacing:"0.32em", textTransform:"uppercase", marginRight:40, fontWeight:500, flexShrink:0 }}>EXPLORE</span>
                <div style={{ display:"flex", alignItems:"center" }}>
                    {NAV_TABS.map((tab, i) => (
                        <div key={tab} style={{ display:"flex", alignItems:"center" }}>
                            {i > 0 && <div style={{ height:1, width:50, margin:"0 8px", background:"linear-gradient(to right,rgba(200,168,75,0.25),rgba(200,168,75,0.65),rgba(200,168,75,0.25))" }} />}
                            <a href={`#${TAB_SECTION_MAP[tab]}`}
                               onClick={e => { e.preventDefault(); handleTabClick(tab); }}
                               style={{ display:"inline-block", padding:"9px 24px", borderRadius:999, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.25s", fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", textDecoration:"none", border:activeTab===tab?"1.5px solid white":"1.5px solid rgba(255,255,255,0.35)", background:activeTab===tab?"white":"transparent", color:activeTab===tab?"#111827":"rgba(255,255,255,0.78)" }}
                               onMouseEnter={e => { if (activeTab!==tab) { (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(255,255,255,0.7)"; (e.currentTarget as HTMLAnchorElement).style.color="white"; } }}
                               onMouseLeave={e => { if (activeTab!==tab) { (e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(255,255,255,0.35)"; (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,0.78)"; } }}
                            >{tab}</a>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PAGE SECTIONS ────────────────────────────────── */}
            <main style={{ paddingBottom:72 }}>

                {/* HERO */}
                <section id="section-hero" style={{ position:"relative", height:"100vh", overflow:"hidden" }}>
                    <Image src={HERO_BG_SRC} alt="School campus" fill priority unoptimized style={{ objectFit:"cover", objectPosition:"center" }} />
                    <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(to bottom,rgba(0,0,0,0.22) 0%,transparent 40%,rgba(0,0,0,0.48) 100%)" }} />
                    <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(to right,rgba(0,0,0,0.1),transparent,rgba(0,0,0,0.1))" }} />
                    <div style={{ position:"absolute", right:24, top:"50%", transform:"translateY(-50%)", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                        <button style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.75)", padding:4 }}>
                            <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 20L8 2M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.75)", padding:4 }}>
                            <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 2L8 20M2 14L8 20L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                    </div>
                    <div style={{ position:"absolute", bottom:96, left:20, zIndex:10 }}>
                        <button style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.18)", backdropFilter:"blur(6px)", border:"1px solid rgba(255,255,255,0.4)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </button>
                    </div>
                </section>

                {/* INTRO + SUMMER CAMP */}
                <section style={{ display:"grid", gridTemplateColumns:"1fr 340px" }}>
                    <div style={{ background:"white", padding:"88px 80px" }}>
                        <h2 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(1.6rem,2.8vw,2.2rem)", fontWeight:700, color:"#0c2044", lineHeight:1.3, marginBottom:36, maxWidth:680 }}>One of the leading private boarding schools in Switzerland, Academia is home to a thriving international community of students aged 11 to 18.</h2>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, marginBottom:32, fontSize:"0.9375rem", lineHeight:1.8, color:"#4a5568" }}>
                            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                                <p>Founded in 1910, Academia has long been regarded as one of Switzerland's finest private boarding schools.</p>
                                <p>Uniquely located in a beautiful alpine village high in the Swiss Alps, Academia is a safe, inspiring, and exciting place to learn.</p>
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                                <p>Life-changing opportunities develop a breadth of skills, attributes, and experiences.</p>
                                <p>Inspired by passionate teachers and a caring community, our students gain outstanding academic results.</p>
                            </div>
                        </div>
                        <button style={{ border:"1.5px solid #10295a", color:"#10295a", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"12px 24px", borderRadius:999, background:"transparent", cursor:"pointer" }}
                                onMouseEnter={e => { e.currentTarget.style.background="#10295a"; e.currentTarget.style.color="white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#10295a"; }}
                        >Find Out More</button>
                    </div>
                    <div style={{ background:"#1690d8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"40px 32px", position:"relative", overflow:"hidden" }}>
                        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
                        <h3 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"1.625rem", fontWeight:700, color:"white", textAlign:"center", lineHeight:1.3, position:"relative", zIndex:1 }}>Summer Camps at Academia</h3>
                        <button style={{ background:"#c9700e", color:"white", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"12px 24px", borderRadius:999, border:"none", cursor:"pointer", position:"relative", zIndex:1 }}>Discover</button>
                    </div>
                </section>

                {/* ACADEMIC */}
                {/* ACADEMIC */}
                <section id="section-academic" style={{ position:"relative", minHeight:"100vh", overflow:"hidden", background:"#1690d8" }}>
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"58%", overflow:"hidden" }}>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#1a3a5c 0%,#2d6a9f 40%,#1a8fd1 70%,#3caee8 100%)" }}/>
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", userSelect:"none" }}>
                            <span style={{ fontFamily:"Georgia,serif", fontWeight:700, lineHeight:0.8, color:"rgba(56,169,235,0.6)", letterSpacing:"-0.05em", fontSize:"clamp(12rem,20vw,17rem)" }}>"</span>
                        </div>
                        <div style={{ position:"absolute", bottom:80, left:32, right:32, display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:10, transform:"perspective(900px) rotateY(5deg)" }}>
                            {[56,72,62,80,58,74,66,84,70,60,76,64,82,68,72,88].map((h,i) => (
                                <div key={i} style={{ position:"relative", width:44, height:h, flexShrink:0, borderRadius:"22px 22px 4px 4px", background:i%3===0?"#1a3a6c":i%3===1?"#2a5080":"#3a6090" }}>
                                    <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"16px solid transparent", borderRight:"16px solid transparent", borderBottom:"14px solid #e2b23e" }}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"42%", display:"flex", alignItems:"center", paddingLeft:32, paddingRight:80, color:"white", textAlign:"right" }}>
                        <div>
                            <span style={{ display:"block", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:12 }}>Learning at Academia</span>
                            <h2 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(2rem,3.5vw,2.75rem)", fontWeight:700, lineHeight:1.15, marginBottom:20 }}>Unlocking passion and potential</h2>
                            <p style={{ fontSize:"0.9375rem", lineHeight:1.75, color:"rgba(255,255,255,0.8)", marginBottom:32 }}>At Academia, every student's education is unique to them. Personalised to individual passions and ambitions, our globally respected academic programmes engage, motivate, and inspire our learners to excel.</p>
                            <SlideBtns />
                        </div>
                    </div>
                </section>

                {/* BOARDING */}
                {/* BOARDING */}
                <section id="section-boarding" style={{ position:"relative", minHeight:"100vh", overflow:"hidden", background:"linear-gradient(160deg,#091a38 0%,#0e2550 60%,#153066 100%)" }}>
                    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"55%", overflow:"hidden" }}>
                        <svg style={{ position:"absolute", left:"4%", top:0, height:"100%", width:"42%", opacity:0.5 }} viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <path d="M100 10 Q130 80 170 100 Q210 120 185 150 Q220 185 195 215 Q225 255 185 285 Q215 325 175 360 Q205 405 165 440 L135 440 L135 380 L145 380 L145 355 L105 355 L105 440 L75 440 L75 380 L85 380 L85 355 L65 355 Q25 405 35 440 L25 440 Q-15 400 10 360 Q-20 320 20 290 Q-10 255 30 225 Q-5 190 35 165 Q10 130 55 110 Q30 75 80 50Z" fill="#163470" opacity="0.9"/>
                            <ellipse cx="100" cy="60" rx="38" ry="27" fill="#1a4070" opacity="0.7"/>
                            <ellipse cx="158" cy="128" rx="30" ry="22" fill="#163870" opacity="0.65"/>
                            <ellipse cx="48" cy="142" rx="34" ry="24" fill="#1a4070" opacity="0.65"/>
                        </svg>
                        <div style={{ position:"absolute", right:"4%", top:"18%", bottom:"18%", width:"40%", display:"flex", flexDirection:"column", gap:16, justifyContent:"center" }}>
                            {[{bg:"linear-gradient(135deg,#2d6a9f,#1a8fd1)",w:"92%",ml:"0%"},{bg:"linear-gradient(135deg,#e2b23e,#c9700e)",w:"85%",ml:"7%"},{bg:"linear-gradient(135deg,#9a3a7a,#6a1a5a)",w:"78%",ml:"12%"}].map((s,i) => (
                                <div key={i} style={{ height:68, borderRadius:4, overflow:"hidden", background:s.bg, transform:"skewX(-3deg)", width:s.w, marginLeft:s.ml }}/>
                            ))}
                        </div>
                    </div>
                    <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"45%", display:"flex", alignItems:"center", paddingLeft:32, paddingRight:80, color:"white", textAlign:"right" }}>
                        <div>
                            <span style={{ display:"block", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:12 }}>Boarding at Academia</span>
                            <h2 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(2rem,3.5vw,2.75rem)", fontWeight:700, lineHeight:1.15, marginBottom:20 }}>A home away from home</h2>
                            <p style={{ fontSize:"0.9375rem", lineHeight:1.75, color:"rgba(255,255,255,0.8)", marginBottom:32 }}>Community is at the heart of the Academia boarding experience. Each of our six houses is a warm and welcoming home away from home.</p>
                            <SlideBtns />
                        </div>
                    </div>
                </section>

                {/* CO-CURRICULAR */}
                {/* CO-CURRICULAR */}
                <section id="section-cocurricular" style={{ position:"relative", minHeight:"100vh", overflow:"hidden", background:"#091a38" }}>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#87a5bb 0%,#6a8fa8 25%,#4a7090 50%,#2a5070 75%,#0a2040 100%)" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#3a5a6a 0%,#1e3540 100%)", clipPath:"polygon(0% 100%,8% 50%,18% 70%,28% 25%,38% 55%,48% 10%,58% 45%,68% 30%,78% 60%,88% 35%,100% 55%,100% 100%)" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 0%,#0a2030 100%)", clipPath:"polygon(0% 100%,5% 68%,14% 78%,22% 52%,30% 72%,40% 44%,50% 68%,60% 50%,70% 72%,80% 52%,90% 70%,100% 58%,100% 100%)" }}/>
                    <div style={{ position:"absolute", bottom:"51%", left:"33%" }}>
                        <div style={{ width:3, height:40, background:"rgba(240,220,160,0.85)", margin:"0 auto" }}/>
                        <div style={{ height:3, width:24, background:"rgba(240,220,160,0.85)", marginTop:-28, marginLeft:-10 }}/>
                    </div>
                    <div style={{ position:"absolute", bottom:"42%", left:"18%", display:"flex", alignItems:"flex-end", gap:12 }}>
                        {[{body:"#1a3a6c",skin:"#8a7060",h:36},{body:"#3a5a8a",skin:"#7a6050",h:30},{body:"#4a7a9a",skin:"#9a8070",h:40},{body:"#3a6090",skin:"#6a5040",h:28},{body:"#2a5888",skin:"#8a7060",h:38}].map((f,i) => (
                            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                                <div style={{ width:16, height:16, borderRadius:"50%", background:f.skin, marginBottom:2 }}/>
                                <div style={{ width:14, height:f.h, borderRadius:2, background:f.body }}/>
                                <div style={{ display:"flex", gap:2, marginTop:2 }}>
                                    <div style={{ width:5, height:16, borderRadius:2, background:"#1e1e50" }}/>
                                    <div style={{ width:5, height:16, borderRadius:2, background:"#1e1e50" }}/>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ position:"absolute", top:"-8%", right:"-8%", width:320, height:320, borderRadius:"50%", background:"linear-gradient(135deg,rgba(30,80,140,0.6),rgba(20,50,100,0.4))", border:"2px solid rgba(100,160,210,0.2)" }}/>
                    <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"44%", display:"flex", alignItems:"center", paddingLeft:32, paddingRight:80, color:"white", textAlign:"right" }}>
                        <div>
                            <span style={{ display:"block", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:12 }}>The Academia Experience</span>
                            <h2 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"clamp(2rem,3.5vw,2.75rem)", fontWeight:700, lineHeight:1.15, marginBottom:20 }}>Endless opportunities for adventure</h2>
                            <p style={{ fontSize:"0.9375rem", lineHeight:1.75, color:"rgba(255,255,255,0.8)", marginBottom:32 }}>From character-building challenges and community service to alpine adventures and global expeditions.</p>
                            <SlideBtns />
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                {/* FOOTER */}
                <footer style={{ background:"#0c2044", color:"white", padding:"80px 80px 32px" }}>
                    <div style={{ textAlign:"center", marginBottom:56 }}>
                        <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><SchoolLogo width={56} height={64} /></div>
                        <div style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"1.5rem", fontWeight:700 }}>Academia</div>
                        <div style={{ fontSize:"0.65rem", letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", marginTop:4 }}>Collège Alpin International</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr 1fr 1fr 1fr", gap:32, paddingBottom:48, marginBottom:32, borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                        {[
                            { title:"Contact us", items:["Collège Alpin Academia","Route du Village 1","1884 Villars-sur-Ollon","Switzerland","","info@academia.ch","+41 24 496 26 26"], social:true },
                            { title:"Information", items:["News and events","Summer camp","Careers at Academia","","Summer Camp","summercamp@academia.ch","+41 24 496 26 46"] },
                            { title:"Quick Access", items:["Online payments","Term dates"] },
                            { title:"Admissions", items:["Application process","Application form","Admission team","Terms and conditions","","Admissions","admissions@academia.ch","+41 24 496 26 10"] },
                            { title:"Policies", items:["Legal notice","Website privacy and cookie policy","Accessibility statement"] },
                        ].map((col, ci) => (
                            <div key={ci}>
                                <h4 style={{ fontFamily:"Georgia,'Times New Roman',serif", fontSize:"1.125rem", fontWeight:600, marginBottom:16 }}>{col.title}</h4>
                                {col.items.map((item, ii) => item === "" ? <br key={ii}/> : (
                                    <a key={ii} href="#" style={{ display:"block", fontSize:"0.875rem", color:"rgba(255,255,255,0.55)", textDecoration:"none", lineHeight:1.9 }}
                                       onMouseEnter={e => (e.currentTarget.style.color = "white")}
                                       onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                                    >{item}</a>
                                ))}
                                {col.social && (
                                    <div style={{ display:"flex", gap:8, marginTop:16 }}>
                                        {["f","in","li","x","▶"].map((ic, i) => (
                                            <button key={i} style={{ width:36, height:36, borderRadius:"50%", background:"#e2b23e", color:"#06152e", border:"none", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background="#f5d47a"; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.background="#e2b23e"; }}
                                            >{ic}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"0.8125rem", color:"rgba(255,255,255,0.3)" }}>
                        <span>Design by <span style={{ fontWeight:700, color:"rgba(255,255,255,0.55)" }}>STUDIO</span>, powered by <span style={{ fontWeight:700, color:"rgba(255,255,255,0.55)" }}>AMAIS</span></span>
                        <span>© 2025 Academia · All rights reserved</span>
                    </div>
                </footer>
            </main>
        </>
    );
}