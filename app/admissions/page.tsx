"use client";
import React, { useState, useRef } from "react";
import {useStudentAuthGuard} from "@/hooks/useStudentAuthGuard";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

const SPECIAL_CHARS = new Set('@_!#$%^&*()<>?/\\|}{~:'.split(''));

/* ── Types ──────────────────────────────────────────────────────────────── */
interface FormData {
    full_name: string;
    phone_number: string;
    student_class: string;
    year: string;
    address: string;
    parents_name: string;
    relation: string;
    parents_phone_number: string;
    application_fee: string;
    profile_pic: File | null;
    certificates: File[];
}
interface FormErrors { [key: string]: string; }

/* ── Validators ─────────────────────────────────────────────────────────── */
function validateFullName(v: string) {
    if (v.length < 3 || v.length > 50) return "Must be between 3 and 50 characters";
    if ([...v].some(c => SPECIAL_CHARS.has(c))) return "Must not contain special characters";
    return "";
}
function validatePhone(v: string) {
    if (!/^\d+$/.test(v)) return "Must contain digits only";
    return "";
}
function validateClass(v: string) {
    const n = parseInt(v);
    if (isNaN(n) || n < 1 || n > 12) return "Must be between 1 and 12";
    return "";
}
function validateCertificates(files: File[]) {
    if (!files.length) return "At least one certificate is required";
    for (const f of files) {
        if (f.size > 5 * 1024 * 1024) return "Each file must be less than 5 MB";
        const ext = "." + f.name.split(".").pop()!.toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".pdf"].includes(ext))
            return "Allowed formats: JPG, JPEG, PNG, PDF";
    }
    return "";
}
function validateAll(form: FormData): FormErrors {
    const e: FormErrors = {};
    const fn = validateFullName(form.full_name);        if (fn) e.full_name = fn;
    const pn = validatePhone(form.phone_number);         if (pn) e.phone_number = pn;
    const sc = validateClass(form.student_class);        if (sc) e.student_class = sc;
    if (!form.year)     e.year    = "Year is required";
    if (!form.address)  e.address = "Address is required";
    const pa = validateFullName(form.parents_name);      if (pa) e.parents_name = pa;
    if (!form.relation) e.relation = "Relation is required";
    const pp = validatePhone(form.parents_phone_number); if (pp) e.parents_phone_number = pp;
    if (!form.application_fee) e.application_fee = "Application fee is required";
    const cv = validateCertificates(form.certificates);  if (cv) e.certificates = cv;
    if (form.full_name && form.full_name === form.parents_name)
        e.parents_name = "Student name and parent name cannot be the same";
    if (form.phone_number && form.phone_number === form.parents_phone_number)
        e.parents_phone_number = "Student and parent phone numbers cannot be the same";
    return e;
}

/* ── Error message ──────────────────────────────────────────────────────── */
function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <span className="flex items-center gap-1 mt-1" style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--danger)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {msg}
        </span>
    );
}

/* ── Field wrapper ──────────────────────────────────────────────────────── */
function Field({ label, error, required = true, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label style={{
                fontSize: "0.66rem", fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
            }}>
                {label}
                {required && <span style={{ color: "var(--sky-400)", marginLeft: 2 }}>*</span>}
            </label>
            {children}
            <ErrorMsg msg={error} />
        </div>
    );
}

