'use client';

import {useState, useEffect, JSX} from 'react';
import MegaMenu from "@/components/menu";

/* ── Navbar ──────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
      <>
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[72px] transition-all duration-300 ${scrolled ? 'bg-[#091a38]/95 backdrop-blur-md shadow-lg' : ''}`}>
          <div className="flex items-center gap-5">
            <span className="text-white text-sm font-semibold border-b-2 border-[#e2b23e] pb-0.5 cursor-pointer">EN</span>
            <span className="text-white/50 text-sm font-medium cursor-pointer hover:text-white transition-colors">FR</span>
          </div>

          <a href="#" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-serif text-2xl font-bold text-[#06152e] flex-shrink-0" style={{ background: 'linear-gradient(135deg, #e2b23e, #b8860b)' }}>
              A
            </div>
            <div>
              <div className="font-serif text-[1.1rem] font-bold text-white leading-tight">Academia</div>
              <div className="text-[0.6rem] tracking-widest uppercase text-white/40 font-medium">Collège Alpin International</div>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <button className="border border-white/60 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2 rounded-full hover:bg-white hover:text-[#091a38] transition-all duration-200">
              Enquire Now
            </button>
            <svg className="text-white/70" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            {/* Menu toggle button */}
            <button
                onClick={() => setMenuOpen(true)}
                className="flex items-center gap-2 cursor-pointer group"
                aria-label="Open menu"
            >
              <div className="flex flex-col gap-1">
                <span className="block w-5 h-[2px] bg-white/80 rounded group-hover:bg-white transition-colors"/>
                <span className="block w-5 h-[2px] bg-white/80 rounded group-hover:bg-white transition-colors"/>
                <span className="block w-5 h-[2px] bg-white/80 rounded group-hover:bg-white transition-colors"/>
              </div>
              <span className="text-white/60 text-[0.65rem] font-bold tracking-widest uppercase group-hover:text-white transition-colors">MENU</span>
            </button>
          </div>
        </nav>

        <MegaMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </>
  );
}

/* ── Reusable: bottom explore tab bar ───────────────────────────── */
type ExploreBarProps = {
  active: string; // or whatever type it should be
};

function ExploreBar({ active }: ExploreBarProps): JSX.Element {
  const tabs = ['Home', 'Academic', 'Boarding', 'Co-Curricular'];
  return (
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-4 px-12 py-5" style={{ background: 'rgba(9,26,56,0.85)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-white/50 text-[0.62rem] font-bold tracking-widest uppercase flex-shrink-0 mr-2">Explore</span>
        {tabs.map((tab, i) => (
            <div key={tab} className="flex items-center gap-4 flex-1">
              <button className={`px-5 py-2 rounded-full text-[0.8125rem] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 ${active === tab ? 'bg-white text-[#091a38]' : 'border border-white/30 text-white/65 hover:text-white hover:border-white/60'}`}>
                {tab}
              </button>
              {i < tabs.length - 1 && <div className="flex-1 h-px bg-white/20"/>}
            </div>
        ))}
      </div>
  );
}

/* ── Reusable: up/down arrows on slide right ────────────────────── */
function SlideArrows() {
  return (
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
        <button className="w-10 h-10 rounded-full border border-white/40 text-white text-base flex items-center justify-center hover:bg-white/15 transition-all">↑</button>
        <div className="w-8 h-px bg-white/30"/>
        <button className="w-10 h-10 rounded-full border border-white/40 text-white text-base flex items-center justify-center hover:bg-white/15 transition-all">↓</button>
      </div>
  );
}

