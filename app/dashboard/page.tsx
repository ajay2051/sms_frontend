"use client";

import {useState, useEffect, JSX} from "react";
import Image from "next/image";
import Link from "next/link";

// ── colour tokens (matches Academia navbar / footer palette) ──
const C = {
    navy:    "#0c2044",
    navyMid: "#10295a",
    navyLight:"#153066",
    blue:    "#1690d8",
    blueDark:"#0e4a7a",
    gold:    "#e2b23e",
    goldDark:"#c9700e",
    white:   "#ffffff",
    offWhite:"#f5f6fa",
    text:    "#4a5568",
    textMid: "#2d3748",
    border:  "rgba(12,32,68,0.10)",
    borderMid:"rgba(12,32,68,0.18)",
};

// ── sidebar tabs ──────────────────────────────────────────────
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

// ── mock data ─────────────────────────────────────────────────
const MOCK_STUDENTS = [
    { id:1, full_name:"Aarav Sharma",    phone_number:"9841000001", student_class:"10", year:"2024", address:"Kathmandu",   parents_name:"Rajesh Sharma",    relation:"Father", parents_phone_number:"9841000002", application_fee:"5000", application_status:"Approved",  comments:"Good student",  profile_pic:null, created_at:"2024-01-10", updated_at:"2024-03-12" },
    { id:2, full_name:"Priya Thapa",     phone_number:"9841000003", student_class:"8",  year:"2024", address:"Lalitpur",    parents_name:"Sunita Thapa",     relation:"Mother", parents_phone_number:"9841000004", application_fee:"5000", application_status:"Pending",   comments:"Awaiting docs", profile_pic:null, created_at:"2024-02-05", updated_at:"2024-03-14" },
    { id:3, full_name:"Rohan Pandey",    phone_number:"9841000005", student_class:"12", year:"2024", address:"Bhaktapur",   parents_name:"Mohan Pandey",     relation:"Father", parents_phone_number:"9841000006", application_fee:"5000", application_status:"Rejected",  comments:"Incomplete",    profile_pic:null, created_at:"2024-01-28", updated_at:"2024-03-10" },
    { id:4, full_name:"Sita Maharjan",   phone_number:"9841000007", student_class:"6",  year:"2024", address:"Patan",       parents_name:"Kumar Maharjan",   relation:"Father", parents_phone_number:"9841000008", application_fee:"5000", application_status:"Approved",  comments:"",              profile_pic:null, created_at:"2024-02-14", updated_at:"2024-03-15" },
    { id:5, full_name:"Bikash Gurung",   phone_number:"9841000009", student_class:"11", year:"2024", address:"Pokhara",     parents_name:"Dhan Gurung",      relation:"Father", parents_phone_number:"9841000010", application_fee:"5000", application_status:"Pending",   comments:"Interview due", profile_pic:null, created_at:"2024-03-01", updated_at:"2024-03-16" },
];

const MOCK_PAYMENTS = [
    { id:1, txn_id:"TXN202401001", total_amount:"15000", payment_method:"eSewa",       status:"Completed", student:1, created_at:"2024-01-15", updated_at:"2024-01-15" },
    { id:2, txn_id:"TXN202401002", total_amount:"15000", payment_method:"Khalti",      status:"Pending",   student:2, created_at:"2024-02-10", updated_at:"2024-02-10" },
    { id:3, txn_id:"TXN202401003", total_amount:"15000", payment_method:"Bank Transfer",status:"Failed",    student:3, created_at:"2024-01-30", updated_at:"2024-02-01" },
    { id:4, txn_id:"TXN202401004", total_amount:"15000", payment_method:"eSewa",       status:"Completed", student:4, created_at:"2024-02-20", updated_at:"2024-02-20" },
    { id:5, txn_id:"TXN202401005", total_amount:"15000", payment_method:"Khalti",      status:"Completed", student:5, created_at:"2024-03-05", updated_at:"2024-03-05" },
];

