"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ── All searchable content ──────────────────────────────────────────────────
const menuData = {
    Academic: [
        "Introduction",
        "Grades 6 to 10",
        "Grades 11 and 12",
        "Learning Support",
        "Academic Results",
        "Careers and University Guidance",
        "Unique Collaborations",
        "Global Campus",
    ],
    Boarding: [
        "Introduction",
        "Daily Life at Beau Soleil",
        "Weekends",
        "Our Boarding Houses",
        "Boarding House Team",
        "Health and Wellbeing",
        "High Expectations",
    ],
    "Co-curricular": [
        "Introduction",
        "The Hub",
        "School Challenges",
        "Creative and Performing Arts",
        { label: "Sports", hasArrow: true },
        "Outdoor Education",
        "Trips",
        { label: "Clubs and Activities", hasArrow: true },
    ],
    "About Us": [
        "Our Heritage",
        "Our Senior Leadership Team",
        "Nord Anglia Education",
        "The Good Schools Guide",
        "News and Events",
        "Careers",
        "Term Dates",
        "Contact Us",
    ],
};

// Flat list of all pages for search
const allPages: { title: string; section: string; description: string }[] = [
    ...Object.entries(menuData).flatMap(([section, items]) =>
        items.map((item) => ({
            title: typeof item === "string" ? item : item.label,
            section,
            description: `${section} — Beau Soleil Collège Alpin International`,
        }))
    ),
    { title: "Admissions", section: "Admissions", description: "How to apply to Beau Soleil" },
    { title: "Summer Camp", section: "Summer Camp", description: "Summer programmes at Beau Soleil" },
    { title: "Legal Notice", section: "Legal", description: "Legal information" },
    { title: "Privacy Policy", section: "Legal", description: "How we handle your data" },
    { title: "Accessibility", section: "Legal", description: "Accessibility statement" },
];

const bottomLinks = ["About Us", "News and Events", "Admissions", "Summer Camp", "Contact Us"];
const footerLeft = ["Careers", "Term Dates"];
const footerRight = ["Legal Notice", "Privacy Policy", "Accessibility"];

// ── Highlight matched text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: "#d4a820", color: "#0d2245", borderRadius: "2px", padding: "0 2px" }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ── Shield SVG (reused in multiple places) ─────────────────────────────────
const LOGO_SRC = "/logo.png";

