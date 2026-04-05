"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { Student } from "@/app/dashboard/page";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* -- Helpers --------------------------------------------------------------- */
function fmtDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}
function capitalize(s: string | null) {
    if (!s) return "-";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function initials(name: string | null | undefined) {
    if (!name) return "?";
    return name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* -- Loading --------------------------------------------------------------- */
function LoadingScreen({ message = "Loading..." }: { message?: string }) {
    return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
            background:"linear-gradient(135deg, #06152e 0%, #0c2044 50%, #10295a 100%)" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none"
                     stroke="#1690d8" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>{message}</p>
            </div>
        </div>
    );
}

/* -- Status pill ----------------------------------------------------------- */
function StatusPill({ status }: { status: string }) {
    const key = status?.toLowerCase();
    const map: Record<string, { bg: string; color: string }> = {
        approved:  { bg:"rgba(47,133,90,0.25)",  color:"#68d391" },
        completed: { bg:"rgba(47,133,90,0.25)",  color:"#68d391" },
        pending:   { bg:"rgba(212,160,23,0.25)", color:"#f6e05e" },
        rejected:  { bg:"rgba(229,62,62,0.25)",  color:"#fc8181" },
        failed:    { bg:"rgba(229,62,62,0.25)",  color:"#fc8181" },
    };
    const s = map[key] ?? { bg:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)" };
    return (
        <span style={{
            background: s.bg, color: s.color,
            padding: "4px 14px", borderRadius: 9999,
            fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{capitalize(status)}</span>
    );
}

/* -- Frosted card ---------------------------------------------------------- */
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            ...style,
        }}>
            {children}
        </div>
    );
}

/* -- Section header -------------------------------------------------------- */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div style={{ display:"flex", alignItems:"center", gap:10,
            padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color:"#1690d8", display:"flex" }}>{icon}</span>
            <h3 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"0.95rem", fontWeight:700, margin:0 }}>{title}</h3>
        </div>
    );
}

/* -- Info row (dark) ------------------------------------------------------- */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
            padding:"12px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize:"0.72rem", fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"rgba(255,255,255,0.4)", flexShrink:0, minWidth:130 }}>
                {label}
            </span>
            <span style={{ color:"rgba(255,255,255,0.85)", fontSize:"0.875rem",
                textAlign:"right", maxWidth:"60%", wordBreak:"break-word" }}>
                {value ?? "-"}
            </span>
        </div>
    );
}