const MOCK_NOTICES = [
    { id:1, title:"Term Dates 2024–25",         description:"The academic year begins 1 September 2024 and ends 20 June 2025. Please ensure all boarders arrive by 18:00 on opening day.",   created_at:"2024-01-05", updated_at:"2024-01-05" },
    { id:2, title:"Fee Payment Deadline",       description:"All application fees must be settled before 15 April 2024. Late payments will incur an additional processing charge.",            created_at:"2024-02-12", updated_at:"2024-02-20" },
    { id:3, title:"Winter Sports Programme",    description:"Registration for the Winter Sports Programme is now open. Students in classes 9–12 are eligible. Forms available at the office.", created_at:"2024-03-01", updated_at:"2024-03-01" },
    { id:4, title:"Admissions Open for 2025",   description:"We are now accepting applications for the academic year 2025–26. Early applicants receive priority consideration.",                 created_at:"2024-03-10", updated_at:"2024-03-10" },
];

// ── status badge styles ───────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        Approved:  { bg:"rgba(22,144,216,0.12)", color:C.blue },
        Completed: { bg:"rgba(22,144,216,0.12)", color:C.blue },
        Pending:   { bg:"rgba(226,178,62,0.15)", color:"#9a6f0a" },
        Rejected:  { bg:"rgba(201,112,14,0.15)", color:C.goldDark },
        Failed:    { bg:"rgba(201,112,14,0.15)", color:C.goldDark },
    };
    const s = map[status] ?? { bg:"rgba(12,32,68,0.08)", color:C.navyMid };
    return (
        <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:700, letterSpacing:"0.07em", padding:"3px 10px", borderRadius:999, whiteSpace:"nowrap", textTransform:"uppercase" }}>
            {status}
        </span>
    );
}