// ══════════════════════════════════════════════════════════════════════════════
export default function BeauSoleilHome() {
    const [activeLang, setActiveLang] = useState<"EN" | "FR">("EN");
    const [activeNav, setActiveNav] = useState("HOME");
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when search opens
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 80);
        } else {
            setQuery("");
        }
    }, [searchOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setSearchOpen(false);
                setMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const navItems = ["HOME", "ACADEMIC", "BOARDING", "CO-CURRICULAR"];

    // Filter results
    const results = query.trim().length > 1
        ? allPages.filter(
            (p) =>
                p.title.toLowerCase().includes(query.toLowerCase()) ||
                p.section.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    const popular = ["Admissions", "Boarding", "Summer Camp", "Academic Results", "Contact Us", "Term Dates"];

    return (
        <main className="relative w-full h-screen overflow-hidden font-sans">

            {/* ── BACKGROUND IMAGE ── */}
            <Image
                src="school_bg.jpg"
                alt="Beau Soleil alpine campus"
                fill priority unoptimized
                style={{ objectFit: "cover", objectPosition: "center" }}
            />
            <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 40%, rgba(0,0,0,0.48) 100%)" }} />
            <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent, rgba(0,0,0,0.12))" }} />

            {/* ── TOP LEFT: Language switcher ── */}
            <div className="absolute top-6 left-7 z-20" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {(["EN", "FR"] as const).map((lang) => (
                    <button key={lang} onClick={() => setActiveLang(lang)}
                            style={{ background: "none", border: "none", borderBottom: activeLang === lang ? "2px solid #facc15" : "2px solid transparent", padding: "2px 2px 3px 2px", color: activeLang === lang ? "white" : "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s" }}>
                        {lang}
                    </button>
                ))}
            </div>

            {/* ── TOP CENTER: Logo + School Name ── */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ marginBottom: "6px" }}>
                    <Image src={LOGO_SRC} alt="Beau Soleil logo" width={54} height={60} style={{ objectFit: "contain" }} />
                </div>
                <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                    <p style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "white", fontSize: "20px", letterSpacing: "0.18em", fontWeight: 400, margin: 0, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>Beau Soleil</p>
                    <p style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "rgba(255,255,255,0.78)", fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase", margin: "3px 0 0 0" }}>Collège Alpin International</p>
                </div>
            </div>

            {/* ── TOP RIGHT: Enquire Now + Search + Hamburger ── */}
            <div className="absolute top-5 right-7 z-20" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <button
                    style={{ padding: "11px 30px", border: "1.5px solid rgba(255,255,255,0.85)", borderRadius: "999px", background: "transparent", color: "white", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#111"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "white"; }}
                >
                    ENQUIRE NOW
                </button>

                {/* Search icon — opens search overlay */}
                <button
                    onClick={() => setSearchOpen(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.8)", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7.5" /><line x1="17" y1="17" x2="22" y2="22" />
                    </svg>
                </button>

                {/* Hamburger */}
                <button
                    onClick={() => setMenuOpen(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "5px", alignItems: "flex-end", color: "rgba(255,255,255,0.8)", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                >
                    <span style={{ display: "block", width: "22px", height: "1.5px", background: "currentColor" }} />
                    <span style={{ display: "block", width: "22px", height: "1.5px", background: "currentColor" }} />
                    <span style={{ display: "block", width: "22px", height: "1.5px", background: "currentColor" }} />
                </button>
            </div>

            {/* ── RIGHT SIDE: Scroll arrows ── */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)", padding: "4px" }}>
                    <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 20 L8 2 M2 8 L8 2 L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)", padding: "4px" }}>
                    <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 2 L8 20 M2 14 L8 20 L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div>

            {/* ── BOTTOM LEFT: Virtual tour button ── */}
            <div className="absolute z-20" style={{ bottom: "88px", left: "20px" }}>
                <button style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                </button>
            </div>

            {/* ── BOTTOM NAV BAR ── */}
            <div className="absolute bottom-0 left-0 right-0 z-20" style={{ background: "linear-gradient(to right, rgba(12,18,28,0.94), rgba(18,26,40,0.97), rgba(12,18,28,0.94))", backdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 32px" }}>
                    <span style={{ color: "rgba(255,255,255,0.48)", fontSize: "10px", letterSpacing: "0.32em", textTransform: "uppercase", marginRight: "40px", fontWeight: 500 }}>EXPLORE</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {navItems.map((item, index) => (
                            <div key={item} style={{ display: "flex", alignItems: "center" }}>
                                {index > 0 && <div style={{ height: "1px", width: "50px", margin: "0 8px", background: "linear-gradient(to right, rgba(200,168,75,0.25), rgba(200,168,75,0.65), rgba(200,168,75,0.25))" }} />}
                                <button
                                    onClick={() => setActiveNav(item)}
                                    style={{ padding: "10px 26px", borderRadius: "999px", border: activeNav === item ? "1.5px solid white" : "1.5px solid rgba(255,255,255,0.35)", background: activeNav === item ? "white" : "transparent", color: activeNav === item ? "#111827" : "rgba(255,255,255,0.78)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.25s ease" }}
                                    onMouseEnter={(e) => { if (activeNav !== item) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"; e.currentTarget.style.color = "white"; } }}
                                    onMouseLeave={(e) => { if (activeNav !== item) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "rgba(255,255,255,0.78)"; } }}
                                >
                                    {item}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════════════ */}
            {searchOpen && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,16,32,0.92)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
                >
                    {/* Close */}
                    <button
                        onClick={() => setSearchOpen(false)}
                        style={{ position: "absolute", top: "24px", right: "32px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "28px", lineHeight: 1, padding: "4px 8px", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                    >
                        ✕
                    </button>

                    {/* Logo + title */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "60px", marginBottom: "40px" }}>
                        <Image src={LOGO_SRC} alt="Beau Soleil logo" width={46} height={52} style={{ objectFit: "contain" }} />
                        <p style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "white", fontSize: "16px", letterSpacing: "0.16em", margin: "8px 0 2px 0" }}>Beau Soleil</p>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "0.18em", margin: 0 }}>Search</p>
                    </div>

                    {/* Search input bar */}
                    <div style={{ width: "100%", maxWidth: "640px", padding: "0 24px", position: "relative" }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            {/* Search icon inside input */}
                            <svg
                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                                style={{ position: "absolute", left: "18px", pointerEvents: "none", zIndex: 1 }}
                            >
                                <circle cx="11" cy="11" r="7.5" /><line x1="17" y1="17" x2="22" y2="22" />
                            </svg>

                            <input
                                ref={searchInputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search pages, programmes, news…"
                                style={{
                                    width: "100%",
                                    padding: "18px 48px 18px 52px",
                                    borderRadius: "999px",
                                    border: "1.5px solid rgba(255,255,255,0.2)",
                                    background: "rgba(255,255,255,0.07)",
                                    color: "white",
                                    fontSize: "16px",
                                    letterSpacing: "0.02em",
                                    outline: "none",
                                    transition: "border-color 0.2s, background 0.2s",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = "#d4a820"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                            />

                            {/* Clear button */}
                            {query && (
                                <button
                                    onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
                                    style={{ position: "absolute", right: "18px", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px" }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results / suggestions */}
                    <div style={{ width: "100%", maxWidth: "640px", padding: "0 24px", marginTop: "20px", flex: 1, overflowY: "auto" }}>

                        {/* No query — show popular */}
                        {!query.trim() && (
                            <div>
                                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>
                                    Popular Pages
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {popular.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setQuery(p)}
                                            style={{ padding: "8px 18px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d4a820"; e.currentTarget.style.color = "#d4a820"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Has query — show results */}
                        {query.trim().length > 1 && (
                            <div>
                                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>
                                    {results.length > 0 ? `${results.length} Result${results.length !== 1 ? "s" : ""}` : "No results found"}
                                </p>

                                {results.length === 0 && (
                                    <div style={{ textAlign: "center", paddingTop: "40px" }}>
                                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
                                            No pages match <span style={{ color: "white" }}>"{query}"</span>
                                        </p>
                                        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", marginTop: "8px" }}>
                                            Try searching for Academic, Boarding, Sports, Admissions…
                                        </p>
                                    </div>
                                )}

                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {results.map((r, i) => (
                                        <li key={i}>
                                            <a
                                                href="#"
                                                onClick={() => setSearchOpen(false)}
                                                style={{ display: "flex", alignItems: "center", gap: "16px", padding: "14px 16px", borderRadius: "10px", textDecoration: "none", background: "rgba(255,255,255,0.03)", transition: "background 0.18s", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(212,168,32,0.1)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                                            >
                                                {/* Page icon */}
                                                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(212,168,32,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a820" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                </div>
                                                {/* Text */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ color: "white", fontSize: "14px", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        <Highlight text={r.title} query={query} />
                                                    </p>
                                                    <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "11px", margin: "2px 0 0 0" }}>
                                                        <Highlight text={r.section} query={query} />
                                                    </p>
                                                </div>
                                                {/* Arrow */}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Bottom hint */}
                    <div style={{ padding: "16px", display: "flex", gap: "20px", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
              <kbd style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontFamily: "monospace" }}>↵</kbd>
              to select
            </span>
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
              <kbd style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontFamily: "monospace" }}>Esc</kbd>
              to close
            </span>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
          HAMBURGER MENU OVERLAY
      ══════════════════════════════════════════ */}
            {menuOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "stretch" }}>
                    {/* Left bleed */}
                    <div style={{ flex: "0 0 19%", position: "relative", overflow: "hidden" }}>
                        <Image src="school_bg.jpg" alt="" fill unoptimized style={{ objectFit: "cover", objectPosition: "left center", filter: "brightness(0.55)" }} />
                    </div>

                    {/* Main navy panel */}
                    <div style={{ flex: 1, background: "#0d2245", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                        <button
                            onClick={() => setMenuOpen(false)}
                            style={{ position: "absolute", top: "22px", right: "28px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "26px", lineHeight: 1, padding: "4px 8px", opacity: 0.85, transition: "opacity 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
                        >
                            ✕
                        </button>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "24px", paddingBottom: "20px" }}>
                            <Image src={LOGO_SRC} alt="Beau Soleil logo" width={46} height={52} style={{ objectFit: "contain" }} />
                            <p style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "white", fontSize: "17px", letterSpacing: "0.16em", margin: "6px 0 0 0" }}>Beau Soleil</p>
                            <p style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "rgba(255,255,255,0.6)", fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", margin: "3px 0 0 0" }}>Collège Alpin International</p>
                        </div>

                        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 40px" }} />

                        <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 20px 40px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px", marginBottom: "32px" }}>
                                {(["Academic", "Boarding", "Co-curricular"] as const).map((section) => (
                                    <div key={section}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#d4a820", fontSize: "15px", fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1, minHeight: "100px", fontFamily: "Georgia,'Times New Roman',serif" }}>{section}</div>
                                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                                                {menuData[section].map((item, i) => {
                                                    const isObj = typeof item === "object";
                                                    const label = isObj ? item.label : item;
                                                    const hasArrow = isObj && item.hasArrow;
                                                    return (
                                                        <li key={i}>
                                                            <a href="#" style={{ color: "white", textDecoration: "none", fontSize: "13.5px", fontWeight: 400, display: "flex", alignItems: "center", gap: "6px", opacity: 0.9, transition: "opacity 0.2s" }}
                                                               onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                                               onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
                                                            >
                                                                {label}
                                                                {hasArrow && (
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                                                                        <polyline points="9 18 15 12 9 6" />
                                                                    </svg>
                                                                )}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "28px" }} />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#d4a820", fontSize: "15px", fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1, minHeight: "80px", fontFamily: "Georgia,'Times New Roman',serif" }}>About Us</div>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
                                            {menuData["About Us"].map((item, i) => (
                                                <li key={i}>
                                                    <a href="#" style={{ color: "white", textDecoration: "none", fontSize: "13.5px", fontWeight: 400, opacity: 0.9, transition: "opacity 0.2s" }}
                                                       onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                                       onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
                                                    >
                                                        {typeof item === "string" ? item : (item as { label: string; hasArrow?: boolean }).label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "16px 40px" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginBottom: "12px" }}>
                                {bottomLinks.map((link) => (
                                    <a key={link} href="#" style={{ color: "#d4a820", fontSize: "13px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s" }}
                                       onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                                       onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                                    >{link}</a>
                                ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: "24px" }}>
                                    {footerLeft.map((link) => (
                                        <a key={link} href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textDecoration: "none", transition: "color 0.2s" }}
                                           onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                                           onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                                        >{link}</a>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: "24px" }}>
                                    {footerRight.map((link) => (
                                        <a key={link} href="#" style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textDecoration: "none", transition: "color 0.2s" }}
                                           onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                                           onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                                        >{link}</a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right bleed */}
                    <div style={{ flex: "0 0 6%", position: "relative", overflow: "hidden" }}>
                        <Image src="school_bg.jpg" alt="" fill unoptimized style={{ objectFit: "cover", objectPosition: "right center", filter: "brightness(0.55)" }} />
                    </div>
                </div>
            )}

        </main>
    );
}