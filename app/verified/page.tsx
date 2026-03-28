"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LOGO_SRC = "/logo.png";

function SchoolLogo({ width = 46, height = 52 }: { width?: number; height?: number }) {
    return (
        <Image
            src={LOGO_SRC}
            alt="School logo"
            width={width}
            height={height}
            style={{ objectFit: "contain" }}
        />
    );
}

// Animated success checkmark SVG
function SuccessCheck() {
    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer pulse rings */}
            <div style={{
                position: "absolute", width: 140, height: 140, borderRadius: "50%",
                border: "2px solid rgba(34,197,94,0.2)",
                animation: "ring-pulse 2.5s ease-out infinite",
            }} />
            <div style={{
                position: "absolute", width: 120, height: 120, borderRadius: "50%",
                border: "2px solid rgba(34,197,94,0.3)",
                animation: "ring-pulse 2.5s ease-out 0.5s infinite",
            }} />

            {/* Circle background */}
            <div style={{
                width: 96, height: 96, borderRadius: "50%",
                background: "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.08))",
                border: "2px solid rgba(34,197,94,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 1,
            }}>
                {/* Check SVG with draw animation */}
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline
                        points="8,22 18,32 36,12"
                        stroke="#22c55e"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="50"
                        strokeDashoffset="0"
                        style={{ animation: "draw-check 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
                    />
                </svg>
            </div>
        </div>
    );
}

// Floating confetti dots
function Confetti() {
    const pieces = [
        { x: "8%",  y: "18%", size: 8,  color: "#e2b23e", shape: "circle",  delay: 0,   dur: 7 },
        { x: "88%", y: "12%", size: 6,  color: "#1690d8", shape: "square",  delay: 0.8, dur: 8 },
        { x: "15%", y: "72%", size: 7,  color: "#22c55e", shape: "circle",  delay: 1.5, dur: 6 },
        { x: "82%", y: "68%", size: 5,  color: "#e2b23e", shape: "square",  delay: 0.3, dur: 9 },
        { x: "45%", y: "8%",  size: 6,  color: "#1690d8", shape: "circle",  delay: 1.2, dur: 7 },
        { x: "72%", y: "80%", size: 8,  color: "#22c55e", shape: "square",  delay: 2,   dur: 8 },
        { x: "4%",  y: "45%", size: 5,  color: "#f472b6", shape: "circle",  delay: 0.6, dur: 6 },
        { x: "93%", y: "38%", size: 7,  color: "#a78bfa", shape: "square",  delay: 1.8, dur: 9 },
        { x: "58%", y: "90%", size: 5,  color: "#e2b23e", shape: "circle",  delay: 2.5, dur: 7 },
        { x: "28%", y: "88%", size: 6,  color: "#1690d8", shape: "square",  delay: 0.4, dur: 8 },
    ];

    return (
        <>
            {pieces.map((p, i) => (
                <div key={i} style={{
                    position: "absolute", left: p.x, top: p.y,
                    width: p.size, height: p.size,
                    borderRadius: p.shape === "circle" ? "50%" : "2px",
                    background: p.color, opacity: 0.6,
                    animation: `confetti-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
                    pointerEvents: "none",
                    transform: p.shape === "square" ? "rotate(45deg)" : "none",
                }} />
            ))}
        </>
    );
}

export default function VerifiedPage() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Slight delay so animation feels intentional
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
        @keyframes ring-pulse {
          0%   { transform: scale(0.85); opacity: 0.9; }
          70%  { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 50; opacity: 0; }
          to   { stroke-dashoffset: 0;  opacity: 1; }
        }
        @keyframes confetti-float {
          0%, 100% { transform: translateY(0px) rotate(0deg);   opacity: 0.6; }
          50%       { transform: translateY(-18px) rotate(180deg); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        .login-btn {
          width: 100%;
          padding: 15px 24px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #1690d8, #0d75bd);
          color: white;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(22,144,216,0.45);
        }
        .home-link {
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }
        .home-link:hover { color: rgba(255,255,255,0.8); }
      `}</style>

            <main style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg,#050f22 0%,#091a38 40%,#0e2550 70%,#0c1e3a 100%)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "40px 24px", position: "relative", overflow: "hidden",
            }}>
                {/* Background decorations */}
                <div style={{ position:"absolute", top:"-20%", right:"-15%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,197,94,0.07),transparent 65%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:"-15%", left:"-10%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(22,144,216,0.09),transparent 65%)",  pointerEvents:"none" }}/>
                <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>

                <Confetti />

                {/* Logo */}
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    marginBottom: 44, position: "relative", zIndex: 1,
                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                }}>
                    <SchoolLogo width={48} height={54} />
                    <p style={{ fontFamily:"Georgia,serif", color:"white", fontSize:18, letterSpacing:"0.18em", margin:"8px 0 2px" }}>Academia</p>
                    <p style={{ color:"rgba(255,255,255,0.35)", fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase" }}>Collège Alpin International</p>
                </div>

                {/* Card */}
                <div style={{
                    width: "100%", maxWidth: 480,
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 24,
                    padding: "52px 44px",
                    textAlign: "center",
                    position: "relative", zIndex: 1,
                    animation: "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both",
                }}>

                    {/* Success icon */}
                    <div style={{ marginBottom: 32 }}>
                        <SuccessCheck />
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontFamily: "Georgia,'Times New Roman',serif",
                        color: "white", fontSize: "clamp(1.5rem,3vw,2rem)",
                        fontWeight: 700, lineHeight: 1.25,
                        marginBottom: 14,
                        animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both",
                    }}>
                        Email Verified!
                    </h1>

                    {/* Sub text */}
                    <p style={{
                        color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.75,
                        marginBottom: 36,
                        animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.5s both",
                    }}>
                        Your email address has been successfully verified. Your Academia account is now active and ready to use.
                    </p>

                    {/* Divider */}
                    <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 32 }} />

                    {/* What's next */}
                    <div style={{
                        display: "flex", flexDirection: "column", gap: 12,
                        marginBottom: 36, textAlign: "left",
                        animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s both",
                    }}>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                            What&apos;s next
                        </p>
                        {[
                            { icon: "🔑", text: "Sign in with your email and password" },
                            { icon: "📋", text: "Complete your profile in the portal" },
                            { icon: "🏔️", text: "Explore your boarding and academic resources" },
                        ].map((item) => (
                            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(22,144,216,0.12)", border: "1px solid rgba(22,144,216,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                                }}>
                                    {item.icon}
                                </div>
                                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Go to login CTA */}
                    <div style={{ animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}>
                        <Link href="/login" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
                            <button className="login-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                    <polyline points="10 17 15 12 10 7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                Go to Sign In
                            </button>
                        </Link>

                        <Link href="/" className="home-link">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            Back to homepage
                        </Link>
                    </div>
                </div>

                {/* Footer note */}
                <p style={{
                    color: "rgba(255,255,255,0.18)", fontSize: 12,
                    marginTop: 28, textAlign: "center", lineHeight: 1.6,
                    position: "relative", zIndex: 1,
                    animation: "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.65s both",
                }}>
                    Having trouble? Contact{" "}
                    <a href="mailto:admissions@academia.ch" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                        admissions@academia.ch
                    </a>
                </p>
            </main>
        </>
    );
}