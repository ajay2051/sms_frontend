"use client";

import { useState, JSX } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

/* ── Types ───────────────────────────────────────────────────────────────── */
type Tab = "Students" | "Payments" | "Notice";
const TABS: Tab[] = ["Students", "Payments", "Notice"];

const TAB_ICONS: Record<Tab, JSX.Element> = {
    Students: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    Payments: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
    ),
    Notice: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    ),
};

/* ── Mock data ───────────────────────────────────────────────────────────── */
const MOCK_STUDENTS = [
    { id:1, full_name:"Aarav Sharma",  phone_number:"9841000001", student_class:"10", year:"2024", address:"Kathmandu", parents_name:"Rajesh Sharma",  relation:"Father", parents_phone_number:"9841000002", application_fee:"5000", application_status:"Approved",  comments:"Good student",  profile_pic:null, created_at:"2024-01-10", updated_at:"2024-03-12" },
    { id:2, full_name:"Priya Thapa",   phone_number:"9841000003", student_class:"8",  year:"2024", address:"Lalitpur",  parents_name:"Sunita Thapa",   relation:"Mother", parents_phone_number:"9841000004", application_fee:"5000", application_status:"Pending",   comments:"Awaiting docs", profile_pic:null, created_at:"2024-02-05", updated_at:"2024-03-14" },
    { id:3, full_name:"Rohan Pandey",  phone_number:"9841000005", student_class:"12", year:"2024", address:"Bhaktapur", parents_name:"Mohan Pandey",   relation:"Father", parents_phone_number:"9841000006", application_fee:"5000", application_status:"Rejected",  comments:"Incomplete",    profile_pic:null, created_at:"2024-01-28", updated_at:"2024-03-10" },
    { id:4, full_name:"Sita Maharjan", phone_number:"9841000007", student_class:"6",  year:"2024", address:"Patan",     parents_name:"Kumar Maharjan", relation:"Father", parents_phone_number:"9841000008", application_fee:"5000", application_status:"Approved",  comments:"",              profile_pic:null, created_at:"2024-02-14", updated_at:"2024-03-15" },
    { id:5, full_name:"Bikash Gurung", phone_number:"9841000009", student_class:"11", year:"2024", address:"Pokhara",   parents_name:"Dhan Gurung",    relation:"Father", parents_phone_number:"9841000010", application_fee:"5000", application_status:"Pending",   comments:"Interview due", profile_pic:null, created_at:"2024-03-01", updated_at:"2024-03-16" },
];
const MOCK_PAYMENTS = [
    { id:1, txn_id:"TXN202401001", total_amount:"15000", payment_method:"eSewa",         status:"Completed", student:1, created_at:"2024-01-15", updated_at:"2024-01-15" },
    { id:2, txn_id:"TXN202401002", total_amount:"15000", payment_method:"Khalti",        status:"Pending",   student:2, created_at:"2024-02-10", updated_at:"2024-02-10" },
    { id:3, txn_id:"TXN202401003", total_amount:"15000", payment_method:"Bank Transfer", status:"Failed",    student:3, created_at:"2024-01-30", updated_at:"2024-02-01" },
    { id:4, txn_id:"TXN202401004", total_amount:"15000", payment_method:"eSewa",         status:"Completed", student:4, created_at:"2024-02-20", updated_at:"2024-02-20" },
    { id:5, txn_id:"TXN202401005", total_amount:"15000", payment_method:"Khalti",        status:"Completed", student:5, created_at:"2024-03-05", updated_at:"2024-03-05" },
];
const MOCK_NOTICES = [
    { id:1, title:"Term Dates 2024–25",       description:"The academic year begins 1 September 2024 and ends 20 June 2025. Please ensure all boarders arrive by 18:00 on opening day.",    created_at:"2024-01-05", updated_at:"2024-01-05" },
    { id:2, title:"Fee Payment Deadline",     description:"All application fees must be settled before 15 April 2024. Late payments will incur an additional processing charge.",             created_at:"2024-02-12", updated_at:"2024-02-20" },
    { id:3, title:"Winter Sports Programme",  description:"Registration for the Winter Sports Programme is now open. Students in classes 9–12 are eligible. Forms available at the office.", created_at:"2024-03-01", updated_at:"2024-03-01" },
    { id:4, title:"Admissions Open for 2025", description:"We are now accepting applications for the academic year 2025–26. Early applicants receive priority consideration.",                  created_at:"2024-03-10", updated_at:"2024-03-10" },
];

/* ── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
    const cls: Record<string, string> = {
        Approved:  "badge badge-sky",
        Completed: "badge badge-success",
        Pending:   "badge badge-warning",
        Rejected:  "badge badge-danger",
        Failed:    "badge badge-danger",
    };
    return <span className={cls[status] ?? "badge badge-navy"}>{status}</span>;
}

/* ── Table primitives ────────────────────────────────────────────────────── */
function TableWrap({ children }: { children: React.ReactNode }) {
    return (
        <div className="card card-elevated" style={{ overflowX: "auto", borderRadius: "var(--radius-lg)" }}>
            <table className="data-table">{children}</table>
        </div>
    );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div
            className="animate-fade-in"
            style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(6,21,46,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, backdropFilter:"blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="card animate-fade-up" style={{ width:"100%", maxWidth:520, boxShadow:"var(--shadow-lg)", overflow:"hidden", borderRadius:"var(--radius-xl)" }}>
                <div style={{ background:"var(--navy-900)", padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span className="font-display" style={{ color:"white", fontSize:"1.05rem", fontWeight:700 }}>{title}</span>
                    <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:22, lineHeight:1 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "white")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>×</button>
                </div>
                <div style={{ padding:"28px 28px 24px" }}>{children}</div>
            </div>
        </div>
    );
}

/* ── Student detail modal ────────────────────────────────────────────────── */
function StudentDetail({ s, onClose }: { s: typeof MOCK_STUDENTS[0]; onClose: () => void }) {
    const rows: [string, string][] = [
        ["Phone",        s.phone_number],
        ["Class",        `Grade ${s.student_class}`],
        ["Year",         s.year],
        ["Address",      s.address],
        ["Parent",       `${s.parents_name} (${s.relation})`],
        ["Parent Phone", s.parents_phone_number],
        ["App Fee",      `NPR ${Number(s.application_fee).toLocaleString()}`],
        ["Status",       s.application_status],
        ["Comments",     s.comments || "–"],
        ["Created",      s.created_at],
        ["Updated",      s.updated_at],
    ];
    return (
        <Modal title="Student Detail" onClose={onClose}>
            <div className="flex items-center gap-4 mb-5">
                <div className="avatar avatar-lg">{s.full_name.split(" ").map(w => w[0]).slice(0,2).join("")}</div>
                <div>
                    <p className="font-display" style={{ fontSize:"1rem", fontWeight:700, color:"var(--navy-900)", margin:0 }}>{s.full_name}</p>
                    <p className="text-muted" style={{ fontSize:"0.8rem", marginTop:2 }}>ID #{s.id}</p>
                </div>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:16 }}>
                {rows.map(([k, v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:"0.8rem" }}>
                        <span className="label-caps text-muted">{k}</span>
                        <span style={{ color:"var(--navy-800)", textAlign:"right", maxWidth:"60%" }}>{v}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-end mt-5">
                <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
            </div>
        </Modal>
    );
}

/* ── Students tab ────────────────────────────────────────────────────────── */
function StudentsTab() {
    const [detail, setDetail] = useState<typeof MOCK_STUDENTS[0] | null>(null);
    return (
        <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-display" style={{ color:"var(--navy-900)", fontSize:"1.4rem", fontWeight:700, margin:0 }}>Students</h2>
                    <p className="text-muted mt-1" style={{ fontSize:"0.8rem" }}>{MOCK_STUDENTS.length} records found</p>
                </div>
            </div>
            <TableWrap>
                <thead>
                <tr>
                    {["#","Full Name","Phone","Class","Year","Parent","Fee","Status","Actions"].map(h => (
                        <th key={h}>{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {MOCK_STUDENTS.map(s => (
                    <tr key={s.id}>
                        <td className="text-muted" style={{ fontSize:"0.8rem" }}>{s.id}</td>
                        <td>
                            <div className="flex items-center gap-2.5">
                                <div className="avatar" style={{ width:32, height:32, fontSize:"0.7rem" }}>
                                    {s.full_name.split(" ").map(w => w[0]).slice(0,2).join("")}
                                </div>
                                <span style={{ fontWeight:600, color:"var(--navy-900)" }}>{s.full_name}</span>
                            </div>
                        </td>
                        <td className="text-muted">{s.phone_number}</td>
                        <td>Grade {s.student_class}</td>
                        <td className="text-muted">{s.year}</td>
                        <td className="text-muted">{s.parents_name}</td>
                        <td style={{ fontWeight:600 }}>NPR {Number(s.application_fee).toLocaleString()}</td>
                        <td><StatusBadge status={s.application_status}/></td>
                        <td>
                            <div className="flex gap-1.5 flex-nowrap">
                                <button className="btn btn-sky btn-sm"    onClick={() => setDetail(s)}>Detail</button>
                                <button className="btn btn-ghost btn-sm">Edit</button>
                                <button className="btn btn-sm" style={{ background:"rgba(229,62,62,0.1)", color:"var(--danger)", border:"1px solid rgba(229,62,62,0.2)" }}>Delete</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
            {detail && <StudentDetail s={detail} onClose={() => setDetail(null)}/>}
        </div>
    );
}

/* ── Payments tab ────────────────────────────────────────────────────────── */
function PaymentsTab() {
    return (
        <div className="animate-fade-up">
            <div className="mb-6">
                <h2 className="font-display" style={{ color:"var(--navy-900)", fontSize:"1.4rem", fontWeight:700, margin:0 }}>Payments</h2>
                <p className="text-muted mt-1" style={{ fontSize:"0.8rem" }}>{MOCK_PAYMENTS.length} transactions</p>
            </div>
            <TableWrap>
                <thead>
                <tr>{["#","Transaction ID","Student ID","Method","Amount","Status","Created","Updated"].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                {MOCK_PAYMENTS.map(p => (
                    <tr key={p.id}>
                        <td className="text-muted" style={{ fontSize:"0.8rem" }}>{p.id}</td>
                        <td><span style={{ fontFamily:"monospace", fontSize:"0.8rem", color:"var(--sky-600)", fontWeight:600 }}>{p.txn_id}</span></td>
                        <td className="text-muted">#{p.student}</td>
                        <td>{p.payment_method}</td>
                        <td style={{ fontWeight:700, color:"var(--navy-900)" }}>NPR {Number(p.total_amount).toLocaleString()}</td>
                        <td><StatusBadge status={p.status}/></td>
                        <td className="text-muted">{p.created_at}</td>
                        <td className="text-muted">{p.updated_at}</td>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
        </div>
    );
}

/* ── Notice form ─────────────────────────────────────────────────────────── */
function NoticeForm({ onBack, onSave }: { onBack: () => void; onSave: (n: { title: string; description: string }) => void }) {
    const [title,  setTitle]  = useState("");
    const [desc,   setDesc]   = useState("");
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
    const special = new Set('@_!#$%^&*()<>?/\\|}{~:');

    function validate() {
        const e: typeof errors = {};
        if (!title.trim()) e.title = "Title is required.";
        else if ([...title].some(c => special.has(c))) e.title = "Title must not contain special characters.";
        if (!desc.trim()) e.description = "Description is required.";
        return e;
    }
    function handleSubmit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        onSave({ title, description: desc });
    }

    return (
        <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack} className="btn btn-ghost btn-sm flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Notice
                </button>
                <span className="text-muted">/</span>
                <span style={{ fontSize:"0.85rem", color:"var(--text-muted)" }}>Create Notice</span>
            </div>

            <div className="card" style={{ maxWidth:600, overflow:"hidden" }}>
                <div style={{ background:"var(--navy-900)", padding:"20px 28px" }}>
                    <h2 className="font-display" style={{ color:"white", fontSize:"1.1rem", fontWeight:700, margin:0 }}>Create Notice</h2>
                    <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.8rem", marginTop:4 }}>Broadcast a notice to all students</p>
                </div>
                <div style={{ padding:28 }}>
                    <div style={{ marginBottom:16 }}>
                        <label className="label-caps text-muted" style={{ display:"block", marginBottom:6 }}>Title</label>
                        <input
                            className="input"
                            style={errors.title ? { borderColor:"var(--danger)" } : {}}
                            value={title}
                            onChange={e => { setTitle(e.target.value); setErrors(v => ({...v, title:undefined})); }}
                            placeholder="e.g. Term Dates 2024–25"
                        />
                        {errors.title && <p style={{ color:"var(--danger)", fontSize:"0.7rem", marginTop:4 }}>{errors.title}</p>}
                    </div>
                    <div style={{ marginBottom:16 }}>
                        <label className="label-caps text-muted" style={{ display:"block", marginBottom:6 }}>Description</label>
                        <textarea
                            className="input"
                            style={{ resize:"vertical", lineHeight:1.6, minHeight:120, ...(errors.description ? { borderColor:"var(--danger)" } : {}) }}
                            value={desc}
                            onChange={e => { setDesc(e.target.value); setErrors(v => ({...v, description:undefined})); }}
                            placeholder="Write the notice content here…"
                            rows={5}
                        />
                        {errors.description && <p style={{ color:"var(--danger)", fontSize:"0.7rem", marginTop:4 }}>{errors.description}</p>}
                    </div>
                    <div className="flex gap-3 justify-end mt-2">
                        <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>Save Notice</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Notice tab ──────────────────────────────────────────────────────────── */
function NoticeTab() {
    const [view,    setView]    = useState<"list"|"create">("list");
    const [notices, setNotices] = useState(MOCK_NOTICES);

    function handleSave(n: { title: string; description: string }) {
        const now = new Date().toISOString().split("T")[0];
        setNotices(prev => [...prev, { id:prev.length+1, ...n, created_at:now, updated_at:now }]);
        setView("list");
    }

    if (view === "create") return <NoticeForm onBack={() => setView("list")} onSave={handleSave}/>;

    return (
        <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-display" style={{ color:"var(--navy-900)", fontSize:"1.4rem", fontWeight:700, margin:0 }}>Notice Board</h2>
                    <p className="text-muted mt-1" style={{ fontSize:"0.8rem" }}>{notices.length} notices published</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2" onClick={() => setView("create")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Notice
                </button>
            </div>
            <TableWrap>
                <thead>
                <tr>{["#","Title","Description","Created","Updated"].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                {notices.map(n => (
                    <tr key={n.id}>
                        <td className="text-muted" style={{ fontSize:"0.8rem" }}>{n.id}</td>
                        <td style={{ fontWeight:600, color:"var(--navy-900)" }}>{n.title}</td>
                        <td className="text-muted" style={{ maxWidth:320 }}>
                                <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                                    {n.description}
                                </span>
                        </td>
                        <td className="text-muted">{n.created_at}</td>
                        <td className="text-muted">{n.updated_at}</td>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
        </div>
    );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, variant, icon }: { label: string; value: string|number; variant: string; icon: React.ReactNode }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="flex items-start justify-between mb-4">
                <p className="label-caps" style={{ opacity:0.8, margin:0 }}>{label}</p>
                <span style={{ opacity:0.7 }}>{icon}</span>
            </div>
            <p style={{ fontSize:"2.25rem", fontWeight:700, lineHeight:1, margin:0 }}>{value}</p>
        </div>
    );
}

/* ── Loading screen ──────────────────────────────────────────────────────── */
function LoadingScreen() {
    return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-primary)" }}>
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--sky-500)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p className="label-caps text-muted">Verifying session…</p>
            </div>
        </div>
    );
}

/* ── Main Dashboard ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
    // ✅ Called at page root — returns isChecking so nothing renders during redirect
     useAuthGuard();

    const [activeTab,   setActiveTab]   = useState<Tab>("Students");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Block render until auth check completes (prevents flash of protected content)

    function handleSignOut() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    return (
        <div className="app-shell">

            {/* ── Sidebar ── */}
            <aside className="app-sidebar" style={{ width: sidebarOpen ? "var(--sidebar-width)" : 68, transition:"width var(--duration-base) var(--ease-out-expo)" }}>

                {/* Logo */}
                <div style={{ padding:"20px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width:36, height:36, borderRadius:"var(--radius-md)", background:"linear-gradient(135deg, var(--gold-400), var(--gold-600))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy-950)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>
                    {sidebarOpen && (
                        <div style={{ overflow:"hidden" }}>
                            <p className="font-display" style={{ color:"white", fontSize:"0.95rem", fontWeight:700, margin:0, whiteSpace:"nowrap" }}>Academia</p>
                            <p className="label-caps" style={{ color:"rgba(255,255,255,0.35)", margin:0, whiteSpace:"nowrap" }}>Admin Dashboard</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex:1, padding:"12px 10px" }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`nav-item w-full border-none ${active ? "active" : ""}`}
                                    style={{ marginBottom:2 }}>
                                <span style={{ flexShrink:0 }}>{TAB_ICONS[tab]}</span>
                                {sidebarOpen && <span style={{ whiteSpace:"nowrap" }}>{tab}</span>}
                                {active && sidebarOpen && <span className="dot dot-sky ml-auto"/>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={handleSignOut} className="nav-item w-full border-none" style={{ marginBottom:4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        className="nav-item w-full border-none"
                        style={{ justifyContent: sidebarOpen ? "flex-end" : "center" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {sidebarOpen ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                        </svg>
                        {sidebarOpen && <span style={{ fontSize:"0.75rem" }}>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── Header ── */}
            <header className="app-header flex items-center justify-between px-8">
                <div className="flex items-center gap-2">
                    <span className="text-muted" style={{ fontSize:"0.75rem", fontWeight:500 }}>Dashboard</span>
                    <span className="text-muted">/</span>
                    <span className="label-caps text-navy">{activeTab}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="avatar">AD</div>
                    <div>
                        <p style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--navy-900)", margin:0 }}>Admin</p>
                        <p className="text-muted" style={{ fontSize:"0.7rem", margin:0 }}>admin@academia.ch</p>
                    </div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="app-main">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Students" value={MOCK_STUDENTS.length} variant="stat-card-navy"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                    <StatCard label="Total Payments" value={MOCK_PAYMENTS.length} variant="stat-card-sky"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                    />
                    <StatCard label="Total Notices" value={MOCK_NOTICES.length} variant="stat-card-gold"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                    />
                </div>

                {activeTab === "Students" && <StudentsTab />}
                {activeTab === "Payments" && <PaymentsTab />}
                {activeTab === "Notice"   && <NoticeTab />}
            </main>
        </div>
    );
}