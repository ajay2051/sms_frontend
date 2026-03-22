'use client';

import { useState, useEffect } from 'react';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuData = {
    Academic: [
        'Introduction',
        'Grades 6 to 10',
        'Grades 11 and 12',
        'Learning Support',
        'Academic Results',
        'Careers and University Guidance',
        'Unique Collaborations',
        'Global Campus',
    ],
    Boarding: [
        'Introduction',
        'Daily Life at Beau Soleil',
        'Weekends',
        'Our Boarding Houses',
        'Boarding House Team',
        'Health and Wellbeing',
        'High Expectations',
    ],
    'Co-curricular': [
        'Introduction',
        'The Hub',
        'School Challenges',
        'Creative and Performing Arts',
        { label: 'Sports', hasArrow: true },
        'Outdoor Education',
        'Trips',
        { label: 'Clubs and Activities', hasArrow: true },
    ],
    'About Us': [
        'Our Heritage',
        'Our Senior Leadership Team',
        'Nord Anglia Education',
        'The Good Schools Guide',
        'News and Events',
        'Careers',
        'Term Dates',
        'Contact Us',
    ],
};

const bottomLinks = ['About Us', 'News and Events', 'Admissions', 'Summer Camp', 'Contact Us'];
const footerLinks = {
    left: ['Careers', 'Term Dates'],
    right: ['Legal Notice', 'Privacy Policy', 'Accessibility'],
};

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex">
            {/* Left blurred alpine background strip */}
            <div
                className="hidden lg:block w-[19%] bg-cover bg-center"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='800'%3E%3Crect width='300' height='800' fill='%234a7a6a'/%3E%3C/svg%3E")`,
                    background: 'linear-gradient(180deg, #5a8a70 0%, #3a6a50 30%, #2a5040 60%, #1a3a2a 100%)',
                    filter: 'blur(0px)',
                }}
            >
                {/* Tree silhouettes */}
                <div className="w-full h-full relative overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #6a9a80 0%, #3a6a50 40%, #1a3a28 100%)' }} />
                    {/* Pine tree shapes */}
                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 300 600" preserveAspectRatio="xMidYMax meet">
                        <polygon points="60,600 60,300 20,350 60,250 30,300 80,180 130,300 100,250 140,350 100,300 100,600" fill="#1a3a28" opacity="0.8"/>
                        <polygon points="200,600 200,350 160,400 200,300 170,350 220,220 270,350 240,300 280,400 240,350 240,600" fill="#152e20" opacity="0.9"/>
                        <polygon points="130,600 130,380 100,420 130,340 110,380 150,260 190,380 170,340 200,420 160,380 160,600" fill="#1e3a2a" opacity="0.7"/>
                    </svg>
                    {/* Mountain in background */}
                    <div className="absolute top-0 left-0 right-0 h-2/3" style={{ background: 'linear-gradient(180deg, #8ab5cc 0%, #6a95aa 30%, transparent 100%)' }} />
                </div>
            </div>

            {/* Main menu panel */}
            <div
                className="flex-1 lg:w-[62%] flex flex-col overflow-y-auto"
                style={{ background: '#0c2044' }}
            >
                {/* Top: Logo + close */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 flex-shrink-0">
                    <div /> {/* spacer */}
                    <div className="flex flex-col items-center">
                        {/* Crest */}
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center font-serif text-xl font-bold mb-1"
                            style={{ background: 'linear-gradient(135deg, #e2b23e, #b8860b)', color: '#06152e' }}
                        >
                            A
                        </div>
                        <div className="font-serif text-white text-lg font-bold leading-tight">Academia</div>
                        <div className="text-white/40 text-[0.55rem] tracking-widest uppercase">Collège Alpin International</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors w-10 h-10 flex items-center justify-center text-2xl"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                {/* Menu grid — top row: Academic, Boarding, Co-curricular */}
                <div className="flex-1 px-8 pt-10 pb-6">
                    <div className="grid grid-cols-3 gap-8 mb-12">
                        {(['Academic', 'Boarding', 'Co-curricular'] as const).map((section) => (
                            <div key={section} className="flex gap-5">
                                {/* Vertical rotated label */}
                                <div className="flex-shrink-0 flex items-start pt-1">
                  <span
                      className="font-serif font-bold text-lg leading-none"
                      style={{
                          color: '#e2b23e',
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          letterSpacing: '0.04em',
                      }}
                  >
                    {section}
                  </span>
                                </div>
                                {/* Links */}
                                <ul className="space-y-3">
                                    {menuData[section].map((item, i) => {
                                        const isObj = typeof item === 'object';
                                        const label = isObj ? item.label : item;
                                        const hasArrow = isObj && item.hasArrow;
                                        return (
                                            <li key={i}>
                                                <a
                                                    href="#"
                                                    className="flex items-center justify-between gap-2 text-white/85 hover:text-white text-[0.9375rem] leading-snug transition-colors group"
                                                    onClick={onClose}
                                                >
                                                    <span>{label}</span>
                                                    {hasArrow && (
                                                        <span className="text-white/50 group-hover:text-white transition-colors text-xs">›</span>
                                                    )}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom row: About Us (left), empty cols */}
                    <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
                        <div className="flex gap-5">
                            {/* Vertical rotated label */}
                            <div className="flex-shrink-0 flex items-start pt-1">
                <span
                    className="font-serif font-bold text-lg leading-none"
                    style={{
                        color: '#e2b23e',
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        letterSpacing: '0.04em',
                    }}
                >
                  About Us
                </span>
                            </div>
                            <ul className="space-y-3">
                                {menuData['About Us'].map((item, i) => (
                                    <li key={i}>
                                        <a
                                            href="#"
                                            className="text-white/85 hover:text-white text-[0.9375rem] leading-snug transition-colors block"
                                            onClick={onClose}
                                        >
                                            {item as string}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Empty cols 2 & 3 */}
                        <div />
                        <div />
                    </div>
                </div>

                {/* Bottom nav links */}
                <div className="px-8 py-5 border-t border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
                        {bottomLinks.map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-sm font-semibold transition-colors"
                                style={{ color: '#e2b23e' }}
                                onClick={onClose}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-white/40 text-xs">
                        <div className="flex gap-5">
                            {footerLinks.left.map((l) => (
                                <a key={l} href="#" className="hover:text-white/70 transition-colors" onClick={onClose}>{l}</a>
                            ))}
                        </div>
                        <div className="flex gap-5">
                            {footerLinks.right.map((l) => (
                                <a key={l} href="#" className="hover:text-white/70 transition-colors" onClick={onClose}>{l}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right blurred alpine background strip */}
            <div
                className="hidden lg:block w-[19%] relative overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #8ab5cc 0%, #6a95aa 30%, #3a6a80 60%, #1a3a50 100%)' }}
            >
                {/* Aerial school/village view suggestion */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #7aa5c0 0%, #4a7898 30%, #2a5878 60%, #0e2d50 100%)' }} />
                    {/* Building silhouettes */}
                    <div className="absolute bottom-[35%] left-[10%] w-16 h-20 rounded-t" style={{ background: 'rgba(220,235,245,0.6)' }} />
                    <div className="absolute bottom-[35%] left-[35%] w-24 h-28 rounded-t" style={{ background: 'rgba(200,220,235,0.5)' }} />
                    <div className="absolute bottom-[35%] right-[10%] w-14 h-16 rounded-t" style={{ background: 'rgba(210,228,240,0.55)' }} />
                    {/* Sports field */}
                    <div className="absolute bottom-[15%] left-[5%] right-[5%] h-20 rounded" style={{ background: 'rgba(40,100,60,0.7)', border: '1px solid rgba(80,160,100,0.4)' }} />
                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{ background: 'linear-gradient(180deg, #1e3a4a, #0a1e2a)' }} />
                </div>
            </div>
        </div>
    );
}