// ── shared table wrapper ──────────────────────────────────────
function TableWrap({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ overflowX:"auto", borderRadius:12, border:`1px solid ${C.border}`, background:C.white }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                {children}
            </table>
        </div>
    );
}
function TH({ children, right }: { children: React.ReactNode; right?: boolean }) {
    return (
        <th style={{ padding:"12px 16px", textAlign: right ? "right" : "left", fontWeight:700, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:C.navyMid, background:C.offWhite, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>
            {children}
        </th>
    );
}
function TD({ children, right, muted }: { children: React.ReactNode; right?: boolean; muted?: boolean }) {
    return (
        <td style={{ padding:"13px 16px", textAlign: right ? "right" : "left", color: muted ? C.text : C.textMid, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
            {children}
        </td>
    );
}

// ── action button ─────────────────────────────────────────────
function ActionBtn({ label, color, onClick }: { label:string; color:string; onClick?:()=>void }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick}
                onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${color}`, background: hov ? color : "transparent", color: hov ? C.white : color, fontSize:11, fontWeight:700, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.18s", textTransform:"uppercase" }}>
            {label}
        </button>
    );
}

// ── primary button ────────────────────────────────────────────
function PrimaryBtn({ label, onClick }: { label:string; onClick?:()=>void }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick}
                onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:999, border:"none", background: hov ? C.navyMid : C.navy, color:C.white, fontSize:12, fontWeight:700, letterSpacing:"0.12em", cursor:"pointer", transition:"background 0.2s", textTransform:"uppercase" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {label}
        </button>
    );
}

// ── modal overlay (faux-viewport, no position:fixed) ──────────
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
    return (
        <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(9,26,56,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
             onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
            <div style={{ background:C.white, borderRadius:16, width:"100%", maxWidth:520, boxShadow:"0 20px 60px rgba(9,26,56,0.25)", overflow:"hidden" }}>
                <div style={{ background:C.navy, padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"Georgia,'Times New Roman',serif", color:C.white, fontSize:17, fontWeight:700 }}>{title}</span>
                    <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
                </div>
                <div style={{ padding:"28px 28px 24px" }}>{children}</div>
            </div>
        </div>
    );
}

// ── form field ────────────────────────────────────────────────
function Field({ label, children }: { label:string; children:React.ReactNode }) {
    return (
        <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.navyMid, marginBottom:6 }}>{label}</label>
            {children}
        </div>
    );
}
const inputStyle: React.CSSProperties = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.borderMid}`, borderRadius:8, fontSize:13, color:C.textMid, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

// ── detail modal content ──────────────────────────────────────
function StudentDetail({ s, onClose }: { s: typeof MOCK_STUDENTS[0]; onClose:()=>void }) {
    const rows: [string, string][] = [
        ["Phone",          s.phone_number],
        ["Class",          `Grade ${s.student_class}`],
        ["Year",           s.year],
        ["Address",        s.address],
        ["Parent",         `${s.parents_name} (${s.relation})`],
        ["Parent Phone",   s.parents_phone_number],
        ["App Fee",        `NPR ${Number(s.application_fee).toLocaleString()}`],
        ["Status",         s.application_status],
        ["Comments",       s.comments || "—"],
        ["Created",        s.created_at],
        ["Updated",        s.updated_at],
    ];
    return (
        <Modal title="Student Detail" onClose={onClose}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.navy})`, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontWeight:700, fontSize:18, flexShrink:0 }}>
                    {s.full_name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                <div>
                    <p style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:C.navy, margin:0 }}>{s.full_name}</p>
                    <p style={{ fontSize:12, color:C.text, margin:"2px 0 0" }}>ID #{s.id}</p>
                </div>
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
                {rows.map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
                        <span style={{ color:C.text, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.07em" }}>{k}</span>
                        <span style={{ color:C.textMid, textAlign:"right", maxWidth:"60%" }}>{v}</span>
                    </div>
                ))}
            </div>
            <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
                <button onClick={onClose} style={{ padding:"9px 24px", borderRadius:999, border:`1.5px solid ${C.navy}`, background:C.navy, color:C.white, fontSize:11, fontWeight:700, letterSpacing:"0.12em", cursor:"pointer", textTransform:"uppercase" }}>Close</button>
            </div>
        </Modal>
    );
}

// ── Students table ────────────────────────────────────────────
function StudentsTab() {
    const [detail, setDetail] = useState<typeof MOCK_STUDENTS[0]|null>(null);
    return (
        <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                    <h2 style={{ fontFamily:"Georgia,serif", color:C.navy, fontSize:22, fontWeight:700, margin:0 }}>Students</h2>
                    <p style={{ color:C.text, fontSize:13, margin:"4px 0 0" }}>{MOCK_STUDENTS.length} records found</p>
                </div>
            </div>
            <TableWrap>
                <thead>
                <tr>
                    <TH>#</TH>
                    <TH>Full Name</TH>
                    <TH>Phone</TH>
                    <TH>Class</TH>
                    <TH>Year</TH>
                    <TH>Parent</TH>
                    <TH>Fee</TH>
                    <TH>Status</TH>
                    <TH>Actions</TH>
                </tr>
                </thead>
                <tbody>
                {MOCK_STUDENTS.map((s,i)=>(
                    <tr key={s.id} style={{ background: i%2===0 ? C.white : C.offWhite }}>
                        <TD muted>{s.id}</TD>
                        <TD>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.navy})`, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontWeight:700, fontSize:11, flexShrink:0 }}>
                                    {s.full_name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                                </div>
                                <span style={{ fontWeight:600, color:C.navy }}>{s.full_name}</span>
                            </div>
                        </TD>
                        <TD muted>{s.phone_number}</TD>
                        <TD>Grade {s.student_class}</TD>
                        <TD muted>{s.year}</TD>
                        <TD muted>{s.parents_name}</TD>
                        <TD>NPR {Number(s.application_fee).toLocaleString()}</TD>
                        <TD><StatusBadge status={s.application_status}/></TD>
                        <TD>
                            <div style={{ display:"flex", gap:6, flexWrap:"nowrap" }}>
                                <ActionBtn label="Detail" color={C.blue}    onClick={()=>setDetail(s)} />
                                <ActionBtn label="Edit"   color={C.navyMid} />
                                <ActionBtn label="Delete" color={C.goldDark}/>
                            </div>
                        </TD>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
            {detail && <StudentDetail s={detail} onClose={()=>setDetail(null)} />}
        </div>
    );
}

// ── Payments table ────────────────────────────────────────────
function PaymentsTab() {
    return (
        <div>
            <div style={{ marginBottom:24 }}>
                <h2 style={{ fontFamily:"Georgia,serif", color:C.navy, fontSize:22, fontWeight:700, margin:0 }}>Payments</h2>
                <p style={{ color:C.text, fontSize:13, margin:"4px 0 0" }}>{MOCK_PAYMENTS.length} transactions</p>
            </div>
            <TableWrap>
                <thead>
                <tr>
                    <TH>#</TH>
                    <TH>Transaction ID</TH>
                    <TH>Student ID</TH>
                    <TH>Method</TH>
                    <TH right>Amount</TH>
                    <TH>Status</TH>
                    <TH>Created</TH>
                    <TH>Updated</TH>
                </tr>
                </thead>
                <tbody>
                {MOCK_PAYMENTS.map((p,i)=>(
                    <tr key={p.id} style={{ background: i%2===0 ? C.white : C.offWhite }}>
                        <TD muted>{p.id}</TD>
                        <TD><span style={{ fontFamily:"monospace", fontSize:12, color:C.blue, fontWeight:600 }}>{p.txn_id}</span></TD>
                        <TD muted>#{p.student}</TD>
                        <TD>{p.payment_method}</TD>
                        <TD right><span style={{ fontWeight:700, color:C.navy }}>NPR {Number(p.total_amount).toLocaleString()}</span></TD>
                        <TD><StatusBadge status={p.status}/></TD>
                        <TD muted>{p.created_at}</TD>
                        <TD muted>{p.updated_at}</TD>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
        </div>
    );
}

// ── Notice creation form (inline page) ───────────────────────
function NoticeForm({ onBack, onSave }: { onBack:()=>void; onSave:(n:{title:string;description:string})=>void }) {
    const [title, setTitle]       = useState("");
    const [desc,  setDesc]        = useState("");
    const [errors, setErrors]     = useState<{title?:string;description?:string}>({});
    const special = new Set('@_!#$%^&*()<>?/\\|}{~:');

    function validate() {
        const e: typeof errors = {};
        if (!title.trim()) e.title = "Title is required.";
        else if ([...title].some(c=>special.has(c))) e.title = "Title must not contain special characters.";
        if (!desc.trim()) e.description = "Description is required.";
        return e;
    }

    function handleSubmit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        onSave({ title, description: desc });
    }

    return (
        <div>
            {/* breadcrumb */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
                <button onClick={onBack} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:13, fontWeight:600, padding:0, display:"flex", alignItems:"center", gap:4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Notice
                </button>
                <span style={{ color:C.text, fontSize:13 }}>/</span>
                <span style={{ fontSize:13, color:C.text }}>Create Notice</span>
            </div>

            <div style={{ maxWidth:600, background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                <div style={{ background:C.navy, padding:"20px 28px" }}>
                    <h2 style={{ fontFamily:"Georgia,serif", color:C.white, fontSize:18, fontWeight:700, margin:0 }}>Create Notice</h2>
                    <p style={{ color:"rgba(255,255,255,0.55)", fontSize:12, margin:"4px 0 0" }}>Broadcast a notice to all students</p>
                </div>
                <div style={{ padding:28 }}>
                    <Field label="Title">
                        <input value={title} onChange={e=>{ setTitle(e.target.value); setErrors(v=>({...v,title:undefined})); }}
                               placeholder="e.g. Term Dates 2024–25"
                               style={{ ...inputStyle, borderColor: errors.title ? "#c9700e" : C.borderMid }} />
                        {errors.title && <p style={{ color:C.goldDark, fontSize:11, marginTop:4 }}>{errors.title}</p>}
                    </Field>
                    <Field label="Description">
                        <textarea value={desc} onChange={e=>{ setDesc(e.target.value); setErrors(v=>({...v,description:undefined})); }}
                                  placeholder="Write the notice content here…"
                                  rows={5}
                                  style={{ ...inputStyle, resize:"vertical", lineHeight:1.6, borderColor: errors.description ? "#c9700e" : C.borderMid }} />
                        {errors.description && <p style={{ color:C.goldDark, fontSize:11, marginTop:4 }}>{errors.description}</p>}
                    </Field>
                    <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                        <button onClick={onBack} style={{ padding:"10px 22px", borderRadius:999, border:`1.5px solid ${C.borderMid}`, background:"transparent", color:C.text, fontSize:11, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer", textTransform:"uppercase" }}>Cancel</button>
                        <button onClick={handleSubmit} style={{ padding:"10px 26px", borderRadius:999, border:"none", background:C.navy, color:C.white, fontSize:11, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer", textTransform:"uppercase" }}>Save Notice</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Notice tab ────────────────────────────────────────────────
function NoticeTab() {
    const [view, setView]     = useState<"list"|"create">("list");
    const [notices, setNotices] = useState(MOCK_NOTICES);

    function handleSave(n: { title:string; description:string }) {
        const now = new Date().toISOString().split("T")[0];
        setNotices(prev=>[...prev, { id: prev.length+1, ...n, created_at:now, updated_at:now }]);
        setView("list");
    }

    if (view==="create") return <NoticeForm onBack={()=>setView("list")} onSave={handleSave} />;

    return (
        <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                    <h2 style={{ fontFamily:"Georgia,serif", color:C.navy, fontSize:22, fontWeight:700, margin:0 }}>Notice Board</h2>
                    <p style={{ color:C.text, fontSize:13, margin:"4px 0 0" }}>{notices.length} notices published</p>
                </div>
                <PrimaryBtn label="Create Notice" onClick={()=>setView("create")} />
            </div>
            <TableWrap>
                <thead>
                <tr>
                    <TH>#</TH>
                    <TH>Title</TH>
                    <TH>Description</TH>
                    <TH>Created</TH>
                    <TH>Updated</TH>
                </tr>
                </thead>
                <tbody>
                {notices.map((n,i)=>(
                    <tr key={n.id} style={{ background: i%2===0 ? C.white : C.offWhite }}>
                        <TD muted>{n.id}</TD>
                        <TD><span style={{ fontWeight:600, color:C.navy }}>{n.title}</span></TD>
                        <TD muted>
                                <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                                    {n.description}
                                </span>
                        </TD>
                        <TD muted>{n.created_at}</TD>
                        <TD muted>{n.updated_at}</TD>
                    </tr>
                ))}
                </tbody>
            </TableWrap>
        </div>
    );
}

// ── stat card for header ──────────────────────────────────────
function StatCard({ label, value, accent }: { label:string; value:string|number; accent:string }) {
    return (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px", borderLeft:`4px solid ${accent}` }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.text, margin:0 }}>{label}</p>
            <p style={{ fontSize:24, fontWeight:700, color:C.navy, margin:"6px 0 0" }}>{value}</p>
        </div>
    );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Students");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    function handleSignOut() {
        localStorage.removeItem("access_token");
        window.location.href = "/";
    }

    const SIDEBAR_W = sidebarOpen ? 230 : 68;

    return (
        <div style={{ display:"flex", minHeight:"100vh", background:C.offWhite, fontFamily:"system-ui,-apple-system,sans-serif" }}>

            {/* ── SIDEBAR ── */}
            <aside style={{ width:SIDEBAR_W, minHeight:"100vh", background:C.navy, display:"flex", flexDirection:"column", flexShrink:0, transition:"width 0.25s", overflow:"hidden", position:"sticky", top:0, height:"100vh" }}>
                {/* logo */}
                <div style={{ padding:"24px 16px 20px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${C.gold},${C.goldDark})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                    {sidebarOpen && (
                        <div style={{ overflow:"hidden" }}>
                            <p style={{ fontFamily:"Georgia,serif", color:C.white, fontSize:14, fontWeight:700, margin:0, whiteSpace:"nowrap" }}>Academia</p>
                            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", margin:0, whiteSpace:"nowrap" }}>Dashboard</p>
                        </div>
                    )}
                </div>

                {/* nav */}
                <nav style={{ flex:1, padding:"16px 10px" }}>
                    {TABS.map(tab=>{
                        const active = activeTab === tab;
                        return (
                            <button key={tab} onClick={()=>setActiveTab(tab)}
                                    style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:8, border:"none", background: active ? "rgba(22,144,216,0.2)" : "transparent", color: active ? C.gold : "rgba(255,255,255,0.65)", cursor:"pointer", marginBottom:4, transition:"all 0.18s", textAlign:"left" }}>
                                <span style={{ flexShrink:0, color: active ? C.gold : "rgba(255,255,255,0.5)" }}>{TAB_ICONS[tab]}</span>
                                {sidebarOpen && <span style={{ fontSize:13, fontWeight: active ? 700 : 500, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{tab}</span>}
                                {active && <span style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:C.gold, flexShrink:0 }}/>}
                            </button>
                        );
                    })}
                </nav>

                {/* sign out */}
                <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={handleSignOut}
                            style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:8, border:"none", background:"transparent", color:"rgba(255,255,255,0.5)", cursor:"pointer", transition:"all 0.18s", textAlign:"left" }}
                            onMouseEnter={e=>(e.currentTarget.style.color="white")}
                            onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        {sidebarOpen && <span style={{ fontSize:13, fontWeight:500, whiteSpace:"nowrap" }}>Sign Out</span>}
                    </button>
                    {/* collapse toggle */}
                    <button onClick={()=>setSidebarOpen(v=>!v)}
                            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent: sidebarOpen ? "flex-end" : "center", padding:"8px 12px", borderRadius:8, border:"none", background:"transparent", color:"rgba(255,255,255,0.3)", cursor:"pointer", marginTop:4 }}
                            onMouseEnter={e=>(e.currentTarget.style.color="white")}
                            onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.3)")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {sidebarOpen ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                        </svg>
                        {sidebarOpen && <span style={{ fontSize:11, marginLeft:4 }}>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

                {/* topbar */}
                <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:11, color:C.text, fontWeight:500 }}>Dashboard</span>
                        <span style={{ color:C.border, fontSize:13 }}>/</span>
                        <span style={{ fontSize:11, color:C.navy, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{activeTab}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.navy})`, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontWeight:700, fontSize:12 }}>AD</div>
                        <div>
                            <p style={{ fontSize:12, fontWeight:700, color:C.navy, margin:0 }}>Admin</p>
                            <p style={{ fontSize:10, color:C.text, margin:0 }}>admin@academia.ch</p>
                        </div>
                    </div>
                </header>

                {/* stat cards */}
                <div style={{ padding:"24px 32px 0", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                    <StatCard label="Total Students" value={MOCK_STUDENTS.length}  accent={C.blue}    />
                    <StatCard label="Total Payments" value={MOCK_PAYMENTS.length}  accent={C.gold}    />
                    <StatCard label="Total Notices"  value={MOCK_NOTICES.length}   accent={C.navyMid} />
                </div>

                {/* content area */}
                <main style={{ flex:1, padding:"28px 32px 48px" }}>
                    {activeTab === "Students" && <StudentsTab />}
                    {activeTab === "Payments" && <PaymentsTab />}
                    {activeTab === "Notice"   && <NoticeTab />}
                </main>
            </div>
        </div>
    );
}