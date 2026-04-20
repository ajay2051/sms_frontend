"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface StudentProfile {
    id:                   number;
    full_name:            string;
    email:                string;
    phone_number:         string;
    student_class:        string;
    year:                 number;
    address:              string;
    parents_name:         string;
    relation:             string | null;
    parents_phone_number: string;
    application_fee:      string;
    application_status:   string;
    comments:             string | null;
    profile_pic:          string | null;
    certificates:         string[];
    created_at:           string;
    updated_at:           string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function capitalize(s: string | null) {
    if (!s) return "-";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function initials(name: string) {
    return name.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ── Glass card ─────────────────────────────────────────────────────────── */
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            ...style,
        }}>
            {children}
        </div>
    );
}

/* ── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color:"#1690d8", display:"flex" }}>{icon}</span>
            <h3 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"0.95rem", fontWeight:700, margin:0 }}>{title}</h3>
        </div>
    );
}

/* ── Field ──────────────────────────────────────────────────────────────── */
function Field({
                   label, name, value, onChange, type = "text", readOnly = false,
                   error, hint, as,
               }: {
    label: string; name: string; value: string; onChange: (name: string, val: string) => void;
    type?: string; readOnly?: boolean; error?: string; hint?: string; as?: "textarea" | "select";
}) {
    const base: React.CSSProperties = {
        width: "100%", boxSizing: "border-box",
        background: readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 8, padding: "10px 14px",
        color: readOnly ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
        fontFamily: "inherit", fontSize: "0.875rem", lineHeight: 1.5,
        outline: "none", transition: "border-color 0.15s",
        cursor: readOnly ? "not-allowed" : "text",
    };

    return (
        <div>
            <label style={{ display:"block", marginBottom:6, fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.38)" }}>
                {label}
            </label>
            {as === "textarea" ? (
                <textarea
                    name={name} value={value} readOnly={readOnly} rows={3}
                    onChange={e => onChange(name, e.target.value)}
                    style={{ ...base, resize: "vertical" }}
                    onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = "rgba(22,144,216,0.55)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; }}
                />
            ) : as === "select" ? (
                <select
                    name={name} value={value} disabled={readOnly}
                    onChange={e => onChange(name, e.target.value)}
                    style={{ ...base, cursor: readOnly ? "not-allowed" : "pointer" }}
                    onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = "rgba(22,144,216,0.55)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                    {["Father","Mother","Sibling","Guardian","Other"].map(o => (
                        <option key={o} value={o} style={{ background:"#0c2044" }}>{o}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type} name={name} value={value} readOnly={readOnly}
                    onChange={e => onChange(name, e.target.value)}
                    style={base}
                    onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = "rgba(22,144,216,0.55)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = error ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; }}
                />
            )}
            {error && <p style={{ color:"#f87171", fontSize:"0.7rem", marginTop:4 }}>{error}</p>}
            {hint  && <p style={{ color:"rgba(255,255,255,0.28)", fontSize:"0.68rem", marginTop:3 }}>{hint}</p>}
        </div>
    );
}

