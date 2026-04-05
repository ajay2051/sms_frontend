"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL    ?? "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "/api/v1";

/* -- Types ----------------------------------------------------------------- */
type Tab = "Students" | "Payments" | "Notice";
const TABS: Tab[] = ["Students", "Payments", "Notice"];

export interface Student {
    id: number;
    full_name: string;
    phone_number: string;
    student_class: string;
    year: number;
    address: string;
    parents_name: string;
    relation: string | null;
    parents_phone_number: string;
    application_fee: string;
    application_status: string;
    comments: string | null;
    profile_pic: string | null;
    certificates: string[];
    created_at: string;
    updated_at: string;
    email: string;
}

interface StudentListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Student[];
}

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

/* -- Mock data (Payments + Notices stay mock for now) ---------------------- */
const MOCK_PAYMENTS = [
    { id:1, txn_id:"TXN202401001", total_amount:"15000", payment_method:"eSewa",         status:"Completed", student:1, created_at:"2024-01-15", updated_at:"2024-01-15" },
    { id:2, txn_id:"TXN202401002", total_amount:"15000", payment_method:"Khalti",        status:"Pending",   student:2, created_at:"2024-02-10", updated_at:"2024-02-10" },
    { id:3, txn_id:"TXN202401003", total_amount:"15000", payment_method:"Bank Transfer", status:"Failed",    student:3, created_at:"2024-01-30", updated_at:"2024-02-01" },
];
const MOCK_NOTICES = [
    { id:1, title:"Term Dates 2024-25",       description:"The academic year begins 1 September 2024 and ends 20 June 2025.",    created_at:"2024-01-05", updated_at:"2024-01-05" },
    { id:2, title:"Fee Payment Deadline",     description:"All application fees must be settled before 15 April 2024.",           created_at:"2024-02-12", updated_at:"2024-02-20" },
    { id:3, title:"Winter Sports Programme",  description:"Registration for the Winter Sports Programme is now open.",             created_at:"2024-03-01", updated_at:"2024-03-01" },
];

/* -- Helpers --------------------------------------------------------------- */
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "-";
}
function initials(name: string) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* -- Status badge ---------------------------------------------------------- */
function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase();
    const cls: Record<string, string> = {
        approved:  "badge badge-success",
        completed: "badge badge-success",
        pending:   "badge badge-warning",
        rejected:  "badge badge-danger",
        failed:    "badge badge-danger",
    };
    return <span className={cls[key] ?? "badge badge-navy"}>{capitalize(status)}</span>;
}

/* -- Table wrapper --------------------------------------------------------- */
function TableWrap({ children }: { children: React.ReactNode }) {
    return (
        <div className="card card-elevated" style={{ overflowX:"auto", borderRadius:"var(--radius-lg)" }}>
            <table className="data-table">{children}</table>
        </div>
    );
}

/* -- Skeleton row ---------------------------------------------------------- */
function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} style={{ padding:"14px 16px" }}>
                    <div style={{ height:14, borderRadius:4, background:"var(--slate-100)", animation:"pulse 1.4s ease-in-out infinite" }}/>
                </td>
            ))}
        </tr>
    );
}