/* ── Crest badge ────────────────────────────────────────────────── */
function Crest({ size = 'md' }) {
  const s = size === 'lg' ? 'w-16 h-16 text-3xl rounded-2xl' : 'w-14 h-14 text-2xl rounded-xl';
  return (
      <div className={`${s} flex items-center justify-center font-serif font-bold text-[#06152e] mx-auto`} style={{ background: 'linear-gradient(135deg, #e2b23e, #b8860b)' }}>
        A
      </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 1 — HERO (Home slide)
───────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        {/* Alpine sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #b5cfe0 0%, #8ab5cc 20%, #5a8fb0 45%, #2a6080 70%, #0a2a40 100%)' }}/>

        {/* Far mountain range */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(100,145,170,0.45) 0%, rgba(60,105,140,0.4) 100%)', clipPath: 'polygon(0% 100%, 6% 52%, 14% 68%, 22% 38%, 30% 58%, 38% 28%, 46% 50%, 54% 22%, 62% 48%, 70% 32%, 78% 56%, 86% 38%, 94% 54%, 100% 42%, 100% 100%)' }}/>
        {/* Mid mountain */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(50,90,120,0.5) 0%, rgba(20,55,85,0.55) 100%)', clipPath: 'polygon(0% 100%, 4% 62%, 12% 74%, 20% 48%, 28% 66%, 36% 38%, 44% 60%, 52% 34%, 60% 56%, 68% 42%, 76% 64%, 84% 48%, 92% 66%, 100% 52%, 100% 100%)' }}/>

        {/* School building */}
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[720px] max-w-[90vw]">
          {/* Main wings */}
          <div className="relative w-full h-64" style={{ background: 'linear-gradient(180deg, #dde9f2 0%, #c5d5e5 50%, #adc0d3 100%)' }}>
            {/* Centre tower */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-72" style={{ background: 'linear-gradient(180deg, #d0e0ec 0%, #b8cad8 100%)' }}>
              {/* Spire */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '34px solid transparent', borderRight: '34px solid transparent', borderBottom: '68px solid #8aaabb' }}/>
              {/* Entrance arch */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-20 rounded-t-full" style={{ background: '#0e2550' }}/>
              {/* Name */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div className="font-serif text-[0.58rem] font-bold text-[#0c2044] tracking-wider">ACADEMIA</div>
                <div className="text-[0.42rem] text-[#163470] tracking-widest mt-0.5">Collège Alpin International</div>
              </div>
            </div>
            {/* Upper windows */}
            <div className="absolute top-7 left-0 right-0 flex justify-around px-[190px]">
              {[0,1,2,3].map(i => <div key={i} className="w-7 h-9 rounded-sm" style={{ background: 'rgba(100,160,200,0.4)', border: '2px solid rgba(160,190,210,0.5)' }}/>)}
            </div>
            {/* Arched ground openings */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around px-[190px] items-end">
              {[0,1,2,3].map(i => <div key={i} className="w-9 h-14 rounded-t-full" style={{ background: 'rgba(80,120,160,0.35)', border: '2px solid rgba(120,160,190,0.4)' }}/>)}
            </div>
          </div>
          {/* Courtyard */}
          <div className="h-16 flex items-center justify-center gap-6" style={{ background: 'linear-gradient(180deg, #3a5a6a, #1e3040)' }}>
            {[38,48,58,48,38].map((h, i) => (
                <div key={i} className="w-4 rounded-t-full" style={{ height: h, background: i === 2 ? '#1e3a2a' : '#2a4a3a', marginTop: -(h - 28) }}/>
            ))}
          </div>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,15,34,0.25) 0%, rgba(5,15,34,0.08) 50%, rgba(5,15,34,0.5) 100%)' }}/>

        <ExploreBar active="Home"/>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 2 — INTRO + SUMMER CAMP PANEL
───────────────────────────────────────────────────────────────── */
function IntroSection() {
  return (
      <section className="grid" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Text */}
        <div className="bg-white px-20 py-24">
          <h2 className="font-serif text-[clamp(1.6rem,2.8vw,2.2rem)] font-bold text-[#0c2044] leading-tight mb-10 max-w-2xl">
            One of the leading private boarding schools in Switzerland, Academia is home to a thriving international community of students aged 11 to 18.
          </h2>
          <div className="grid grid-cols-2 gap-10 mb-8 text-[0.9375rem] leading-relaxed text-slate-600">
            <div className="space-y-5">
              <p>Founded in 1910, Academia has long been regarded as one of Switzerland's finest private boarding schools. Our reputation is based not only on our holistic approach to education, but also our commitment to internationalism, warm boarding community, and strong values.</p>
              <p>Uniquely located in a beautiful alpine village high in the Swiss Alps, Academia is a safe, inspiring, and exciting place to learn. Home to just 300 students — almost all full-time boarders — our school is like a family.</p>
              <p>Our educational philosophy empowers our students to be the best they can be. Learning is personalised to individual strengths, passions, and ambitions.</p>
            </div>
            <div className="space-y-5">
              <p>Life-changing opportunities — from whole-school challenges and global expeditions to our Winter Sports Programme — develop a breadth of skills, attributes, and experiences.</p>
              <p>Inspired by passionate teachers and a caring community, our students gain outstanding academic results. This prepares them for the future of their choice — including courses at prestigious universities around the world.</p>
            </div>
          </div>
          <button className="border-[1.5px] border-[#10295a] text-[#10295a] text-[0.7rem] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-[#10295a] hover:text-white transition-all duration-200">
            Find Out More
          </button>
        </div>

        {/* Summer camp panel */}
        <div className="flex flex-col items-center justify-between p-10 relative overflow-hidden" style={{ background: '#1690d8' }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}/>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
          <h3 className="font-serif text-2xl font-bold text-white text-center leading-snug relative z-10">
            Summer Camps at Academia
          </h3>
          <button className="text-white text-[0.7rem] font-bold tracking-widest uppercase px-6 py-3 rounded-full relative z-10 hover:opacity-90 transition-opacity" style={{ background: '#c9700e' }}>
            Discover
          </button>
          {/* Zipline figure */}
          <div className="relative z-10 w-full flex-1 flex items-end justify-center min-h-[220px]">
            <div className="absolute top-8 left-[15%] right-[10%] h-0.5 bg-white/40" style={{ transform: 'rotate(18deg)', transformOrigin: 'left center' }}/>
            <div className="absolute top-10 left-[52%] -translate-x-1/2 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full mb-0.5" style={{ background: 'linear-gradient(135deg, #e8f4ff, #c0d8f0)', border: '3px solid rgba(255,255,255,0.4)' }}/>
              <div className="w-9 h-14 rounded-lg relative" style={{ background: 'white' }}>
                <div className="absolute top-2 left-0.5 right-0.5 h-0.5 rounded" style={{ background: '#e2b23e' }}/>
                <div className="absolute top-5 left-0.5 right-0.5 h-0.5 rounded" style={{ background: '#e2b23e' }}/>
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/70"/>
              <div className="flex gap-1 mt-0.5">
                <div className="w-3 h-7 rounded" style={{ background: '#0e4a7a', transform: 'rotate(10deg)' }}/>
                <div className="w-3 h-7 rounded" style={{ background: '#0e4a7a', transform: 'rotate(-5deg)' }}/>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 3 — ACADEMIC (full-height slide, sky blue)
───────────────────────────────────────────────────────────────── */
function AcademicSection() {
  return (
      <section className="relative h-screen min-h-[640px] overflow-hidden" style={{ background: '#1690d8' }}>
        {/* Left visual panel */}
        <div className="absolute left-0 top-0 bottom-0 w-[58%] overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1a3a5c 0%, #2d6a9f 40%, #1a8fd1 70%, #3caee8 100%)' }}/>
          {/* Large quote marks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-serif font-bold leading-none" style={{ fontSize: 'clamp(12rem,20vw,17rem)', letterSpacing: '-0.05em', color: 'rgba(56,169,235,0.65)' }}>
            ""
          </span>
          </div>
          {/* Grad cap crowd */}
          <div className="absolute bottom-20 left-8 right-8 grid gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', transform: 'perspective(900px) rotateY(5deg)' }}>
            {[56,72,62,80,58,74,66,84,70,60,76,64,82,68,72,88].map((h, i) => (
                <div key={i} className="relative rounded-t-full flex-shrink-0" style={{ width: 44, height: h, background: i % 3 === 0 ? '#1a3a6c' : i % 3 === 1 ? '#2a5080' : '#3a6090' }}>
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '14px solid #e2b23e' }}/>
                  <div className="absolute top-0 right-0.5 w-0.5 h-4 rounded" style={{ background: '#e2b23e' }}/>
                </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="absolute right-0 top-0 bottom-[72px] w-[42%] flex items-center pl-8 pr-20 text-white text-right">
          <div>
            <span className="block text-[0.68rem] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Learning at Academia</span>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-bold leading-tight mb-5">Unlocking passion and potential</h2>
            <p className="text-[0.9375rem] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              At Academia, every student's education is unique to them. Personalised to individual passions and ambitions, our globally respected academic programmes — which include the International Baccalaureate and Advanced Studies Diploma — engage, motivate, and inspire our learners to excel.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 hover:border-white transition-all">Uncover</button>
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 hover:border-white transition-all">Find Out More</button>
            </div>
          </div>
        </div>

        <SlideArrows/>
        <ExploreBar active="Academic"/>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 4 — BOARDING (full-height slide, dark navy)
───────────────────────────────────────────────────────────────── */
function BoardingSection() {
  return (
      <section className="relative h-screen min-h-[640px] overflow-hidden" style={{ background: 'linear-gradient(160deg, #091a38 0%, #0e2550 60%, #153066 100%)' }}>
        {/* Left visual */}
        <div className="absolute left-0 top-0 bottom-0 w-[55%] overflow-hidden">
          {/* Tree silhouette */}
          <svg className="absolute left-[4%] top-0 h-full opacity-50" style={{ width: '42%' }} viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <path d="M100 10 Q130 80 170 100 Q210 120 185 150 Q220 185 195 215 Q225 255 185 285 Q215 325 175 360 Q205 405 165 440 L135 440 L135 380 L145 380 L145 355 L105 355 L105 440 L75 440 L75 380 L85 380 L85 355 L65 355 Q25 405 35 440 L25 440 Q-15 400 10 360 Q-20 320 20 290 Q-10 255 30 225 Q-5 190 35 165 Q10 130 55 110 Q30 75 80 50Z" fill="#163470" opacity="0.9"/>
            <ellipse cx="100" cy="60" rx="38" ry="27" fill="#1a4070" opacity="0.7"/>
            <ellipse cx="158" cy="128" rx="30" ry="22" fill="#163870" opacity="0.65"/>
            <ellipse cx="48" cy="142" rx="34" ry="24" fill="#1a4070" opacity="0.65"/>
            <ellipse cx="188" cy="200" rx="26" ry="18" fill="#163870" opacity="0.55"/>
            <ellipse cx="30" cy="218" rx="30" ry="20" fill="#1a4070" opacity="0.6"/>
          </svg>

          {/* Slanted image strips */}
          <div className="absolute flex flex-col gap-4 justify-center" style={{ right: '4%', top: '18%', bottom: '18%', width: '40%' }}>
            {[
              { bg: 'linear-gradient(135deg, #2d6a9f, #1a8fd1)', w: '92%', ml: '0%' },
              { bg: 'linear-gradient(135deg, #e2b23e, #c9700e)', w: '85%', ml: '7%' },
              { bg: 'linear-gradient(135deg, #9a3a7a, #6a1a5a)', w: '78%', ml: '12%' },
            ].map((s, i) => (
                <div key={i} className="h-[68px] rounded overflow-hidden" style={{ background: s.bg, transform: 'skewX(-3deg)', width: s.w, marginLeft: s.ml }}/>
            ))}
          </div>

          {/* Walking students */}
          <div className="absolute bottom-[16%] left-[8%] flex items-end gap-3">
            {[{ body: '#6a3a8a', skin: '#9a7a5a' }, { body: '#6a3a8a', skin: '#c8a882' }, { body: '#cc2222', skin: '#d4927a' }].map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full mb-0.5" style={{ background: f.skin }}/>
                  <div className="w-5 h-12 rounded" style={{ background: f.body }}/>
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="w-2 h-7 rounded" style={{ background: '#3a2870' }}/>
                    <div className="w-2 h-7 rounded" style={{ background: '#3a2870' }}/>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="absolute right-0 top-0 bottom-[72px] w-[45%] flex items-center pl-8 pr-20 text-white text-right">
          <div>
            <span className="block text-[0.68rem] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Boarding at Academia</span>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-bold leading-tight mb-5">A home away from home</h2>
            <p className="text-[0.9375rem] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Community is at the heart of the Academia boarding experience. Each of our six houses is a warm and welcoming home away from home, where students from around the world forge friendships that last a lifetime.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 transition-all">Uncover</button>
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 transition-all">Find Out More</button>
            </div>
          </div>
        </div>

        <SlideArrows/>
        <ExploreBar active="Boarding"/>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 5 — CO-CURRICULAR (full-height, adventure/mountain)
───────────────────────────────────────────────────────────────── */
function CoCurricularSection() {
  return (
      <section className="relative h-screen min-h-[640px] overflow-hidden" style={{ background: '#091a38' }}>
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #87a5bb 0%, #6a8fa8 25%, #4a7090 50%, #2a5070 75%, #0a2040 100%)' }}/>
        {/* Far mountain peaks */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #3a5a6a 0%, #1e3540 100%)', clipPath: 'polygon(0% 100%, 8% 50%, 18% 70%, 28% 25%, 38% 55%, 48% 10%, 58% 45%, 68% 30%, 78% 60%, 88% 35%, 100% 55%, 100% 100%)' }}/>
        {/* Close rocky foreground */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, #0a2030 100%)', clipPath: 'polygon(0% 100%, 5% 68%, 14% 78%, 22% 52%, 30% 72%, 40% 44%, 50% 68%, 60% 50%, 70% 72%, 80% 52%, 90% 70%, 100% 58%, 100% 100%)' }}/>

        {/* Summit cross */}
        <div className="absolute" style={{ bottom: '51%', left: '33%' }}>
          <div className="w-[3px] h-10 mx-auto" style={{ background: 'rgba(240,220,160,0.85)' }}/>
          <div className="h-[3px] w-6 -mt-7 -ml-[10px]" style={{ background: 'rgba(240,220,160,0.85)' }}/>
        </div>

        {/* Hiker group */}
        <div className="absolute flex items-end gap-3" style={{ bottom: '42%', left: '18%' }}>
          {[
            { body: '#1a3a6c', skin: '#8a7060', h: 36 },
            { body: '#3a5a8a', skin: '#7a6050', h: 30 },
            { body: '#4a7a9a', skin: '#9a8070', h: 40 },
            { body: '#3a6090', skin: '#6a5040', h: 28 },
            { body: '#2a5888', skin: '#8a7060', h: 38 },
          ].map((f, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full mb-0.5" style={{ background: f.skin }}/>
                <div className="w-3.5 rounded" style={{ height: f.h, background: f.body }}/>
                <div className="flex gap-0.5 mt-0.5">
                  <div className="w-1.5 h-4 rounded" style={{ background: '#1e1e50' }}/>
                  <div className="w-1.5 h-4 rounded" style={{ background: '#1e1e50' }}/>
                </div>
              </div>
          ))}
        </div>

        {/* Globe motif top-right */}
        <div className="absolute -top-[8%] -right-[8%] w-80 h-80 rounded-full opacity-60" style={{ background: 'linear-gradient(135deg, rgba(30,80,140,0.6), rgba(20,50,100,0.4))', border: '2px solid rgba(100,160,210,0.2)' }}/>

        {/* Right content */}
        <div className="absolute right-0 top-0 bottom-[72px] w-[44%] flex items-center pl-8 pr-20 text-white text-right">
          <div>
            <span className="block text-[0.68rem] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>The Academia Experience</span>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-bold leading-tight mb-5">Endless opportunities for adventure</h2>
            <p className="text-[0.9375rem] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              At Academia, we believe it's what you do that counts. From character-building challenges and community service projects to alpine adventures and global expeditions, we offer an unparalleled range of experiences that shape our students' futures.
            </p>
            <div className="flex gap-3 justify-end">
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 transition-all">Uncover</button>
              <button className="border border-white/50 text-white text-[0.7rem] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/15 transition-all">Find Out More</button>
            </div>
          </div>
        </div>

        <SlideArrows/>
        <ExploreBar active="Co-Curricular"/>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 6 — LOCATION / OUTDOOR ADVENTURES
───────────────────────────────────────────────────────────────── */
function LocationSection() {
  return (
      <section style={{ background: '#0c2044' }} className="overflow-hidden">
        {/* Banner */}
        <div className="relative px-20 pt-16 pb-10 overflow-hidden">
          <div className="absolute -top-20 -right-16 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1a8fd1, transparent)' }}/>
          <h2 className="font-serif text-white text-[clamp(1.75rem,3vw,2.5rem)] font-bold max-w-xl leading-tight relative z-10">
            Our location in the Swiss Alps allows unmatched opportunities
          </h2>
        </div>

        <div className="grid grid-cols-2">
          {/* Mountain landscape */}
          <div className="relative min-h-[420px] overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #7aa5c0 0%, #4a7898 25%, #2a5878 50%, #0e2d50 100%)' }}/>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #2a5060 0%, #0e2030 100%)', clipPath: 'polygon(0% 100%, 10% 45%, 22% 65%, 33% 20%, 46% 55%, 58% 15%, 68% 48%, 80% 28%, 90% 58%, 100% 35%, 100% 100%)' }}/>
            {/* Hikers */}
            <div className="absolute flex items-end gap-3" style={{ bottom: '24%', left: '10%' }}>
              {[{ body: '#1a5a8a', skin: '#8a7060' }, { body: '#e26020', skin: '#7a6050' }, { body: '#4a7aaa', skin: '#9a8070' }].map((f, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full mb-0.5" style={{ background: f.skin }}/>
                    <div className="w-4 h-10 rounded" style={{ background: f.body }}/>
                    <div className="flex gap-0.5 mt-0.5">
                      <div className="w-1.5 h-5 rounded" style={{ background: '#103070' }}/>
                      <div className="w-1.5 h-5 rounded" style={{ background: '#103070' }}/>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Info panel */}
          <div className="bg-white px-16 py-14">
            <div className="w-10 h-[3px] rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #e8b84b, #38a9eb)' }}/>
            <h3 className="font-serif text-2xl font-bold text-[#0c2044] leading-snug mb-5">Awe-inspiring outdoor adventures</h3>
            <p className="text-[0.9375rem] leading-relaxed text-slate-600 mb-6">
              Our outdoor education programme is packed with exhilarating adventures. From mountain climbing to canyoning, cross-country skiing to canoeing, our students push themselves beyond their comfort zone, overcome challenges, and work as a team. This builds confidence and resilience, and develops vital future-ready skills, such as leadership and communication.
            </p>
            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {[
                'linear-gradient(135deg, #2d7a4f, #1a5a38)',
                'linear-gradient(135deg, #2d6a9f, #1a4a7a)',
                'linear-gradient(135deg, #c9700e, #8a4a0a)',
                'linear-gradient(135deg, #153066, #091a38)',
              ].map((bg, i) => (
                  <div key={i} className="relative rounded overflow-hidden cursor-pointer" style={{ aspectRatio: '3/4', background: bg }}>
                    <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#c9700e' }}>+</div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 7 — PRINCIPAL QUOTE + PHOTO MOSAIC
───────────────────────────────────────────────────────────────── */
function QuoteSection() {
  return (
      <section className="bg-[#f5f6fa] py-24 px-20 text-center">
        <Crest/>
        <blockquote className="font-serif italic text-[#0c2044] leading-relaxed max-w-4xl mx-auto mt-8 mb-5" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.45rem)' }}>
          "School is a place to be curious, to take initiative, and to discover new experiences in a community built on trust, respect, and kindness. I invite all of our students to grasp the wonderful opportunities offered by Academia with enthusiasm and an open mind."
        </blockquote>
        <p className="text-[0.72rem] font-bold tracking-widest uppercase text-slate-400">— Benjamin Turner, Principal</p>

        {/* Photo mosaic */}
        <div className="relative mt-16 mx-auto max-w-5xl" style={{ display: 'grid', gridTemplateColumns: '200px 380px 200px 280px', gridTemplateRows: '200px 180px', gap: '0.75rem' }}>
          {[
            { bg: 'linear-gradient(135deg,#1a3a6c,#2d5a9f)', col: '1', row: '1/3' },
            { bg: 'linear-gradient(135deg,#2d6a9f,#1a8fd1)', col: '2', row: '1' },
            { bg: 'linear-gradient(135deg,#153066,#0e2550)', col: '3', row: '1' },
            { bg: 'linear-gradient(135deg,#c9970f,#e2b23e)', col: '4', row: '1/3' },
            { bg: 'linear-gradient(135deg,#0d75bd,#3caee8)', col: '2', row: '2' },
            { bg: 'linear-gradient(135deg,#0e2550,#153066)', col: '3', row: '2' },
          ].map((p, i) => (
              <div key={i} className="rounded-lg" style={{ background: p.bg, gridColumn: p.col, gridRow: p.row }}/>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[0.72rem] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap pointer-events-none" style={{ background: 'rgba(9,26,56,0.75)', backdropFilter: 'blur(4px)' }}>
            Drag cursor to move
          </div>
        </div>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 8 — CAMPUS DESCRIPTION + PANORAMA
───────────────────────────────────────────────────────────────── */
function CampusSection() {
  return (
      <section className="bg-white py-24 px-20 text-center">
        <Crest/>
        <p className="font-serif text-[#0c2044] leading-relaxed max-w-3xl mx-auto mt-8 mb-16" style={{ fontSize: 'clamp(1.05rem, 1.7vw, 1.3rem)' }}>
          Tucked away in an idyllic alpine village — and surrounded by magnificent mountain peaks, verdant pine forests, and big skies — our campus is an inspiring Swiss boarding school to live and learn. Specialist art, design, and music spaces, outstanding sports facilities, and cutting-edge interactive technology bring learning to life. Our close-knit international community, meanwhile, is truly unique, providing a supportive and inspirational setting in which to live and learn.
        </p>

        {/* Alpine panorama illustration */}
        <div className="w-full max-w-5xl mx-auto h-96 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #c8dce8 0%, #9ab8cc 20%, #6a94b0 40%, #3a6a88 60%, #1a4060 80%, #0a2030 100%)' }}/>
          {/* Mountain silhouettes */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(40,80,100,0) 0%, rgba(10,30,50,0.9) 100%)', clipPath: 'polygon(0% 100%, 5% 60%, 15% 75%, 25% 40%, 35% 65%, 50% 25%, 65% 60%, 75% 40%, 85% 70%, 95% 50%, 100% 65%, 100% 100%)' }}/>
          {/* Village buildings */}
          <div className="absolute bottom-[28%] left-[14%] w-20 h-24 rounded-t" style={{ background: 'linear-gradient(180deg, #c8d8e0, #a8b8c8)' }}/>
          <div className="absolute bottom-[28%] left-[22%] w-14 h-20 rounded-t" style={{ background: 'linear-gradient(180deg, #d0dce4, #b0c0cc)' }}/>
          <div className="absolute bottom-[28%] left-[30%] w-24 h-28 rounded-t" style={{ background: 'linear-gradient(180deg, #b8ccd8, #98aab8)' }}/>
          {/* Main school */}
          <div className="absolute bottom-[28%] right-[16%] w-44 h-36 rounded-t shadow-xl" style={{ background: 'linear-gradient(180deg, #d8e8f0, #c0d0dc)' }}/>
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-[28%]" style={{ background: 'linear-gradient(180deg, #1e3a4a, #0a1e2a)' }}/>
        </div>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 9 — ADMISSIONS
───────────────────────────────────────────────────────────────── */
function AdmissionsSection() {
  return (
      <section className="overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: '1fr 380px 1fr' }}>
          {/* Left: assembly */}
          <div className="relative min-h-[520px] overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a3060, #0e2040)' }}>
            {/* Play button */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-all" style={{ border: '2px dashed rgba(255,255,255,0.4)', background: 'rgba(9,26,56,0.7)' }}>
              <div className="w-0 h-0 ml-1" style={{ borderLeft: '14px solid #c9700e', borderTop: '9px solid transparent', borderBottom: '9px solid transparent' }}/>
            </div>
            {/* Value tags */}
            <div className="absolute top-24 left-4 right-4 flex flex-wrap gap-2">
              {[{ l: '#Respect', bg: '#10295a' }, { l: '#Responsibility', bg: '#c9970f' }, { l: '#Ambition', bg: '#1a8fd1' }, { l: '#Determination', bg: '#c9700e' }].map((t, i) => (
                  <span key={i} className="text-white text-[0.62rem] font-bold tracking-wide px-3 py-1 rounded" style={{ background: t.bg }}>{t.l}</span>
              ))}
            </div>
            {/* Audience silhouettes */}
            <div className="absolute bottom-[12%] left-[8%] right-[8%]">
              <div className="flex gap-1.5 justify-center mb-1.5">
                {['#8a7060','#6a5040','#9a8070','#c8a882','#8a7060','#7a6050','#d4a882','#8a6848','#c8a882'].map((c, i) => (
                    <div key={i} className="rounded-t-full" style={{ width: i === 8 ? 28 : 20, height: i === 8 ? 34 : 24, background: c }}/>
                ))}
              </div>
              <div className="flex gap-1.5 justify-center">
                {['#c8a882','#9a7858','#7a6050','#e8c090','#8a6848','#c8a882'].map((c, i) => (
                    <div key={i} className="rounded-t-full" style={{ width: 26, height: 32, background: c }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Center: card */}
          <div className="flex flex-col items-center text-center gap-5 px-10 py-14 text-white" style={{ background: '#10295a' }}>
            <Crest/>
            <h2 className="font-serif text-3xl font-bold">Admissions</h2>
            <p className="text-[0.9rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              We're delighted that you're interested in joining the Academia family. Your journey starts with our expert Admissions Team, who will guide you through the process — from helping you submit your application form to arranging a guided tour.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our school — which is home to around 300 students — is small but diverse. This means places are limited, and we'd encourage you to apply as soon as possible to avoid disappointment.
            </p>
            <div className="flex flex-col gap-3 w-full mt-2">
              <button className="w-full border text-white text-[0.7rem] font-bold tracking-widest uppercase py-3 rounded-full hover:bg-white/10 transition-all" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>Arrange a Visit</button>
              <button className="w-full border text-white text-[0.7rem] font-bold tracking-widest uppercase py-3 rounded-full hover:bg-white/10 transition-all" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>Applications</button>
            </div>
          </div>

          {/* Right: modern interior */}
          <div className="relative min-h-[520px] overflow-hidden" style={{ background: 'linear-gradient(160deg, #0e2040, #060f20)' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {[{ w: 200, h: 300, a: 0.28 }, { w: 150, h: 220, a: 0.22 }, { w: 100, h: 150, a: 0.18 }, { w: 50, h: 72, a: 0.14 }].map((r, i) => (
                  <div key={i} className="absolute rounded-full" style={{ width: r.w, height: r.h, border: `${3 - i * 0.5}px solid rgba(100,160,210,${r.a})` }}/>
              ))}
            </div>
            {/* Interior figures */}
            <div className="absolute flex items-end gap-2 opacity-70" style={{ bottom: '14%', right: '10%' }}>
              {[{ body: '#1a2a50', skin: '#c8a882' }, { body: '#c9970f', skin: '#8a7060' }, { body: '#1a3a6c', skin: '#e8c090' }].map((f, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full mb-0.5" style={{ background: f.skin }}/>
                    <div className="w-3 h-8 rounded" style={{ background: f.body }}/>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────── */
function Footer() {
  return (
      <footer className="text-white px-20 pt-20 pb-8" style={{ background: '#0c2044' }}>
        <div className="text-center mb-14">
          <Crest size="lg"/>
          <div className="font-serif text-2xl font-bold text-white mt-3">Academia</div>
          <div className="text-[0.65rem] tracking-widest text-white/40 mt-0.5">Collège Alpin International</div>
        </div>

        <div className="grid grid-cols-5 gap-8 pb-12 mb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact us</h4>
            <div className="text-sm leading-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <p>Collège Alpin Academia</p>
              <p>Route du Village 1</p>
              <p>1884 Villars-sur-Ollon</p>
              <p>Switzerland</p>
              <div className="mt-2">
                <a href="#" className="block no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.75)' }}>info@academia.ch</a>
                <a href="#" className="block no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>+41 24 496 26 26</a>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {['f','in','li','x','▶'].map((ic, i) => (
                  <button key={i} className="w-9 h-9 rounded-full text-[#06152e] text-xs font-bold flex items-center justify-center hover:-translate-y-0.5 transition-all" style={{ background: '#e2b23e' }}>
                    {ic}
                  </button>
              ))}
            </div>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Information</h4>
            {['News and events','Summer camp','Careers at Academia'].map(l => (
                <a key={l} href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</a>
            ))}
            <div className="mt-4">
              <div className="text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Summer Camp</div>
              <a href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>summercamp@academia.ch</a>
              <a href="#" className="block text-sm no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>+41 24 496 26 46</a>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Access</h4>
            {['Online payments','Term dates'].map(l => (
                <a key={l} href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</a>
            ))}
          </div>

          {/* Admissions */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Admissions</h4>
            {['Application process','Application form','Admission team','Terms and conditions'].map(l => (
                <a key={l} href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</a>
            ))}
            <div className="mt-4">
              <div className="text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Admissions</div>
              <a href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>admissions@academia.ch</a>
              <a href="#" className="block text-sm no-underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>+41 24 496 26 10</a>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Policies</h4>
            {['Legal notice','Website privacy and cookie policy','Accessibility statement'].map(l => (
                <a key={l} href="#" className="block text-sm no-underline hover:text-white transition-colors mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</a>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span>Design by <span className="font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>STUDIO</span>, powered by <span className="font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>AMAIS</span></span>
          <span>© 2025 Academia · All rights reserved</span>
        </div>
      </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT PAGE — all sections composed in order
───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
      <>
        <Navbar />
        <HeroSection />
        <IntroSection />
        <AcademicSection />
        <BoardingSection />
        <CoCurricularSection />
        <AboutTextSection />
        <LocationSection />
        <QuoteSection />
        <CampusSection />
        <AdmissionsSection />
        <Footer />
      </>
  );
}

/* AboutTextSection is defined between CoCurricularSection and LocationSection */
function AboutTextSection() {
  return (
      <section className="bg-white py-24 px-20">
        <div className="flex justify-center mb-10">
          <Crest/>
        </div>
        <h2 className="font-serif text-[clamp(1.35rem,2.5vw,1.875rem)] font-bold text-[#0c2044] text-center leading-tight max-w-3xl mx-auto mb-16">
          One of the leading private boarding schools in Switzerland, Academia is home to a thriving international community of students aged 11 to 18.
        </h2>
        <div className="grid grid-cols-2 gap-16 max-w-5xl mx-auto text-[0.9375rem] leading-relaxed text-slate-600">
          <div className="space-y-5">
            <p>Founded in 1910, Academia has long been regarded as one of Switzerland's finest private boarding schools. Our reputation is based not only on our holistic approach to education, but also our commitment to internationalism, warm boarding community, and strong values.</p>
            <p>Uniquely located in a beautiful alpine village high in the Swiss Alps, Academia is a safe, inspiring, and exciting place to learn. Home to just 300 students — almost all full-time boarders — our school is like a family, where everyone receives the attention and guidance they need.</p>
            <p>Our educational philosophy empowers our students to be the best they can be. Learning is personalised to individual strengths, passions, and ambitions, and stretches way beyond the classroom and campus.</p>
          </div>
          <div className="space-y-5">
            <p>Life-changing opportunities — from whole-school challenges and global expeditions to our Winter Sports Programme — develop a breadth of skills, attributes, and experiences. They also nurture our students' understanding and appreciation of the world around them.</p>
            <p>Inspired by passionate teachers and a caring community, our students gain outstanding academic results. This prepares them for the future of their choice — including courses at prestigious universities around the world.</p>
            <button className="mt-2 border-[1.5px] border-[#10295a] text-[#10295a] text-[0.7rem] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-[#10295a] hover:text-white transition-all duration-200">
              Find Out More
            </button>
          </div>
        </div>
      </section>
  );
}