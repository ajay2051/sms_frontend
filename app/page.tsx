"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ══════════════════════════════════════════════════
//  ★  CHANGE THESE TWO VARIABLES ONLY
// ══════════════════════════════════════════════════
const LOGO_SRC    = "/logo.png";        // school logo image
const HERO_BG_SRC = "/school_bg.jpg";   // hero background image
// ══════════════════════════════════════════════════

const NAV_TABS = ["HOME", "ACADEMIC", "BOARDING", "CO-CURRICULAR"] as const;
type NavTab = typeof NAV_TABS[number];

// Section IDs for anchor-link navigation
const TAB_SECTION_MAP: Record<NavTab, string> = {
    HOME:           "section-hero",
    ACADEMIC:       "section-academic",
    BOARDING:       "section-boarding",
    "CO-CURRICULAR":"section-cocurricular",
};

const menuData = {
    Academic: ["Introduction","Grades 6 to 10","Grades 11 and 12","Learning Support","Academic Results","Careers and University Guidance","Unique Collaborations","Global Campus"],
    Admissions: ["Online Admission", "Online Fee Payment"],
    "Co-curricular": ["Introduction","The Hub","School Challenges","Creative and Performing Arts",{label:"Sports",hasArrow:true},"Outdoor Education","Trips",{label:"Clubs and Activities",hasArrow:true}],
    "About Us": ["Our Heritage","Our Senior Leadership Team","Nord Anglia Education","The Good Schools Guide","News and Events","Careers","Term Dates","Contact Us"],
};

const allPages = [
    ...Object.entries(menuData).flatMap(([section,items]) => items.map((item) => ({title:typeof item==="string"?item:item.label,section,description:`${section} · Academia`}))),
    {title:"Admissions",section:"Admissions",description:"How to apply"},
    {title:"Summer Camp",section:"Summer Camp",description:"Summer programmes"},
    {title:"Legal Notice",section:"Legal",description:"Legal information"},
    {title:"Privacy Policy",section:"Legal",description:"How we handle your data"},
    {title:"Accessibility",section:"Legal",description:"Accessibility statement"},
];

const FOOTER_LEFT   = ["Careers","Term Dates"];
const FOOTER_RIGHT  = ["Legal Notice","Privacy Policy","Accessibility"];