/* ── Loading ────────────────────────────────────────────────────────────── */
function Spinner() {
    return (
        <svg style={{ animation:"spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function EditProfilePage() {
    const router = useRouter();

    const [profile,  setProfile]  = useState<StudentProfile | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState("");
    const [toast,    setToast]    = useState<{ type:"success"|"error"; msg:string } | null>(null);
    const [errors,   setErrors]   = useState<Record<string, string>>({});

    // Profile pic preview
    const [picFile,    setPicFile]    = useState<File | null>(null);
    const [picPreview, setPicPreview] = useState<string | null>(null);
    const picInputRef = useRef<HTMLInputElement>(null);

    // Cert files
    const [certFiles, setCertFiles] = useState<File[]>([]);
    const certInputRef = useRef<HTMLInputElement>(null);

    const [removedCerts, setRemovedCerts] = useState<string[]>([]);

    /* Form state mirrors editable fields */
    const [form, setForm] = useState({
        full_name:            "",
        phone_number:         "",
        student_class:        "",
        year:                 "",
        address:              "",
        parents_name:         "",
        relation:             "",
        parents_phone_number: "",
    });

    /* Fetch profile on mount */
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/login"); return; }

        fetch(`${BASE_URL}${API_VERSION}/student/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then(json => {
                const d: StudentProfile = json?.data ?? json;
                setProfile(d);
                setForm({
                    full_name:            d.full_name,
                    phone_number:         d.phone_number,
                    student_class:        d.student_class,
                    year:                 String(d.year),
                    address:              d.address,
                    parents_name:         d.parents_name,
                    relation:             d.relation ?? "",
                    parents_phone_number: d.parents_phone_number,
                });
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    function handleChange(name: string, val: string) {
        setForm(prev => ({ ...prev, [name]: val }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    }

    function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPicFile(file);
        setPicPreview(URL.createObjectURL(file));
    }

    function handleCertChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        setCertFiles(prev => [...prev, ...files]);
    }

    function removeCert(index: number) {
        setCertFiles(prev => prev.filter((_, i) => i !== index));
    }

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!form.full_name.trim())            e.full_name            = "Full name is required.";
        else if (form.full_name.length < 3)    e.full_name            = "Must be at least 3 characters.";
        if (!form.phone_number.trim())         e.phone_number         = "Phone number is required.";
        else if (!/^\d+$/.test(form.phone_number)) e.phone_number     = "Only digits allowed.";
        if (!form.parents_name.trim())         e.parents_name         = "Parent name is required.";
        if (!form.parents_phone_number.trim()) e.parents_phone_number = "Parent phone is required.";
        else if (!/^\d+$/.test(form.parents_phone_number)) e.parents_phone_number = "Only digits allowed.";
        if (!form.address.trim())              e.address              = "Address is required.";
        if (form.full_name.trim() === form.parents_name.trim()) e.parents_name = "Cannot be same as student name.";
        if (form.phone_number.trim() === form.parents_phone_number.trim()) e.parents_phone_number = "Cannot be same as student phone.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function removeExistingCert(url: string) {
        setRemovedCerts(prev => [...prev, url]);
    }

    async function handleSubmit() {
        if (!validate() || !profile) return;
        setSaving(true);
        setToast(null);

        try {
            const token = localStorage.getItem("access_token");
            const body  = new FormData();

            // Append editable text fields
            (Object.keys(form) as (keyof typeof form)[]).forEach(k => body.append(k, form[k]));

            // Profile pic
            if (picFile) body.append("profile_pic", picFile);

            // New certificates (only if user added new ones)
            if (certFiles.length > 0) {
                certFiles.forEach(f => body.append("certificates", f));
                removedCerts.forEach(url => body.append("remove_certificates", url));
            }

            const res = await fetch(`${BASE_URL}${API_VERSION}/student/update/${profile.id}/`, {
                method:  "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body,
            });
            const json = await res.json();
            if (!res.ok) {
                // json might be { full_name: ["Full name must not contain..."], ... }
                // or { message: "..." }
                const fieldErrors: Record<string, string> = {};
                let hasFieldErrors = false;

                for (const key of Object.keys(json)) {
                    if (key in form) {
                        const val = json[key];
                        fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
                        hasFieldErrors = true;
                    }
                }

                if (hasFieldErrors) {
                    setErrors(fieldErrors);
                    setToast({ type: "error", msg: "Please fix the highlighted fields." });
                    return;            // skip the success path
                }

                throw new Error(json?.message ?? json?.detail ?? `Error ${res.status}`);}

            setToast({ type:"success", msg:"Profile updated successfully!" });
            // Refresh profile data
            const updated: StudentProfile = json?.data ?? json;
            setProfile(updated);
            setPicFile(null);
            setPicPreview(null);
            setCertFiles([]);
            setRemovedCerts([]);
        } catch (e: any) {
            setToast({ type:"error", msg: e.message ?? "Something went wrong." });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 5000);
        }
    }

    /* ── Loading state ───────────────────────────────────────────────── */
    if (loading) return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#06152e 0%,#0c2044 55%,#10295a 100%)" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <svg style={{ animation:"spin 1s linear infinite" }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1690d8" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase" }}>Loading profile…</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    /* ── Error state ─────────────────────────────────────────────────── */
    if (error || !profile) return (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, background:"linear-gradient(135deg,#06152e 0%,#0c2044 55%,#10295a 100%)" }}>
            <p style={{ color:"#f87171" }}>{error || "Could not load profile."}</p>
            <button onClick={() => router.push("/")} style={{ padding:"10px 28px", borderRadius:999, border:"1.5px solid rgba(22,144,216,0.5)", background:"rgba(22,144,216,0.15)", color:"#38a9eb", cursor:"pointer" }}>Go Home</button>
        </div>
    );

    const displayPic = picPreview ?? profile.profile_pic;

    return (
        <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#06152e 0%,#0c2044 55%,#10295a 100%)", fontFamily:"system-ui,-apple-system,sans-serif" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.22); }
                select option { background: #0c2044; color: white; }
            `}</style>

            {/* Glow layers */}
            <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"radial-gradient(ellipse 60% 50% at 10% 20%,rgba(22,144,216,0.07) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 80%,rgba(16,41,90,0.5) 0%,transparent 60%)" }} />

            {/* ── Header ───────────────────────────────────────────── */}
            <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(6,21,46,0.88)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button onClick={() => router.push("/")}
                            style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"0.8rem", fontWeight:500, padding:0, transition:"color 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "white")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Home
                    </button>
                    <span style={{ color:"rgba(255,255,255,0.2)" }}>/</span>
                    <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", fontWeight:600 }}>Edit Profile</span>
                </div>

                {/* Save button in header */}
                <button onClick={handleSubmit} disabled={saving}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 24px", borderRadius:999, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", transition:"all 0.15s", background:saving?"rgba(255,255,255,0.06)":"rgba(22,144,216,0.85)", border:saving?"1.5px solid rgba(255,255,255,0.1)":"1.5px solid rgba(22,144,216,0.6)", color:saving?"rgba(255,255,255,0.3)":"white", opacity:saving?0.7:1 }}
                >
                    {saving ? <><Spinner /> Saving…</> : <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Save Changes
                    </>}
                </button>
            </header>

            {/* ── Content ──────────────────────────────────────────── */}
            <div style={{ position:"relative", zIndex:1, maxWidth:960, margin:"0 auto", padding:"32px 24px 80px", animation:"fadeUp 0.3s ease" }}>

                {/* ── Admin comment banner (if any) ─────────────────── */}
                {profile.comments && (
                    <div style={{ marginBottom:24, padding:"16px 20px", borderRadius:12, background:"rgba(240,168,50,0.08)", border:"1px solid rgba(240,168,50,0.3)", display:"flex", gap:14, alignItems:"flex-start" }}>
                        <div style={{ flexShrink:0, width:36, height:36, borderRadius:"50%", background:"rgba(240,168,50,0.15)", border:"1px solid rgba(240,168,50,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0a832" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div>
                            <p style={{ margin:0, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#f0a832", marginBottom:5 }}>Review Comment from Admin</p>
                            <p style={{ margin:0, fontSize:"0.875rem", lineHeight:1.65, color:"rgba(255,255,255,0.78)" }}>{profile.comments}</p>
                        </div>
                    </div>
                )}

                {/* ── Hero card (profile pic + status) ─────────────── */}
                <GlassCard style={{ marginBottom:24, overflow:"hidden" }}>
                    {/* Banner */}
                    <div style={{ height:90, background:"linear-gradient(135deg,#0e4a7a 0%,#163470 50%,#1b3f86 100%)", position:"relative", overflow:"hidden" }}>
                        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 60%,rgba(22,144,216,0.3) 0%,transparent 50%),radial-gradient(circle at 75% 30%,rgba(232,184,75,0.15) 0%,transparent 45%)" }} />
                    </div>

                    <div style={{ padding:"0 28px 28px" }}>
                        {/* Avatar + upload button */}
                        <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginTop:-20 }}>
                            <div style={{ position:"relative", flexShrink:0 }}>
                                <div style={{ width:88, height:88, borderRadius:"50%", overflow:"hidden", border:"3px solid rgba(22,144,216,0.6)", boxShadow:"0 0 0 4px rgba(22,144,216,0.15)", background:"linear-gradient(135deg,#1690d8,#0c2044)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    {displayPic
                                        ? <img src={displayPic} alt={profile.full_name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                        : <span style={{ color:"white", fontWeight:700, fontSize:"1.4rem" }}>{initials(profile.full_name)}</span>
                                    }
                                </div>
                                <button onClick={() => picInputRef.current?.click()}
                                        style={{ position:"absolute", bottom:2, right:2, width:26, height:26, borderRadius:"50%", background:"#1690d8", border:"2px solid #0c2044", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "#38bdf8")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "#1690d8")}
                                        title="Change photo"
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                </button>
                                <input ref={picInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePicChange} />
                            </div>
                            <div style={{ paddingBottom:4 }}>
                                <h1 style={{ fontFamily:"Georgia,serif", fontSize:"1.45rem", fontWeight:700, color:"white", margin:0 }}>{profile.full_name}</h1>
                                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.82rem", margin:"4px 0 0" }}>{profile.email}</p>
                                {picFile && <p style={{ color:"#38bdf8", fontSize:"0.72rem", margin:"4px 0 0" }}>New photo selected — save to apply</p>}
                            </div>
                        </div>

                        {/* Read-only chips */}
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:16 }}>
                            <span style={{ background:"rgba(22,144,216,0.15)", color:"#38a9eb", padding:"4px 12px", borderRadius:9999, fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Grade {profile.student_class}</span>
                            <span style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)", padding:"4px 12px", borderRadius:9999, fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Year {profile.year}</span>
                            <span style={{
                                padding:"4px 12px", borderRadius:9999, fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                                background: profile.application_status.toLowerCase()==="approved" ? "rgba(52,211,153,0.12)" : profile.application_status.toLowerCase()==="pending" ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
                                color:       profile.application_status.toLowerCase()==="approved" ? "#34d399"              : profile.application_status.toLowerCase()==="pending" ? "#fbbf24"              : "#f87171",
                            }}>{capitalize(profile.application_status)}</span>
                            <span style={{ background:"rgba(240,168,50,0.12)", color:"#f0a832", padding:"4px 12px", borderRadius:9999, fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>NPR {Number(profile.application_fee).toLocaleString()} fee</span>
                        </div>
                    </div>
                </GlassCard>

                {/* ── Toast ────────────────────────────────────────────── */}
                {toast && (
                    <div style={{ marginBottom:20, padding:"12px 18px", borderRadius:10, display:"flex", alignItems:"center", gap:10, fontSize:"0.82rem", fontWeight:500, background:toast.type==="success"?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", border:`1px solid ${toast.type==="success"?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}`, color:toast.type==="success"?"#34d399":"#f87171" }}>
                        {toast.type==="success"
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        }
                        {toast.msg}
                    </div>
                )}

                {/* ── Two-column grid ───────────────────────────────────── */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

                    {/* LEFT: Student info */}
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                        <GlassCard style={{ overflow:"hidden" }}>
                            <SectionHeader title="Personal Information"
                                           icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                            />
                            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
                                <Field label="Full Name"    name="full_name"    value={form.full_name}    onChange={handleChange} error={errors.full_name} />
                                <Field label="Email"        name="email"        value={profile.email}     onChange={handleChange} readOnly hint="Email cannot be changed" />
                                <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} error={errors.phone_number} />
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                    <Field label="Class" name="student_class" value={form.student_class} onChange={handleChange} readOnly hint="Set by admin" />
                                    <Field label="Year"  name="year"         value={form.year}         onChange={handleChange} readOnly hint="Set by admin" />
                                </div>
                                <Field label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} as="textarea" />
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT: Parent info + certificates */}
                    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                        <GlassCard style={{ overflow:"hidden" }}>
                            <SectionHeader title="Parent / Guardian"
                                           icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                            />
                            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
                                <Field label="Parent / Guardian Name" name="parents_name"         value={form.parents_name}         onChange={handleChange} error={errors.parents_name} />
                                <Field label="Relation"               name="relation"              value={form.relation}             onChange={handleChange} as="select" />
                                <Field label="Parent Phone Number"    name="parents_phone_number"  value={form.parents_phone_number} onChange={handleChange} error={errors.parents_phone_number} />
                            </div>
                        </GlassCard>

                        {/* Certificates */}
                        <GlassCard style={{ overflow:"hidden" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                    <span style={{ color:"#1690d8", display:"flex" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                    </span>
                                    <h3 style={{ fontFamily:"Georgia,serif", color:"white", fontSize:"0.95rem", fontWeight:700, margin:0 }}>Certificates</h3>
                                </div>
                                <button onClick={() => certInputRef.current?.click()}
                                        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:999, border:"1px solid rgba(22,144,216,0.35)", background:"rgba(22,144,216,0.1)", color:"#38a9eb", fontSize:"0.72rem", fontWeight:600, cursor:"pointer", transition:"background 0.15s" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(22,144,216,0.2)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(22,144,216,0.1)")}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Add
                                </button>
                                <input ref={certInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple style={{ display:"none" }} onChange={handleCertChange} />
                            </div>

                            <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                                {/* Existing certs (read-only) */}
                                {profile.certificates
                                    .filter(url => !removedCerts.includes(url))   // hide removed ones
                                    .map((url, i) => {
                                        const name = decodeURIComponent(url.split("/").pop() ?? `File ${i+1}`);
                                        const isPdf = url.toLowerCase().endsWith(".pdf");
                                        return (
                                            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                                                {/* thumb */}
                                                <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, overflow:"hidden", background:isPdf?"rgba(229,62,62,0.12)":"rgba(22,144,216,0.1)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.08)" }}>
                                                    {isPdf
                                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fc8181" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                        : <img src={url} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                                    }
                                                </div>
                                                {/* name */}
                                                <div style={{ flex:1, minWidth:0 }}>
                                                    <p style={{ margin:0, color:"rgba(255,255,255,0.75)", fontSize:"0.78rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</p>
                                                    <p style={{ margin:"2px 0 0", color:"rgba(255,255,255,0.3)", fontSize:"0.68rem" }}>Existing file</p>
                                                </div>
                                                {/* open link */}
                                                <a href={url} target="_blank" rel="noopener noreferrer" style={{ color:"rgba(255,255,255,0.3)", display:"flex", flexShrink:0 }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                                    </svg>
                                                </a>
                                                {/* ← NEW: remove button */}
                                                <button
                                                    onClick={() => removeExistingCert(url)}
                                                    style={{ color:"rgba(248,113,113,0.6)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", flexShrink:0 }}
                                                    title="Remove"
                                                >
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </button>
                                            </div>
                                        );
                                    })
                                }

                                {/* New cert files queued for upload */}
                                {certFiles.map((file, i) => (
                                    <div key={`new-${i}`} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.2)" }}>
                                        <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, background:"rgba(52,211,153,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <p style={{ margin:0, color:"#34d399", fontSize:"0.78rem", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                                            <p style={{ margin:"2px 0 0", color:"rgba(52,211,153,0.5)", fontSize:"0.68rem" }}>Ready to upload</p>
                                        </div>
                                        <button onClick={() => removeCert(i)}
                                                style={{ color:"rgba(248,113,113,0.6)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", flexShrink:0 }}
                                                title="Remove">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        </button>
                                    </div>
                                ))}

                                {profile.certificates.length === 0 && certFiles.length === 0 && (
                                    <p style={{ textAlign:"center", padding:"16px 0", color:"rgba(255,255,255,0.25)", fontSize:"0.82rem" }}>No certificates yet. Click Add to upload.</p>
                                )}

                                {certFiles.length > 0 && (
                                    <p style={{ fontSize:"0.7rem", color:"rgba(52,211,153,0.6)", margin:"4px 0 0", textAlign:"center" }}>
                                        {certFiles.length} new file{certFiles.length > 1 ? "s" : ""} will replace existing certificates on save.
                                    </p>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* ── Bottom save bar ───────────────────────────────────── */}
                <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:12, marginTop:24 }}>
                    <button onClick={() => router.push("/")}
                            style={{ padding:"11px 28px", borderRadius:999, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.55)", fontFamily:"inherit", fontSize:"0.8rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.04em" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    >Cancel</button>
                    <button onClick={handleSubmit} disabled={saving}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 32px", borderRadius:999, cursor:saving?"not-allowed":"pointer", fontFamily:"inherit", fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", transition:"all 0.15s", background:saving?"rgba(255,255,255,0.05)":"rgba(22,144,216,0.85)", border:saving?"1.5px solid rgba(255,255,255,0.08)":"1.5px solid rgba(22,144,216,0.6)", color:saving?"rgba(255,255,255,0.3)":"white", opacity:saving?0.7:1 }}
                    >
                        {saving ? <><Spinner /> Saving…</> : <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Save Changes
                        </>}
                    </button>
                </div>
            </div>
        </div>
    );
}