/* -- Certificate tile ------------------------------------------------------ */
function CertTile({ url, index }: { url: string; index: number }) {
    const [hov, setHov] = useState(false);
    const isPdf = url.toLowerCase().endsWith(".pdf");
    const name  = decodeURIComponent(url.split("/").pop() ?? `File ${index + 1}`);

    return (
        <a href={url} target="_blank" rel="noopener noreferrer"
           onMouseEnter={() => setHov(true)}
           onMouseLeave={() => setHov(false)}
           style={{
               display:"flex", alignItems:"center", gap:14,
               padding:"14px 18px", textDecoration:"none", borderRadius:12,
               background: hov ? "rgba(22,144,216,0.12)" : "rgba(255,255,255,0.04)",
               border: `1px solid ${hov ? "rgba(22,144,216,0.4)" : "rgba(255,255,255,0.08)"}`,
               transition:"all 0.18s",
           }}
        >
            {isPdf ? (
                <div style={{ width:44, height:44, borderRadius:10, background:"rgba(229,62,62,0.15)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fc8181"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                </div>
            ) : (
                <div style={{ width:44, height:44, borderRadius:10, overflow:"hidden", flexShrink:0,
                    border:"1px solid rgba(255,255,255,0.12)" }}>
                    <img src={url} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, color:"rgba(255,255,255,0.85)", fontSize:"0.82rem",
                    fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</p>
                <p style={{ margin:"3px 0 0", color:"rgba(255,255,255,0.35)", fontSize:"0.72rem" }}>
                    {isPdf ? "PDF Document" : "Image"} &middot; Click to open
                </p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
        </a>
    );
}

/* -- Main page ------------------------------------------------------------- */
export default function StudentDetailPage() {
    useAuthGuard();
    const router = useRouter();
    const params = useParams();
    const id     = params?.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");

    useEffect(() => {
        if (!id) return;
        const token = localStorage.getItem("access_token");
        fetch(`${BASE_URL}${API_VERSION}/student/retrieve/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then(json => setStudent(json?.data ?? json))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    /* -- Error state ------------------------------------------------------- */
    if (error || !student) return (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:16,
            background:"linear-gradient(135deg, #06152e 0%, #0c2044 60%, #10295a 100%)" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(229,62,62,0.15)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fc8181"
                     strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <h2 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"1.3rem", margin:0 }}>Student Not Found</h2>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.875rem" }}>{error || "No data returned."}</p>
            <button onClick={() => router.back()}
                    style={{ padding:"10px 28px", borderRadius:9999, border:"1.5px solid rgba(22,144,216,0.5)",
                        background:"rgba(22,144,216,0.15)", color:"#38a9eb", cursor:"pointer",
                        fontSize:"0.8rem", fontWeight:600, letterSpacing:"0.08em" }}>
                Go Back
            </button>
        </div>
    );

    /* -- Page --------------------------------------------------------------- */
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #06152e 0%, #0c2044 55%, #10295a 100%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
        }}>

            {/* Subtle radial glows matching login page */}
            <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
                backgroundImage:`
                    radial-gradient(ellipse 60% 50% at 10% 20%, rgba(22,144,216,0.08) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 40% at 90% 80%, rgba(16,41,90,0.6) 0%, transparent 60%)
                ` }}/>

            {/* -- Top bar ------------------------------------------------- */}
            <header style={{
                position: "sticky", top: 0, zIndex: 50,
                background: "rgba(6,21,46,0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                padding: "0 32px", height: 64,
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                {/* Breadcrumb */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button onClick={() => router.push("/dashboard")}
                            style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none",
                                color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"0.8rem",
                                fontWeight:500, padding:0, transition:"color 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.color="white")}
                            onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.5)")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Dashboard
                    </button>
                    <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
                    <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.8rem" }}>Students</span>
                    <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
                    <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", fontWeight:600 }}>
                        #{student.id}
                    </span>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:10 }}>
                    <button style={{
                        padding:"8px 20px", borderRadius:9999,
                        border:"1.5px solid rgba(255,255,255,0.15)",
                        background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.75)",
                        cursor:"pointer", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.06em",
                    }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.12)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.06)"; }}>
                        Edit
                    </button>
                    <button style={{
                        padding:"8px 20px", borderRadius:9999,
                        border:"1.5px solid rgba(229,62,62,0.35)",
                        background:"rgba(229,62,62,0.12)", color:"#fc8181",
                        cursor:"pointer", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.06em",
                    }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.2)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="rgba(229,62,62,0.12)"; }}>
                        Delete
                    </button>
                </div>
            </header>

            {/* -- Content ------------------------------------------------- */}
            <div style={{ position:"relative", zIndex:1, maxWidth:960, margin:"0 auto", padding:"32px 24px 64px" }}>

                {/* -- Hero profile card ------------------------------------ */}
                <GlassCard style={{ marginBottom:24, overflow:"hidden" }}>
                    {/* Banner */}
                    <div style={{
                        height: 100,
                        background: "linear-gradient(135deg, #0e4a7a 0%, #163470 50%, #1b3f86 100%)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ position:"absolute", inset:0,
                            backgroundImage:`radial-gradient(circle at 20% 60%, rgba(22,144,216,0.3) 0%, transparent 50%),
                                             radial-gradient(circle at 75% 30%, rgba(232,184,75,0.15) 0%, transparent 45%)` }}/>
                        {/* Decorative school icon top-right */}
                        <div style={{ position:"absolute", right:24, top:"50%", transform:"translateY(-50%)",
                            width:40, height:40, borderRadius:"50%",
                            background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)"
                                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                        </div>
                    </div>

                    {/* Profile row */}
                    <div style={{ padding:"0 28px 28px", position:"relative" }}>
                        {/* Avatar */}
                        <div style={{ position:"relative", display:"inline-block", marginTop:-44 }}>
                            {student.profile_pic ? (
                                <img src={student.profile_pic} alt={student.full_name}
                                     style={{ width:88, height:88, borderRadius:"50%", objectFit:"cover",
                                         border:"3px solid rgba(22,144,216,0.6)",
                                         boxShadow:"0 0 0 4px rgba(22,144,216,0.15)", display:"block" }}/>
                            ) : (
                                <div style={{
                                    width:88, height:88, borderRadius:"50%",
                                    background:"linear-gradient(135deg, #1690d8, #0c2044)",
                                    border:"3px solid rgba(22,144,216,0.6)",
                                    boxShadow:"0 0 0 4px rgba(22,144,216,0.15)",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    color:"white", fontWeight:700, fontSize:"1.4rem",
                                }}>
                                    {initials(student.full_name)}
                                </div>
                            )}
                            {/* Status dot */}
                            <div style={{
                                position:"absolute", bottom:4, right:4,
                                width:16, height:16, borderRadius:"50%",
                                background: student.application_status.toLowerCase() === "approved" ? "#68d391"
                                    : student.application_status.toLowerCase() === "pending" ? "#f6e05e" : "#fc8181",
                                border:"2.5px solid #0c2044",
                            }}/>
                        </div>

                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                            flexWrap:"wrap", gap:16, marginTop:14 }}>
                            <div>
                                <h1 style={{ fontFamily:"Georgia,serif", fontSize:"1.6rem", fontWeight:700,
                                    color:"white", margin:0, lineHeight:1.2 }}>
                                    {student.full_name}
                                </h1>
                                <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.85rem", margin:"5px 0 12px" }}>
                                    {student.email}
                                </p>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                                    <StatusPill status={student.application_status}/>
                                    <span style={{
                                        background:"rgba(22,144,216,0.18)", color:"#38a9eb",
                                        padding:"4px 12px", borderRadius:9999,
                                        fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                                    }}>Grade {student.student_class}</span>
                                    <span style={{
                                        background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)",
                                        padding:"4px 12px", borderRadius:9999,
                                        fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                                    }}>Year {student.year}</span>
                                </div>
                            </div>

                            {/* Fee box */}
                            <div style={{
                                background:"rgba(22,144,216,0.12)",
                                border:"1px solid rgba(22,144,216,0.25)",
                                borderRadius:12, padding:"14px 20px", textAlign:"right",
                            }}>
                                <p style={{ fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.12em",
                                    textTransform:"uppercase", color:"rgba(255,255,255,0.4)", margin:0 }}>
                                    Application Fee
                                </p>
                                <p style={{ fontFamily:"Georgia,serif", fontSize:"1.5rem", fontWeight:700,
                                    color:"white", margin:"4px 0 2px" }}>
                                    NPR {Number(student.application_fee).toLocaleString()}
                                </p>
                                <p style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.3)", margin:0 }}>
                                    ID #{student.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* -- Two-column grid -------------------------------------- */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}
                     className="max-sm:grid-cols-1">

                    {/* -- LEFT column -- */}
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                        {/* Student info */}
                        <GlassCard style={{ overflow:"hidden" }}>
                            <SectionHeader title="Student Information"
                                           icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                            />
                            <Row label="Full Name"  value={student.full_name}/>
                            <Row label="Email"      value={student.email}/>
                            <Row label="Phone"      value={student.phone_number}/>
                            <Row label="Class"      value={`Grade ${student.student_class}`}/>
                            <Row label="Year"       value={student.year}/>
                            <Row label="Address"    value={student.address}/>
                            <Row label="Comments"   value={student.comments || "-"}/>
                        </GlassCard>

                        {/* Timeline */}
                        <GlassCard style={{ overflow:"hidden" }}>
                            <SectionHeader title="Timeline"
                                           icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                            />
                            <div style={{ padding:"8px 24px" }}>
                                <div style={{ display:"flex", gap:14, padding:"16px 0",
                                    borderBottom:"1px solid rgba(255,255,255,0.06)", alignItems:"flex-start" }}>
                                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#1690d8",
                                        flexShrink:0, marginTop:5, boxShadow:"0 0 8px rgba(22,144,216,0.6)" }}/>
                                    <div>
                                        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"white", margin:0 }}>
                                            Application Created
                                        </p>
                                        <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)", marginTop:3 }}>
                                            {fmtDate(student.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display:"flex", gap:14, padding:"16px 0", alignItems:"flex-start" }}>
                                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#e8b84b",
                                        flexShrink:0, marginTop:5, boxShadow:"0 0 8px rgba(232,184,75,0.5)" }}/>
                                    <div>
                                        <p style={{ fontSize:"0.85rem", fontWeight:600, color:"white", margin:0 }}>
                                            Last Updated
                                        </p>
                                        <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.4)", marginTop:3 }}>
                                            {fmtDate(student.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* -- RIGHT column -- */}
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                        {/* Parent info */}
                        <GlassCard style={{ overflow:"hidden" }}>
                            <SectionHeader title="Parent / Guardian"
                                           icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                            />
                            <Row label="Name"     value={student.parents_name}/>
                            <Row label="Relation" value={capitalize(student.relation)}/>
                            <Row label="Phone"    value={student.parents_phone_number}/>
                        </GlassCard>

                        {/* Profile photo */}
                        {student.profile_pic && (
                            <GlassCard style={{ overflow:"hidden" }}>
                                <SectionHeader title="Profile Photo"
                                               icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                                />
                                <div style={{ padding:16 }}>
                                    <img src={student.profile_pic} alt={student.full_name}
                                         style={{ width:"100%", maxHeight:200, objectFit:"cover",
                                             borderRadius:10, border:"1px solid rgba(255,255,255,0.1)" }}/>
                                </div>
                            </GlassCard>
                        )}

                        {/* Certificates */}
                        <GlassCard style={{ overflow:"hidden" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <span style={{ color:"#1690d8", display:"flex" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                    </span>
                                    <h3 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"0.95rem", fontWeight:700, margin:0 }}>
                                        Certificates
                                    </h3>
                                </div>
                                <span style={{
                                    background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.55)",
                                    padding:"3px 10px", borderRadius:9999,
                                    fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                                }}>
                                    {student.certificates.length} file{student.certificates.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                                {student.certificates.length === 0 ? (
                                    <p style={{ textAlign:"center", padding:"20px 0",
                                        color:"rgba(255,255,255,0.3)", fontSize:"0.875rem" }}>
                                        No certificates uploaded.
                                    </p>
                                ) : student.certificates.map((url, i) => (
                                    <CertTile key={i} url={url} index={i}/>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}