function Highlight({text,query}:{text:string;query:string}) {
    if(!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if(idx===-1) return <>{text}</>;
    return <>{text.slice(0,idx)}<mark style={{background:"#d4a820",color:"#0d2245",borderRadius:2,padding:"0 2px"}}>{text.slice(idx,idx+query.length)}</mark>{text.slice(idx+query.length)}</>;
}

function SchoolLogo({width=46,height=52}:{width?:number;height?:number}) {
    return <Image src={LOGO_SRC} alt="School logo" width={width} height={height} style={{objectFit:"contain"}} />;
}

function Crest({size=52}:{size?:number}) {
    return (
        <div style={{width:size,height:size,borderRadius:size*0.2,background:"linear-gradient(135deg,#e2b23e,#b8860b)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Image src={LOGO_SRC} alt="Crest" width={size*0.75} height={size*0.75} style={{objectFit:"contain"}} />
        </div>
    );
}

function AccentBar() {
    return <div style={{width:40,height:3,borderRadius:2,marginBottom:12,background:"linear-gradient(90deg,#e8b84b,#38a9eb)"}} />;
}

function SlideBtns() {
    return (
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
            {["Uncover","Find Out More"].map(label=>(
                <button key={label} style={{border:"1.5px solid rgba(255,255,255,0.5)",color:"white",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"10px 20px",borderRadius:999,background:"transparent",cursor:"pointer",transition:"all 0.2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.15)";e.currentTarget.style.borderColor="white";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.5)";}}
                >{label}</button>
            ))}
        </div>
    );
}

export default function HomePage() {
    const [activeLang,setActiveLang] = useState<"EN"|"FR">("EN");
    const [activeTab,setActiveTab]   = useState<NavTab>("HOME");
    const [navScrolled,setNavScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("access_token"));
    }, []);

    useEffect(()=>{const fn=()=>setNavScrolled(window.scrollY>60);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);

    // Scroll to section and set active tab
    const handleTabClick = (tab: NavTab) => {
        setActiveTab(tab);
        const sectionId = TAB_SECTION_MAP[tab];
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Update active tab based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            setNavScrolled(window.scrollY > 60);
            const tabs = (Object.entries(TAB_SECTION_MAP) as [NavTab, string][]);
            for (let i = tabs.length - 1; i >= 0; i--) {
                const el = document.getElementById(tabs[i][1]);
                if (el && window.scrollY >= el.offsetTop - 200) {
                    setActiveTab(tabs[i][0]);
                    break;
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* ═══════════════════════════════════════
          FIXED NAVBAR
      ═══════════════════════════════════════ */}
            <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:72,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",background:navScrolled?"rgba(9,26,56,0.96)":"transparent",backdropFilter:navScrolled?"blur(12px)":"none",boxShadow:navScrolled?"0 2px 24px rgba(0,0,0,0.25)":"none",transition:"background 0.35s,box-shadow 0.35s"}}>
                {/* Lang */}
                <div style={{display:"flex",gap:10}}>
                    {(["EN","FR"] as const).map(lang=>(
                        <button key={lang} onClick={()=>setActiveLang(lang)} style={{background:"none",border:"none",borderBottom:activeLang===lang?"2px solid #facc15":"2px solid transparent",padding:"2px 2px 3px",color:activeLang===lang?"white":"rgba(255,255,255,0.5)",fontSize:11,fontWeight:700,letterSpacing:"0.15em",cursor:"pointer"}}>{lang}</button>
                    ))}
                </div>

                {/* Logo */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <SchoolLogo width={40} height={44} />
                    <p style={{fontFamily:"Georgia,serif",color:"white",fontSize:17,letterSpacing:"0.18em",margin:"4px 0 0"}}>Academia</p>
                    <p style={{color:"rgba(255,255,255,0.5)",fontSize:8,letterSpacing:"0.22em",textTransform:"uppercase",margin:"2px 0 0"}}>Collège Alpin International</p>
                </div>

                {/* Actions */}
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                    {/* Auth-gated links */}
                    {isLoggedIn && (
                        <>
                            <Link href="/admissions" style={{color:"rgba(255,255,255,0.85)",fontSize:10,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",textDecoration:"none",padding:"6px 0",borderBottom:"1.5px solid transparent",transition:"all 0.2s"}}
                                  onMouseEnter={e=>(e.currentTarget.style.borderBottomColor="#facc15")}
                                  onMouseLeave={e=>(e.currentTarget.style.borderBottomColor="transparent")}
                            >ONLINE ADMISSION</Link>
                            <span style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>|</span>
                            <Link href="/fee" style={{color:"rgba(255,255,255,0.85)",fontSize:10,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",textDecoration:"none",padding:"6px 0",borderBottom:"1.5px solid transparent",transition:"all 0.2s"}}
                                  onMouseEnter={e=>(e.currentTarget.style.borderBottomColor="#facc15")}
                                  onMouseLeave={e=>(e.currentTarget.style.borderBottomColor="transparent")}
                            >ONLINE FEE PAYMENT</Link>
                            <span style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>|</span>
                        </>
                    )}

                    {/* Sign In / Sign Out */}
                    {isLoggedIn ? (
                        <button
                            onClick={() => {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("refresh_token");
                                localStorage.removeItem("user");
                                setIsLoggedIn(false);
                            }}
                            style={{padding:"10px 28px",border:"1.5px solid rgba(255,255,255,0.85)",borderRadius:999,background:"transparent",color:"white",fontSize:10,fontWeight:700,letterSpacing:"0.2em",cursor:"pointer",transition:"all 0.3s"}}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.15)";e.currentTarget.style.borderColor="white";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.85)";}}
                        >SIGN OUT</button>
                    ) : (
                        <Link href="/login">
                            <button
                                style={{padding:"10px 28px",border:"1.5px solid rgba(255,255,255,0.85)",borderRadius:999,background:"transparent",color:"white",fontSize:10,fontWeight:700,letterSpacing:"0.2em",cursor:"pointer",transition:"all 0.3s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="white";e.currentTarget.style.color="#111";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="white";}}
                            >SIGN IN</button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* ═══════════════════════════════════════
          FIXED EXPLORE TAB BAR — tabs now scroll to sections
      ═══════════════════════════════════════ */}
            <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,background:"rgba(9,26,56,0.92)",backdropFilter:"blur(10px)",borderTop:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",padding:"14px 32px"}}>
                <span style={{color:"rgba(255,255,255,0.45)",fontSize:10,letterSpacing:"0.32em",textTransform:"uppercase",marginRight:40,fontWeight:500,flexShrink:0}}>EXPLORE</span>
                <div style={{display:"flex",alignItems:"center"}}>
                    {NAV_TABS.map((tab,i)=>(
                        <div key={tab} style={{display:"flex",alignItems:"center"}}>
                            {i>0&&<div style={{height:1,width:50,margin:"0 8px",background:"linear-gradient(to right,rgba(200,168,75,0.25),rgba(200,168,75,0.65),rgba(200,168,75,0.25))"}}/>}
                            <a
                                href={`#${TAB_SECTION_MAP[tab]}`}
                                onClick={(e)=>{e.preventDefault();handleTabClick(tab);}}
                                style={{
                                    display:"inline-block",
                                    padding:"9px 24px",
                                    borderRadius:999,
                                    cursor:"pointer",
                                    whiteSpace:"nowrap",
                                    transition:"all 0.25s",
                                    fontSize:11,
                                    fontWeight:600,
                                    letterSpacing:"0.18em",
                                    textTransform:"uppercase",
                                    textDecoration:"none",
                                    border:activeTab===tab?"1.5px solid white":"1.5px solid rgba(255,255,255,0.35)",
                                    background:activeTab===tab?"white":"transparent",
                                    color:activeTab===tab?"#111827":"rgba(255,255,255,0.78)",
                                }}
                                onMouseEnter={e=>{if(activeTab!==tab){(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(255,255,255,0.7)";(e.currentTarget as HTMLAnchorElement).style.color="white";}}}
                                onMouseLeave={e=>{if(activeTab!==tab){(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(255,255,255,0.35)";(e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,0.78)";}}}
                            >{tab}</a>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════
          SCROLLABLE PAGE CONTENT
      ═══════════════════════════════════════ */}
            <main style={{paddingBottom:72}}>

                {/* ★ HERO */}
                <section id="section-hero" style={{position:"relative",height:"100vh",overflow:"hidden"}}>
                    <Image src={HERO_BG_SRC} alt="School campus" fill priority unoptimized style={{objectFit:"cover",objectPosition:"center"}} />
                    <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(0,0,0,0.22) 0%,transparent 40%,rgba(0,0,0,0.48) 100%)"}}/>
                    <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to right,rgba(0,0,0,0.1),transparent,rgba(0,0,0,0.1))"}}/>
                    {/* Scroll arrows */}
                    <div style={{position:"absolute",right:24,top:"50%",transform:"translateY(-50%)",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.75)",padding:4}}>
                            <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 20L8 2M2 8L8 2L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.75)",padding:4}}>
                            <svg width="16" height="22" viewBox="0 0 16 22" fill="none"><path d="M8 2L8 20M2 14L8 20L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                    </div>
                    {/* Virtual tour */}
                    <div style={{position:"absolute",bottom:96,left:20,zIndex:10}}>
                        <button style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </button>
                    </div>
                </section>

                {/* ★ INTRO + SUMMER CAMP */}
                <section style={{display:"grid",gridTemplateColumns:"1fr 340px"}}>
                    <div style={{background:"white",padding:"88px 80px"}}>
                        <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(1.6rem,2.8vw,2.2rem)",fontWeight:700,color:"#0c2044",lineHeight:1.3,marginBottom:36,maxWidth:680}}>One of the leading private boarding schools in Switzerland, Academia is home to a thriving international community of students aged 11 to 18.</h2>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginBottom:32,fontSize:"0.9375rem",lineHeight:1.8,color:"#4a5568"}}>
                            <div style={{display:"flex",flexDirection:"column",gap:20}}>
                                <p>Founded in 1910, Academia has long been regarded as one of Switzerland's finest private boarding schools. Our reputation is based not only on our holistic approach to education, but also our commitment to internationalism, warm boarding community, and strong values.</p>
                                <p>Uniquely located in a beautiful alpine village high in the Swiss Alps, Academia is a safe, inspiring, and exciting place to learn. Home to just 300 students — almost all full-time boarders — our school is like a family.</p>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:20}}>
                                <p>Life-changing opportunities — from whole-school challenges and global expeditions to our Winter Sports Programme — develop a breadth of skills, attributes, and experiences.</p>
                                <p>Inspired by passionate teachers and a caring community, our students gain outstanding academic results, preparing them for prestigious universities around the world.</p>
                            </div>
                        </div>
                        <button style={{border:"1.5px solid #10295a",color:"#10295a",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"12px 24px",borderRadius:999,background:"transparent",cursor:"pointer"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="#10295a";e.currentTarget.style.color="white";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#10295a";}}
                        >Find Out More</button>
                    </div>
                    <div style={{background:"#1690d8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"40px 32px",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
                        <h3 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"1.625rem",fontWeight:700,color:"white",textAlign:"center",lineHeight:1.3,position:"relative",zIndex:1}}>Summer Camps at Academia</h3>
                        <button style={{background:"#c9700e",color:"white",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"12px 24px",borderRadius:999,border:"none",cursor:"pointer",position:"relative",zIndex:1}}>Discover</button>
                        <div style={{flex:1,width:"100%",position:"relative",minHeight:220,zIndex:1}}>
                            <div style={{position:"absolute",top:32,left:"15%",right:"10%",height:2,background:"rgba(255,255,255,0.4)",transform:"rotate(18deg)",transformOrigin:"left center"}}/>
                            <div style={{position:"absolute",top:42,left:"52%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center"}}>
                                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#e8f4ff,#c0d8f0)",border:"3px solid rgba(255,255,255,0.4)",marginBottom:2}}/>
                                <div style={{width:36,height:56,borderRadius:8,background:"white",position:"relative"}}>
                                    <div style={{position:"absolute",top:8,left:2,right:2,height:2,background:"#e2b23e",borderRadius:1}}/>
                                    <div style={{position:"absolute",top:20,left:2,right:2,height:2,background:"#e2b23e",borderRadius:1}}/>
                                </div>
                                <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",width:2,height:32,background:"rgba(255,255,255,0.7)"}}/>
                                <div style={{display:"flex",gap:4,marginTop:2}}>
                                    <div style={{width:12,height:28,borderRadius:4,background:"#0e4a7a",transform:"rotate(10deg)"}}/>
                                    <div style={{width:12,height:28,borderRadius:4,background:"#0e4a7a",transform:"rotate(-5deg)"}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ★ ACADEMIC */}
                <section id="section-academic" style={{position:"relative",minHeight:"100vh",overflow:"hidden",background:"#1690d8"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:"58%",overflow:"hidden"}}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#1a3a5c 0%,#2d6a9f 40%,#1a8fd1 70%,#3caee8 100%)"}}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",userSelect:"none"}}>
                            <span style={{fontFamily:"Georgia,serif",fontWeight:700,lineHeight:0.8,color:"rgba(56,169,235,0.6)",letterSpacing:"-0.05em",fontSize:"clamp(12rem,20vw,17rem)"}}>"</span>
                        </div>
                        <div style={{position:"absolute",bottom:80,left:32,right:32,display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:10,transform:"perspective(900px) rotateY(5deg)"}}>
                            {[56,72,62,80,58,74,66,84,70,60,76,64,82,68,72,88].map((h,i)=>(
                                <div key={i} style={{position:"relative",width:44,height:h,flexShrink:0,borderRadius:"22px 22px 4px 4px",background:i%3===0?"#1a3a6c":i%3===1?"#2a5080":"#3a6090"}}>
                                    <div style={{position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"16px solid transparent",borderRight:"16px solid transparent",borderBottom:"14px solid #e2b23e"}}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"42%",display:"flex",alignItems:"center",paddingLeft:32,paddingRight:80,color:"white",textAlign:"right"}}>
                        <div>
                            <span style={{display:"block",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:12}}>Learning at Academia</span>
                            <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(2rem,3.5vw,2.75rem)",fontWeight:700,lineHeight:1.15,marginBottom:20}}>Unlocking passion and potential</h2>
                            <p style={{fontSize:"0.9375rem",lineHeight:1.75,color:"rgba(255,255,255,0.8)",marginBottom:32}}>At Academia, every student's education is unique to them. Personalised to individual passions and ambitions, our globally respected academic programmes — which include the International Baccalaureate and Advanced Studies Diploma — engage, motivate, and inspire our learners to excel.</p>
                            <SlideBtns/>
                        </div>
                    </div>
                </section>

                {/* ★ BOARDING */}
                <section id="section-boarding" style={{position:"relative",minHeight:"100vh",overflow:"hidden",background:"linear-gradient(160deg,#091a38 0%,#0e2550 60%,#153066 100%)"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:"55%",overflow:"hidden"}}>
                        <svg style={{position:"absolute",left:"4%",top:0,height:"100%",width:"42%",opacity:0.5}} viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                            <path d="M100 10 Q130 80 170 100 Q210 120 185 150 Q220 185 195 215 Q225 255 185 285 Q215 325 175 360 Q205 405 165 440 L135 440 L135 380 L145 380 L145 355 L105 355 L105 440 L75 440 L75 380 L85 380 L85 355 L65 355 Q25 405 35 440 L25 440 Q-15 400 10 360 Q-20 320 20 290 Q-10 255 30 225 Q-5 190 35 165 Q10 130 55 110 Q30 75 80 50Z" fill="#163470" opacity="0.9"/>
                            <ellipse cx="100" cy="60" rx="38" ry="27" fill="#1a4070" opacity="0.7"/>
                            <ellipse cx="158" cy="128" rx="30" ry="22" fill="#163870" opacity="0.65"/>
                            <ellipse cx="48" cy="142" rx="34" ry="24" fill="#1a4070" opacity="0.65"/>
                        </svg>
                        <div style={{position:"absolute",right:"4%",top:"18%",bottom:"18%",width:"40%",display:"flex",flexDirection:"column",gap:16,justifyContent:"center"}}>
                            {[{bg:"linear-gradient(135deg,#2d6a9f,#1a8fd1)",w:"92%",ml:"0%"},{bg:"linear-gradient(135deg,#e2b23e,#c9700e)",w:"85%",ml:"7%"},{bg:"linear-gradient(135deg,#9a3a7a,#6a1a5a)",w:"78%",ml:"12%"}].map((s,i)=>(
                                <div key={i} style={{height:68,borderRadius:4,overflow:"hidden",background:s.bg,transform:"skewX(-3deg)",width:s.w,marginLeft:s.ml}}/>
                            ))}
                        </div>
                    </div>
                    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"45%",display:"flex",alignItems:"center",paddingLeft:32,paddingRight:80,color:"white",textAlign:"right"}}>
                        <div>
                            <span style={{display:"block",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:12}}>Boarding at Academia</span>
                            <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(2rem,3.5vw,2.75rem)",fontWeight:700,lineHeight:1.15,marginBottom:20}}>A home away from home</h2>
                            <p style={{fontSize:"0.9375rem",lineHeight:1.75,color:"rgba(255,255,255,0.8)",marginBottom:32}}>Community is at the heart of the Academia boarding experience. Each of our six houses is a warm and welcoming home away from home, where students from around the world forge friendships that last a lifetime.</p>
                            <SlideBtns/>
                        </div>
                    </div>
                </section>

                {/* ★ CO-CURRICULAR */}
                <section id="section-cocurricular" style={{position:"relative",minHeight:"100vh",overflow:"hidden",background:"#091a38"}}>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#87a5bb 0%,#6a8fa8 25%,#4a7090 50%,#2a5070 75%,#0a2040 100%)"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#3a5a6a 0%,#1e3540 100%)",clipPath:"polygon(0% 100%,8% 50%,18% 70%,28% 25%,38% 55%,48% 10%,58% 45%,68% 30%,78% 60%,88% 35%,100% 55%,100% 100%)"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 0%,#0a2030 100%)",clipPath:"polygon(0% 100%,5% 68%,14% 78%,22% 52%,30% 72%,40% 44%,50% 68%,60% 50%,70% 72%,80% 52%,90% 70%,100% 58%,100% 100%)"}}/>
                    <div style={{position:"absolute",bottom:"51%",left:"33%"}}>
                        <div style={{width:3,height:40,background:"rgba(240,220,160,0.85)",margin:"0 auto"}}/>
                        <div style={{height:3,width:24,background:"rgba(240,220,160,0.85)",marginTop:-28,marginLeft:-10}}/>
                    </div>
                    <div style={{position:"absolute",bottom:"42%",left:"18%",display:"flex",alignItems:"flex-end",gap:12}}>
                        {[{body:"#1a3a6c",skin:"#8a7060",h:36},{body:"#3a5a8a",skin:"#7a6050",h:30},{body:"#4a7a9a",skin:"#9a8070",h:40},{body:"#3a6090",skin:"#6a5040",h:28},{body:"#2a5888",skin:"#8a7060",h:38}].map((f,i)=>(
                            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                <div style={{width:16,height:16,borderRadius:"50%",background:f.skin,marginBottom:2}}/>
                                <div style={{width:14,height:f.h,borderRadius:2,background:f.body}}/>
                                <div style={{display:"flex",gap:2,marginTop:2}}>
                                    <div style={{width:5,height:16,borderRadius:2,background:"#1e1e50"}}/><div style={{width:5,height:16,borderRadius:2,background:"#1e1e50"}}/>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{position:"absolute",top:"-8%",right:"-8%",width:320,height:320,borderRadius:"50%",background:"linear-gradient(135deg,rgba(30,80,140,0.6),rgba(20,50,100,0.4))",border:"2px solid rgba(100,160,210,0.2)"}}/>
                    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"44%",display:"flex",alignItems:"center",paddingLeft:32,paddingRight:80,color:"white",textAlign:"right"}}>
                        <div>
                            <span style={{display:"block",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:12}}>The Academia Experience</span>
                            <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(2rem,3.5vw,2.75rem)",fontWeight:700,lineHeight:1.15,marginBottom:20}}>Endless opportunities for adventure</h2>
                            <p style={{fontSize:"0.9375rem",lineHeight:1.75,color:"rgba(255,255,255,0.8)",marginBottom:32}}>At Academia, we believe it's what you do that counts. From character-building challenges and community service projects to alpine adventures and global expeditions, we offer an unparalleled range of experiences that shape our students' futures.</p>
                            <SlideBtns/>
                        </div>
                    </div>
                </section>

                {/* ★ ABOUT TEXT */}
                <section style={{background:"white",padding:"88px 80px"}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:40}}><Crest/></div>
                    <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"clamp(1.35rem,2.5vw,1.875rem)",fontWeight:700,color:"#0c2044",textAlign:"center",lineHeight:1.3,maxWidth:760,margin:"0 auto 64px"}}>One of the leading private boarding schools in Switzerland, Academia is home to a thriving international community of students aged 11 to 18.</h2>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,maxWidth:1100,margin:"0 auto",fontSize:"0.9375rem",lineHeight:1.8,color:"#4a5568"}}>
                        <div style={{display:"flex",flexDirection:"column",gap:20}}>
                            <p>Founded in 1910, Academia has long been regarded as one of Switzerland's finest private boarding schools.</p>
                            <p>Uniquely located in a beautiful alpine village high in the Swiss Alps, Academia is a safe, inspiring, and exciting place to learn.</p>
                            <p>Our educational philosophy empowers our students to be the best they can be. Learning is personalised to individual strengths, passions, and ambitions.</p>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:20}}>
                            <p>Life-changing opportunities develop a breadth of skills, attributes, and experiences. They also nurture our students' understanding of the world around them.</p>
                            <p>Inspired by passionate teachers and a caring community, our students gain outstanding academic results and go on to prestigious universities worldwide.</p>
                            <button style={{alignSelf:"flex-start",border:"1.5px solid #10295a",color:"#10295a",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"12px 24px",borderRadius:999,background:"transparent",cursor:"pointer"}}
                                    onMouseEnter={e=>{e.currentTarget.style.background="#10295a";e.currentTarget.style.color="white";}}
                                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#10295a";}}
                            >Find Out More</button>
                        </div>
                    </div>
                </section>

                {/* ★ LOCATION */}
                <section style={{background:"#0c2044",overflow:"hidden"}}>
                    <div style={{padding:"64px 80px 48px",position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:-80,right:-64,width:384,height:384,borderRadius:"50%",background:"radial-gradient(circle,#1a8fd1,transparent)",opacity:0.2}}/>
                        <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",color:"white",fontSize:"clamp(1.75rem,3vw,2.5rem)",fontWeight:700,maxWidth:560,lineHeight:1.25,position:"relative",zIndex:1}}>Our location in the Swiss Alps allows unmatched opportunities</h2>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                        <div style={{position:"relative",minHeight:420,overflow:"hidden"}}>
                            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#7aa5c0 0%,#4a7898 25%,#2a5878 50%,#0e2d50 100%)"}}/>
                            <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#2a5060 0%,#0e2030 100%)",clipPath:"polygon(0% 100%,10% 45%,22% 65%,33% 20%,46% 55%,58% 15%,68% 48%,80% 28%,90% 58%,100% 35%,100% 100%)"}}/>
                        </div>
                        <div style={{background:"white",padding:"56px 64px"}}>
                            <AccentBar/>
                            <h3 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"1.625rem",fontWeight:700,color:"#0c2044",lineHeight:1.3,marginBottom:20}}>Awe-inspiring outdoor adventures</h3>
                            <p style={{fontSize:"0.9375rem",lineHeight:1.75,color:"#4a5568",marginBottom:24}}>Our outdoor education programme is packed with exhilarating adventures. From mountain climbing to canyoning, cross-country skiing to canoeing, our students push themselves beyond their comfort zone, overcome challenges, and work as a team.</p>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:24}}>
                                {["linear-gradient(135deg,#2d7a4f,#1a5a38)","linear-gradient(135deg,#2d6a9f,#1a4a7a)","linear-gradient(135deg,#c9700e,#8a4a0a)","linear-gradient(135deg,#153066,#091a38)"].map((bg,i)=>(
                                    <div key={i} style={{aspectRatio:"3/4",borderRadius:6,background:bg,position:"relative",cursor:"pointer"}}>
                                        <div style={{position:"absolute",bottom:6,right:6,width:20,height:20,borderRadius:"50%",background:"#c9700e",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:"0.75rem",fontWeight:700}}>+</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ★ QUOTE + MOSAIC */}
                <section style={{background:"#f5f6fa",padding:"88px 80px",textAlign:"center"}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:32}}><Crest/></div>
                    <blockquote style={{fontFamily:"Georgia,'Times New Roman',serif",fontStyle:"italic",color:"#0c2044",lineHeight:1.6,maxWidth:900,margin:"0 auto 20px",fontSize:"clamp(1.1rem,2vw,1.45rem)"}}>
                        "School is a place to be curious, to take initiative, and to discover new experiences in a community built on trust, respect, and kindness. I invite all of our students to grasp the wonderful opportunities offered by Academia with enthusiasm and an open mind."
                    </blockquote>
                    <p style={{fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#8a97b2"}}>— Benjamin Turner, Principal</p>
                    <div style={{position:"relative",marginTop:64,maxWidth:1100,margin:"64px auto 0",display:"grid",gridTemplateColumns:"200px 380px 200px 280px",gridTemplateRows:"200px 180px",gap:12}}>
                        {[{bg:"linear-gradient(135deg,#1a3a6c,#2d5a9f)",col:"1",row:"1/3"},{bg:"linear-gradient(135deg,#2d6a9f,#1a8fd1)",col:"2",row:"1"},{bg:"linear-gradient(135deg,#153066,#0e2550)",col:"3",row:"1"},{bg:"linear-gradient(135deg,#c9970f,#e2b23e)",col:"4",row:"1/3"},{bg:"linear-gradient(135deg,#0d75bd,#3caee8)",col:"2",row:"2"},{bg:"linear-gradient(135deg,#0e2550,#153066)",col:"3",row:"2"}].map((p,i)=>(
                            <div key={i} style={{background:p.bg,borderRadius:8,gridColumn:p.col,gridRow:p.row}}/>
                        ))}
                        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(9,26,56,0.75)",backdropFilter:"blur(4px)",color:"white",fontSize:"0.72rem",fontWeight:600,padding:"6px 16px",borderRadius:999,whiteSpace:"nowrap",pointerEvents:"none"}}>Drag cursor to move</div>
                    </div>
                </section>

                {/* ★ CAMPUS */}
                <section style={{background:"white",padding:"88px 80px",textAlign:"center"}}>
                    <div style={{display:"flex",justifyContent:"center",marginBottom:32}}><Crest/></div>
                    <p style={{fontFamily:"Georgia,'Times New Roman',serif",color:"#0c2044",lineHeight:1.7,maxWidth:820,margin:"0 auto 64px",fontSize:"clamp(1.05rem,1.7vw,1.3rem)"}}>Tucked away in an idyllic alpine village — and surrounded by magnificent mountain peaks, verdant pine forests, and big skies — our campus is an inspiring Swiss boarding school to live and learn.</p>
                    <div style={{width:"100%",maxWidth:1100,margin:"0 auto",height:384,borderRadius:16,overflow:"hidden",position:"relative"}}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#c8dce8 0%,#9ab8cc 20%,#6a94b0 40%,#3a6a88 60%,#1a4060 80%,#0a2030 100%)"}}/>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(40,80,100,0) 0%,rgba(10,30,50,0.9) 100%)",clipPath:"polygon(0% 100%,5% 60%,15% 75%,25% 40%,35% 65%,50% 25%,65% 60%,75% 40%,85% 70%,95% 50%,100% 65%,100% 100%)"}}/>
                        <div style={{position:"absolute",bottom:"28%",right:"16%",width:176,height:140,borderRadius:"3px 3px 0 0",background:"linear-gradient(180deg,#d8e8f0,#c0d0dc)",boxShadow:"0 8px 30px rgba(0,0,0,0.3)"}}/>
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"28%",background:"linear-gradient(180deg,#1e3a4a,#0a1e2a)"}}/>
                    </div>
                </section>

                {/* ★ ADMISSIONS */}
                <section style={{overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 380px 1fr"}}>
                        <div style={{position:"relative",minHeight:520,overflow:"hidden",background:"linear-gradient(160deg,#1a3060,#0e2040)"}}>
                            <div style={{position:"absolute",top:24,left:"50%",transform:"translateX(-50%)",width:56,height:56,borderRadius:"50%",border:"2px dashed rgba(255,255,255,0.4)",background:"rgba(9,26,56,0.7)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                                <div style={{width:0,height:0,marginLeft:3,borderLeft:"14px solid #c9700e",borderTop:"9px solid transparent",borderBottom:"9px solid transparent"}}/>
                            </div>
                            <div style={{position:"absolute",top:96,left:16,right:16,display:"flex",flexWrap:"wrap",gap:8}}>
                                {[{l:"#Respect",bg:"#10295a"},{l:"#Responsibility",bg:"#c9970f"},{l:"#Ambition",bg:"#1a8fd1"},{l:"#Determination",bg:"#c9700e"}].map((t,i)=>(
                                    <span key={i} style={{background:t.bg,color:"white",fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.06em",padding:"4px 12px",borderRadius:4}}>{t.l}</span>
                                ))}
                            </div>
                            <div style={{position:"absolute",bottom:"12%",left:"8%",right:"8%"}}>
                                <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:6}}>
                                    {["#8a7060","#6a5040","#9a8070","#c8a882","#8a7060","#7a6050","#d4a882"].map((c,i)=>(
                                        <div key={i} style={{width:20,height:24,borderRadius:"10px 10px 4px 4px",background:c}}/>
                                    ))}
                                </div>
                                <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                                    {["#c8a882","#9a7858","#7a6050","#e8c090","#8a6848","#c8a882"].map((c,i)=>(
                                        <div key={i} style={{width:26,height:32,borderRadius:"12px 12px 4px 4px",background:c}}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{background:"#10295a",color:"white",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:20,padding:"56px 40px"}}>
                            <Crest/>
                            <h2 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"1.875rem",fontWeight:700}}>Admissions</h2>
                            <p style={{fontSize:"0.9rem",lineHeight:1.7,color:"rgba(255,255,255,0.75)"}}>We're delighted that you're interested in joining the Academia family. Your journey starts with our expert Admissions Team, who will guide you through the process — from helping you submit your application form to arranging a guided tour.</p>
                            <p style={{fontSize:"0.875rem",lineHeight:1.7,color:"rgba(255,255,255,0.6)"}}>Our school — which is home to around 300 students — is small but diverse. Places are limited, and we'd encourage you to apply as soon as possible.</p>
                            <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",marginTop:8}}>
                                {["Arrange a Visit","Applications"].map(label=>(
                                    <button key={label} style={{width:"100%",border:"1.5px solid rgba(255,255,255,0.5)",color:"white",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:12,borderRadius:999,background:"transparent",cursor:"pointer",transition:"all 0.2s"}}
                                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="white";}}
                                            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.5)";}}
                                    >{label}</button>
                                ))}
                            </div>
                        </div>
                        <div style={{position:"relative",minHeight:520,overflow:"hidden",background:"linear-gradient(160deg,#0e2040,#060f20)"}}>
                            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {[{w:200,h:300,a:0.28},{w:150,h:220,a:0.22},{w:100,h:150,a:0.18},{w:50,h:72,a:0.14}].map((r,i)=>(
                                    <div key={i} style={{position:"absolute",width:r.w,height:r.h,borderRadius:"50%",border:`${3-i*0.5}px solid rgba(100,160,210,${r.a})`}}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ★ FOOTER */}
                <footer style={{background:"#0c2044",color:"white",padding:"80px 80px 32px"}}>
                    <div style={{textAlign:"center",marginBottom:56}}>
                        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><SchoolLogo width={56} height={64}/></div>
                        <div style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"1.5rem",fontWeight:700}}>Academia</div>
                        <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",color:"rgba(255,255,255,0.4)",marginTop:4}}>Collège Alpin International</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr 1fr 1fr 1fr",gap:32,paddingBottom:48,marginBottom:32,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                        {[
                            {title:"Contact us",items:["Collège Alpin Academia","Route du Village 1","1884 Villars-sur-Ollon","Switzerland","","info@academia.ch","+41 24 496 26 26"],social:true},
                            {title:"Information",items:["News and events","Summer camp","Careers at Academia","","Summer Camp","summercamp@academia.ch","+41 24 496 26 46"]},
                            {title:"Quick Access",items:["Online payments","Term dates"]},
                            {title:"Admissions",items:["Application process","Application form","Admission team","Terms and conditions","","Admissions","admissions@academia.ch","+41 24 496 26 10"]},
                            {title:"Policies",items:["Legal notice","Website privacy and cookie policy","Accessibility statement"]},
                        ].map((col,ci)=>(
                            <div key={ci}>
                                <h4 style={{fontFamily:"Georgia,'Times New Roman',serif",fontSize:"1.125rem",fontWeight:600,marginBottom:16}}>{col.title}</h4>
                                {col.items.map((item,ii)=>item===""?<br key={ii}/>:(
                                    <a key={ii} href="#" style={{display:"block",fontSize:"0.875rem",color:"rgba(255,255,255,0.55)",textDecoration:"none",lineHeight:1.9}}
                                       onMouseEnter={e=>(e.currentTarget.style.color="white")}
                                       onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.55)")}
                                    >{item}</a>
                                ))}
                                {col.social&&(
                                    <div style={{display:"flex",gap:8,marginTop:16}}>
                                        {["f","in","li","x","▶"].map((ic,i)=>(
                                            <button key={i} style={{width:36,height:36,borderRadius:"50%",background:"#e2b23e",color:"#06152e",border:"none",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}
                                                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background="#f5d47a";}}
                                                    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.background="#e2b23e";}}
                                            >{ic}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"0.8125rem",color:"rgba(255,255,255,0.3)"}}>
                        <span>Design by <span style={{fontWeight:700,color:"rgba(255,255,255,0.55)"}}>STUDIO</span>, powered by <span style={{fontWeight:700,color:"rgba(255,255,255,0.55)"}}>AMAIS</span></span>
                        <span>© 2025 Academia · All rights reserved</span>
                    </div>
                </footer>

            </main>
        </>
    );
}