/* ── Input style helper ─────────────────────────────────────────────────── */
const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.6rem 0.875rem",
    background: "rgba(16, 41, 90, 0.95)",
    border: `1.5px solid ${hasError ? "var(--danger)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    color: "var(--white)",
    outline: "none",
    colorScheme: "dark",
    transition: "border-color 0.2s, box-shadow 0.2s",
});

/* ── Section card ───────────────────────────────────────────────────────── */
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

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function AdmissionsPage() {
    useStudentAuthGuard()
    const [form, setForm] = useState<FormData>({
        full_name: "", phone_number: "", student_class: "", year: "",
        address: "", parents_name: "", relation: "", parents_phone_number: "",
        application_fee: "", profile_pic: null, certificates: [],
    });
    const [errors,     setErrors]     = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [success,    setSuccess]    = useState(false);
    const [apiError,   setApiError]   = useState("");

    const certRef = useRef<HTMLInputElement>(null);
    const picRef  = useRef<HTMLInputElement>(null);

    function touch(field: string, value: string) {
        let err = "";
        if (field === "full_name")            err = validateFullName(value);
        if (field === "phone_number")         err = validatePhone(value);
        if (field === "student_class")        err = validateClass(value);
        if (field === "parents_name")         err = validateFullName(value);
        if (field === "parents_phone_number") err = validatePhone(value);
        setErrors(prev => ({ ...prev, [field]: err }));
    }
    function set(field: keyof FormData, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        touch(field, value);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validateAll(form);
        if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
        setSubmitting(true);
        setApiError("");
        try {
            const fd = new FormData();
            (Object.keys(form) as (keyof typeof form)[]).forEach(k => {
                if (k === "certificates") {
                    form.certificates.forEach(f => fd.append("certificates", f));
                } else if (k === "profile_pic" && form.profile_pic) {
                    fd.append("profile_pic", form.profile_pic);
                } else if (typeof form[k] === "string") {
                    fd.append(k, form[k] as string);
                }
            });
            const res = await fetch(`${BASE_URL}${API_VERSION}/student/create/`, { method: "POST", body: fd });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail ?? `Error ${res.status}`);
            }
            setSuccess(true);
        } catch (err: any) {
            setApiError(err.message ?? "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Success screen ── */
    if (success) return (
        <div style={{
            minHeight: "100vh", background: "var(--navy-900)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "1.25rem", textAlign: "center", padding: "2rem",
        }} className="animate-fade-up">
            <div style={{
                width: 72, height: 72, borderRadius: "9999px",
                background: "linear-gradient(135deg, var(--sky-400), var(--navy-700))",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: "var(--white)" }}>
                Application Submitted
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", maxWidth: 340, lineHeight: 1.75 }}>
                Your admission application has been received. We will be in touch shortly.
            </p>
            <button
                onClick={() => setSuccess(false)}
                style={{
                    padding: "0.65rem 1.75rem", borderRadius: "9999px",
                    background: "rgba(255,255,255,0.08)", color: "var(--white)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                }}
            >
                Submit Another
            </button>
        </div>
    );

    const grid2: React.CSSProperties = {
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
    };
    const span2: React.CSSProperties = { gridColumn: "1 / -1" };

    /* ── Form ── */
    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--navy-900)",
            padding: "2.5rem 3rem",
        }}>
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
                        Student <span style={{ color: "var(--gold-400)" }}>Application</span>
                    </h1>
                    <p style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520 }}>
                        Please complete all fields accurately. Certificates must be JPG, PNG or PDF, max 5 MB each.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                    {/* ── Student Info ── */}
                    <div className="animate-fade-up delay-100">
                        <SectionCard
                            title="Student Information"
                            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        >
                            <div style={grid2}>
                                <Field label="Full Name" error={errors.full_name}>
                                    <input
                                        style={inputStyle(!!errors.full_name)}
                                        type="text" value={form.full_name}
                                        onChange={e => set("full_name", e.target.value)}
                                        placeholder="e.g. John Smith"
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                        onBlur={e  => { e.currentTarget.style.borderColor = errors.full_name ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </Field>

                                <Field label="Phone Number" error={errors.phone_number}>
                                    <input
                                        style={inputStyle(!!errors.phone_number)}
                                        type="text" value={form.phone_number}
                                        onChange={e => set("phone_number", e.target.value)}
                                        placeholder="Digits only"
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                        onBlur={e  => { e.currentTarget.style.borderColor = errors.phone_number ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </Field>

                                <Field label="Class (Grade)" error={errors.student_class}>
                                    <select
                                        style={inputStyle(!!errors.student_class)}
                                        value={form.student_class}
                                        onChange={e => set("student_class", e.target.value)}
                                    >
                                        <option value="">Select class</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                                            <option key={n} value={String(n)}>Grade {n}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Academic Year" error={errors.year}>
                                    <select
                                        style={inputStyle(!!errors.year)}
                                        value={form.year}
                                        onChange={e => set("year", e.target.value)}
                                    >
                                        <option value="">Select year</option>
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <option key={y} value={String(y)}>{y}</option>
                                        ))}
                                    </select>
                                </Field>

                                <div style={span2}>
                                    <Field label="Address" error={errors.address}>
                                        <textarea
                                            style={{ ...inputStyle(!!errors.address), resize: "vertical", minHeight: 80 }}
                                            value={form.address}
                                            onChange={e => set("address", e.target.value)}
                                            placeholder="Full residential address"
                                            rows={3}
                                            onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                            onBlur={e  => { e.currentTarget.style.borderColor = errors.address ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    </Field>
                                </div>

                                {/* Profile Photo */}
                                <div style={span2}>
                                    <Field label="Profile Photo" required={false}>
                                        <div
                                            onClick={() => picRef.current?.click()}
                                            style={{
                                                border: "1.5px dashed rgba(255,255,255,0.15)",
                                                borderRadius: "var(--radius-lg)",
                                                padding: "1.75rem 1rem",
                                                display: "flex", flexDirection: "column",
                                                alignItems: "center", gap: "0.5rem",
                                                cursor: "pointer",
                                                background: "rgba(255,255,255,0.02)",
                                                textAlign: "center", transition: "border-color 0.2s, background 0.2s",
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--sky-400)"; (e.currentTarget as HTMLElement).style.background = "rgba(22,144,216,0.06)"; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sky-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                            </svg>
                                            <span style={{ fontSize: "0.825rem", color: form.profile_pic ? "var(--sky-400)" : "rgba(255,255,255,0.45)" }}>
                                                {form.profile_pic ? form.profile_pic.name : "Click to upload profile photo"}
                                            </span>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                                JPG, PNG — max 5 MB
                                            </span>
                                        </div>
                                        <input
                                            ref={picRef} type="file" accept=".jpg,.jpeg,.png"
                                            style={{ display: "none" }}
                                            onChange={e => setForm(prev => ({ ...prev, profile_pic: e.target.files?.[0] ?? null }))}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── Parent Info ── */}
                    <div className="animate-fade-up delay-200">
                        <SectionCard
                            title="Parent / Guardian Information"
                            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                        >
                            <div style={grid2}>
                                <Field label="Parent's Name" error={errors.parents_name}>
                                    <input
                                        style={inputStyle(!!errors.parents_name)}
                                        type="text" value={form.parents_name}
                                        onChange={e => set("parents_name", e.target.value)}
                                        placeholder="e.g. Jane Smith"
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                        onBlur={e  => { e.currentTarget.style.borderColor = errors.parents_name ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </Field>

                                <Field label="Relation" error={errors.relation}>
                                    <select
                                        style={inputStyle(!!errors.relation)}
                                        value={form.relation}
                                        onChange={e => set("relation", e.target.value)}
                                    >
                                        <option value="">Select relation</option>
                                        {["Father", "Mother", "Guardian", "Sibling", "Other"].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Parent's Phone" error={errors.parents_phone_number}>
                                    <input
                                        style={inputStyle(!!errors.parents_phone_number)}
                                        type="text" value={form.parents_phone_number}
                                        onChange={e => set("parents_phone_number", e.target.value)}
                                        placeholder="Digits only"
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                        onBlur={e  => { e.currentTarget.style.borderColor = errors.parents_phone_number ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </Field>

                                <Field label="Application Fee" error={errors.application_fee}>
                                    <input
                                        style={inputStyle(!!errors.application_fee)}
                                        type="text" value={form.application_fee}
                                        onChange={e => set("application_fee", e.target.value)}
                                        placeholder="Amount"
                                        onFocus={e => { e.currentTarget.style.borderColor = "var(--sky-500)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,144,216,0.18)"; }}
                                        onBlur={e  => { e.currentTarget.style.borderColor = errors.application_fee ? "var(--danger)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                </Field>
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── Certificates ── */}
                    <div className="animate-fade-up delay-300">
                        <SectionCard
                            title="Certificates & Documents"
                            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
                        >
                            <div
                                onClick={() => certRef.current?.click()}
                                style={{
                                    border: `1.5px dashed ${errors.certificates ? "var(--danger)" : "rgba(255,255,255,0.15)"}`,
                                    borderRadius: "var(--radius-lg)",
                                    padding: "2rem 1rem",
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", gap: "0.5rem",
                                    cursor: "pointer", textAlign: "center",
                                    background: errors.certificates ? "rgba(229,62,62,0.04)" : "rgba(255,255,255,0.02)",
                                    transition: "border-color 0.2s, background 0.2s",
                                }}
                                onMouseEnter={e => {
                                    if (!errors.certificates) {
                                        (e.currentTarget as HTMLElement).style.borderColor = "var(--sky-400)";
                                        (e.currentTarget as HTMLElement).style.background = "rgba(22,144,216,0.06)";
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!errors.certificates) {
                                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                                    }
                                }}
                            >
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                     stroke={errors.certificates ? "var(--danger)" : "var(--sky-400)"}
                                     strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 16 12 12 8 16"/>
                                    <line x1="12" y1="12" x2="12" y2="21"/>
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                </svg>
                                <span style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.45)" }}>
                                    Click to select certificates
                                </span>
                                <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                                    JPG, JPEG, PNG, PDF — max 5 MB each — multiple allowed
                                </span>
                            </div>

                            <input
                                ref={certRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple
                                style={{ display: "none" }}
                                onChange={e => {
                                    const files   = Array.from(e.target.files ?? []);
                                    const updated = [...form.certificates, ...files];
                                    setForm(prev => ({ ...prev, certificates: updated }));
                                    setErrors(prev => ({ ...prev, certificates: validateCertificates(updated) }));
                                }}
                            />

                            <ErrorMsg msg={errors.certificates} />

                            {form.certificates.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                                    {form.certificates.map((f, i) => (
                                        <span key={i} style={{
                                            display: "inline-flex", alignItems: "center", gap: "0.35rem",
                                            padding: "0.25rem 0.625rem", borderRadius: "9999px",
                                            fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                                            background: "rgba(22,144,216,0.18)", color: "var(--sky-300)",
                                            border: "1px solid rgba(22,144,216,0.25)",
                                        }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            </svg>
                                            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {f.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={ev => {
                                                    ev.stopPropagation();
                                                    const updated = form.certificates.filter((_, j) => j !== i);
                                                    setForm(prev => ({ ...prev, certificates: updated }));
                                                    setErrors(prev => ({ ...prev, certificates: validateCertificates(updated) }));
                                                }}
                                                style={{
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: "var(--sky-300)", opacity: 0.7, padding: 0,
                                                    lineHeight: 1, fontSize: "0.9rem", marginLeft: 2,
                                                }}
                                            >×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* ── Submit ── */}
                    <div className="animate-fade-up delay-400" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
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
                            type="submit"
                            disabled={submitting}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.7rem 2.25rem", borderRadius: "9999px",
                                background: "var(--sky-500)", color: "white", border: "none",
                                fontFamily: "var(--font-body)", fontSize: "0.9375rem", fontWeight: 600,
                                cursor: submitting ? "not-allowed" : "pointer",
                                opacity: submitting ? 0.55 : 1,
                                transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                            }}
                            onMouseEnter={e => { if (!submitting) { (e.currentTarget as HTMLElement).style.background = "var(--sky-600)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(22,144,216,0.35)"; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--sky-500)"; (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Submitting…
                                </>
                            ) : "Submit Application"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}