/* -- Students tab ---------------------------------------------------------- */
function StudentsTab() {
    const router = useRouter();
    const [data,    setData]    = useState<StudentListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const PAGE_SIZE = 10;

    useEffect(() => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("access_token");
        const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
        if (search) params.set("search", search);

        fetch(`${BASE_URL}${API_VERSION}/student/list/?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then((d: StudentListResponse) => setData(d))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [page, search]);

    const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

    return (
        <div className="animate-fade-up">
            {/* Header row */}
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="font-display" style={{ color:"var(--navy-900)", fontSize:"1.4rem", fontWeight:700, margin:0 }}>Students</h2>
                    <p className="text-muted mt-1" style={{ fontSize:"0.8rem" }}>
                        {data ? `${data.count} record${data.count !== 1 ? "s" : ""} found` : "Loading..."}
                    </p>
                </div>
                {/* Search */}
                <div style={{ position:"relative" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2" strokeLinecap="round"
                         style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        className="input"
                        style={{ paddingLeft:36, width:240, fontSize:"0.85rem" }}
                        placeholder="Search students..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
                     style={{ background:"rgba(229,62,62,0.08)", border:"1px solid rgba(229,62,62,0.2)", color:"var(--danger)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error} -- check your connection or login again.
                </div>
            )}

            <TableWrap>
                <thead>
                <tr>
                    {["#","Student","Email","Phone","Class","Year","Status","Fee","Actions"].map(h => <th key={h}>{h}</th>)}
                </tr>
                </thead>
                <tbody>
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={9}/>)
                    : data?.results.length === 0
                        ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign:"center", padding:"48px 16px", color:"var(--text-muted)" }}>
                                    No students found.
                                </td>
                            </tr>
                        )
                        : data?.results.map(s => (
                            <tr key={s.id}>
                                <td className="text-muted" style={{ fontSize:"0.8rem" }}>{s.id}</td>
                                <td>
                                    <div className="flex items-center gap-2.5">
                                        {s.profile_pic
                                            ? <img src={s.profile_pic} alt={s.full_name}
                                                   style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:"2px solid var(--border)" }}/>
                                            : <div className="avatar" style={{ width:32, height:32, fontSize:"0.7rem", flexShrink:0 }}>{initials(s.full_name)}</div>
                                        }
                                        <span style={{ fontWeight:600, color:"var(--navy-900)" }}>{s.full_name}</span>
                                    </div>
                                </td>
                                <td className="text-muted" style={{ fontSize:"0.8rem" }}>{s.email}</td>
                                <td className="text-muted">{s.phone_number}</td>
                                <td>Grade {s.student_class}</td>
                                <td className="text-muted">{s.year}</td>
                                <td><StatusBadge status={s.application_status}/></td>
                                <td style={{ fontWeight:600 }}>NPR {Number(s.application_fee).toLocaleString()}</td>
                                <td>
                                    <div className="flex gap-1.5 flex-nowrap">
                                        <button
                                            className="btn btn-sky btn-sm"
                                            onClick={() => router.push(`/dashboard/students/${s.id}`)}
                                        >Detail</button>
                                        <button className="btn btn-ghost btn-sm">Edit</button>
                                        <button className="btn btn-sm"
                                                style={{ background:"rgba(229,62,62,0.08)", color:"var(--danger)", border:"1px solid rgba(229,62,62,0.2)" }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                }
                </tbody>
            </TableWrap>

            {/* Pagination */}
            {!loading && data && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-muted" style={{ fontSize:"0.8rem" }}>
                        Page {page} of {totalPages} ? {data.count} total
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={!data.previous}
                            onClick={() => setPage(p => p - 1)}
                            style={!data.previous ? { opacity:0.4, cursor:"not-allowed" } : {}}
                        >Prev</button>
                        <button
                            className="btn btn-ghost btn-sm"
                            disabled={!data.next}
                            onClick={() => setPage(p => p + 1)}
                            style={!data.next ? { opacity:0.4, cursor:"not-allowed" } : {}}
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* -- Payments tab ---------------------------------------------------------- */
function PaymentsTab() {
    return (
        <div className="animate-fade-up">
            <div className="mb-6">
                <h2 className="font-display" style={{ color:"var(--navy-900)", fontSize:"1.4rem", fontWeight:700, margin:0 }}>Payments</h2>
                <p className="text-muted mt-1" style={{ fontSize:"0.8rem" }}>{MOCK_PAYMENTS.length} transactions</p>
            </div>
            <TableWrap>
                <thead><tr>{["#","Transaction ID","Student ID","Method","Amount","Status","Created","Updated"].map(h=><th key={h}>{h}</th>)}</tr></thead>
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

/* -- Notice form ----------------------------------------------------------- */
function NoticeForm({ onBack, onSave }: { onBack:()=>void; onSave:(n:{title:string;description:string})=>void }) {
    const [title,  setTitle]  = useState("");
    const [desc,   setDesc]   = useState("");
    const [errors, setErrors] = useState<{title?:string; description?:string}>({});
    const special = new Set('@_!#$%^&*()<>?/\\|}{~:');

    function validate() {
        const e: typeof errors = {};
        if (!title.trim()) e.title = "Title is required.";
        else if ([...title].some(c => special.has(c))) e.title = "No special characters allowed.";
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
                        <input className="input" style={errors.title?{borderColor:"var(--danger)"}:{}} value={title}
                               onChange={e=>{setTitle(e.target.value);setErrors(v=>({...v,title:undefined}));}} placeholder="e.g. Term Dates 2024-25"/>
                        {errors.title && <p style={{color:"var(--danger)",fontSize:"0.7rem",marginTop:4}}>{errors.title}</p>}
                    </div>
                    <div style={{ marginBottom:16 }}>
                        <label className="label-caps text-muted" style={{ display:"block", marginBottom:6 }}>Description</label>
                        <textarea className="input" style={{resize:"vertical",lineHeight:1.6,minHeight:120,...(errors.description?{borderColor:"var(--danger)"}:{})}}
                                  value={desc} onChange={e=>{setDesc(e.target.value);setErrors(v=>({...v,description:undefined}));}}
                                  placeholder="Write the notice content here..." rows={5}/>
                        {errors.description && <p style={{color:"var(--danger)",fontSize:"0.7rem",marginTop:4}}>{errors.description}</p>}
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

/* -- Notice tab ------------------------------------------------------------ */
function NoticeTab() {
    const [view,    setView]    = useState<"list"|"create">("list");
    const [notices, setNotices] = useState(MOCK_NOTICES);

    function handleSave(n: {title:string; description:string}) {
        const now = new Date().toISOString().split("T")[0];
        setNotices(prev => [...prev, { id:prev.length+1, ...n, created_at:now, updated_at:now }]);
        setView("list");
    }

    if (view === "create") return <NoticeForm onBack={()=>setView("list")} onSave={handleSave}/>;

    return (
        <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-display" style={{color:"var(--navy-900)",fontSize:"1.4rem",fontWeight:700,margin:0}}>Notice Board</h2>
                    <p className="text-muted mt-1" style={{fontSize:"0.8rem"}}>{notices.length} notices published</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2" onClick={()=>setView("create")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create Notice
                </button>
            </div>
            <TableWrap>
                <thead><tr>{["#","Title","Description","Created","Updated"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                {notices.map(n => (
                    <tr key={n.id}>
                        <td className="text-muted" style={{fontSize:"0.8rem"}}>{n.id}</td>
                        <td style={{fontWeight:600,color:"var(--navy-900)"}}>{n.title}</td>
                        <td className="text-muted" style={{maxWidth:320}}>
                            <span style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{n.description}</span>
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

/* -- Stat card ------------------------------------------------------------- */
function StatCard({ label, value, variant, icon }: { label:string; value:string|number; variant:string; icon:React.ReactNode }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="flex items-start justify-between mb-4">
                <p className="label-caps" style={{opacity:0.8,margin:0}}>{label}</p>
                <span style={{opacity:0.7}}>{icon}</span>
            </div>
            <p style={{fontSize:"2.25rem",fontWeight:700,lineHeight:1,margin:0}}>{value}</p>
        </div>
    );
}

/* -- Loading screen -------------------------------------------------------- */
function LoadingScreen() {
    return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-primary)"}}>
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--sky-500)" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p className="label-caps text-muted">Verifying session...</p>
            </div>
        </div>
    );
}

/* -- Sidebar (shared layout component) ------------------------------------- */
export function DashboardSidebar({
                                     activeTab, setActiveTab, sidebarOpen, setSidebarOpen, onSignOut,
                                 }: {
    activeTab?: Tab; setActiveTab?: (t:Tab)=>void;
    sidebarOpen: boolean; setSidebarOpen: (v:boolean|((p:boolean)=>boolean))=>void;
    onSignOut: ()=>void;
}) {
    return (
        <aside className="app-sidebar" style={{ width:sidebarOpen?"var(--sidebar-width)":68, transition:"width var(--duration-base) var(--ease-out-expo)" }}>
            {/* Logo */}
            <div style={{padding:"20px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{width:36,height:36,borderRadius:"var(--radius-md)",background:"linear-gradient(135deg,var(--gold-400),var(--gold-600))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy-950)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
                {sidebarOpen && (
                    <div style={{overflow:"hidden"}}>
                        <p className="font-display" style={{color:"white",fontSize:"0.95rem",fontWeight:700,margin:0,whiteSpace:"nowrap"}}>Academia</p>
                        <p className="label-caps" style={{color:"rgba(255,255,255,0.35)",margin:0,whiteSpace:"nowrap"}}>Admin Dashboard</p>
                    </div>
                )}
            </div>
            {/* Nav */}
            <nav style={{flex:1,padding:"12px 10px"}}>
                {TABS.map(tab => {
                    const active = activeTab === tab;
                    return (
                        <button key={tab} onClick={()=>setActiveTab?.(tab)}
                                className={`nav-item w-full border-none ${active?"active":""}`} style={{marginBottom:2}}>
                            <span style={{flexShrink:0}}>{TAB_ICONS[tab]}</span>
                            {sidebarOpen && <span style={{whiteSpace:"nowrap"}}>{tab}</span>}
                            {active && sidebarOpen && <span className="dot dot-sky ml-auto"/>}
                        </button>
                    );
                })}
            </nav>
            {/* Bottom */}
            <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                <button onClick={onSignOut} className="nav-item w-full border-none" style={{marginBottom:4}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
                <button onClick={()=>setSidebarOpen(v=>!v)} className="nav-item w-full border-none"
                        style={{justifyContent:sidebarOpen?"flex-end":"center"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {sidebarOpen?<polyline points="15 18 9 12 15 6"/>:<polyline points="9 18 15 12 9 6"/>}
                    </svg>
                    {sidebarOpen && <span style={{fontSize:"0.75rem"}}>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}

/* -- Main Dashboard -------------------------------------------------------- */
export default function DashboardPage() {
    useAuthGuard();
    const [activeTab,   setActiveTab]   = useState<Tab>("Students");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [studentCount, setStudentCount] = useState<number>(0);


    function handleSignOut() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    return (
        <div className="app-shell">
            <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onSignOut={handleSignOut}/>

            {/* Header */}
            <header className="app-header flex items-center justify-between px-8">
                <div className="flex items-center gap-2">
                    <span className="text-muted" style={{fontSize:"0.75rem",fontWeight:500}}>Dashboard</span>
                    <span className="text-muted">/</span>
                    <span className="label-caps text-navy">{activeTab}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="avatar">AD</div>
                    <div>
                        <p style={{fontSize:"0.8rem",fontWeight:700,color:"var(--navy-900)",margin:0}}>Admin</p>
                        <p className="text-muted" style={{fontSize:"0.7rem",margin:0}}>admin@academia.ch</p>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="app-main">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total Students" value={studentCount || "-"} variant="stat-card-navy"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                    <StatCard label="Total Payments" value={MOCK_PAYMENTS.length} variant="stat-card-sky"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                    />
                    <StatCard label="Total Notices" value={MOCK_NOTICES.length} variant="stat-card-gold"
                              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                    />
                </div>

                {/* Pass count setter into Students tab */}
                {activeTab === "Students" && <StudentsTabWithCount onCount={setStudentCount}/>}
                {activeTab === "Payments" && <PaymentsTab/>}
                {activeTab === "Notice"   && <NoticeTab/>}
            </main>
        </div>
    );
}

/* Wrapper so stat card can reflect live count */
function StudentsTabWithCount({ onCount }: { onCount: (n:number)=>void }) {
    const router = useRouter();
    const [data,    setData]    = useState<StudentListResponse|null>(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState("");
    const [page,    setPage]    = useState(1);
    const [search,  setSearch]  = useState("");
    const PAGE_SIZE = 10;

    useEffect(()=>{
        setLoading(true); setError("");
        const token = localStorage.getItem("access_token");
        const params = new URLSearchParams({page:String(page), page_size:String(PAGE_SIZE)});
        if (search) params.set("search", search);
        fetch(`${BASE_URL}${API_VERSION}/student/list/?${params}`,{headers:{Authorization:`Bearer ${token}`}})
            .then(r=>{ if(!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
            .then((d:StudentListResponse)=>{ setData(d); onCount(d.count); })
            .catch(e=>setError(e.message))
            .finally(()=>setLoading(false));
    },[page,search]);

    const totalPages = data ? Math.ceil(data.count/PAGE_SIZE) : 1;

    return (
        <div className="animate-fade-up">
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="font-display" style={{color:"var(--navy-900)",fontSize:"1.4rem",fontWeight:700,margin:0}}>Students</h2>
                    <p className="text-muted mt-1" style={{fontSize:"0.8rem"}}>
                        {data ? `${data.count} record${data.count!==1?"s":""} found` : "Loading..."}
                    </p>
                </div>
                <div style={{position:"relative"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2" strokeLinecap="round"
                         style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input className="input" style={{paddingLeft:36,width:240,fontSize:"0.85rem"}}
                           placeholder="Search students..." value={search}
                           onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
                     style={{background:"rgba(229,62,62,0.08)",border:"1px solid rgba(229,62,62,0.2)",color:"var(--danger)"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                </div>
            )}

            <TableWrap>
                <thead>
                <tr>{["#","Student","Email","Phone","Class","Year","Status","Fee","Actions"].map(h=><th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                {loading
                    ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={9}/>)
                    : !data?.results.length
                        ? <tr><td colSpan={9} style={{textAlign:"center",padding:"48px 16px",color:"var(--text-muted)"}}>No students found.</td></tr>
                        : data.results.map(s=>(
                            <tr key={s.id}>
                                <td className="text-muted" style={{fontSize:"0.8rem"}}>{s.id}</td>
                                <td>
                                    <div className="flex items-center gap-2.5">
                                        {s.profile_pic
                                            ? <img src={s.profile_pic} alt={s.full_name} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid var(--border)"}}/>
                                            : <div className="avatar" style={{width:32,height:32,fontSize:"0.7rem",flexShrink:0}}>{initials(s.full_name)}</div>
                                        }
                                        <span style={{fontWeight:600,color:"var(--navy-900)"}}>{s.full_name}</span>
                                    </div>
                                </td>
                                <td className="text-muted" style={{fontSize:"0.8rem"}}>{s.email}</td>
                                <td className="text-muted">{s.phone_number}</td>
                                <td>Grade {s.student_class}</td>
                                <td className="text-muted">{s.year}</td>
                                <td><StatusBadge status={s.application_status}/></td>
                                <td style={{fontWeight:600}}>NPR {Number(s.application_fee).toLocaleString()}</td>
                                <td>
                                    <div className="flex gap-1.5 flex-nowrap">
                                        <button className="btn btn-sky btn-sm" onClick={()=>router.push(`/dashboard/students/${s.id}`)}>Detail</button>
                                        <button className="btn btn-ghost btn-sm">Edit</button>
                                        <button className="btn btn-sm" style={{background:"rgba(229,62,62,0.08)",color:"var(--danger)",border:"1px solid rgba(229,62,62,0.2)"}}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                }
                </tbody>
            </TableWrap>

            {!loading && data && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-muted" style={{fontSize:"0.8rem"}}>Page {page} of {totalPages} ? {data.count} total</p>
                    <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" disabled={!data.previous} onClick={()=>setPage(p=>p-1)}
                                style={!data.previous?{opacity:0.4,cursor:"not-allowed"}:{}}>Prev</button>
                        <button className="btn btn-ghost btn-sm" disabled={!data.next} onClick={()=>setPage(p=>p+1)}
                                style={!data.next?{opacity:0.4,cursor:"not-allowed"}:{}}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}