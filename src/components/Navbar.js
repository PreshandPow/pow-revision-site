"use client";

import { Search, Menu } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar({ setSearchInput, theme, handleThemeChange, isNavOpen, setIsNavOpen, setAuthMode, router }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="sticky top-0 z-50 flex flex-col gap-6 w-full bg-[var(--layer1)] p-4 md:p-6 shadow-sm border-b border-[var(--layer3)]">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <button
                    className="cursor-pointer md:hidden p-3 hover:bg-[var(--layer2)] rounded-full transition-colors"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6 text-[var(--text)]" />
                </button>
                <Link href="/" className="font-brand font-black tracking-tighter z-20 text-5xl font-black text-[var(--nice-blue)]">
                    POW
                </Link>
                <ul className="hidden md:flex items-center gap-4 font-semibold">
                    <li>
                        <button className="flex items-center gap-3 p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl grayscale group-hover:grayscale-0">📝</span>
                            <span className="text-[var(--text)]">Notes</span>
                        </button>
                    </li>
                    <li>
                        <button className="flex items-center gap-3 p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl grayscale group-hover:grayscale-0">🗃️</span>
                            <span className="text-[var(--text)]">Flashcards</span>
                        </button>
                    </li>
                    <li>
                        <button className="flex items-center gap-3 p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl grayscale group-hover:grayscale-0">❔</span>
                            <span className="text-[var(--text)]">Support</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleThemeChange}
                            className="p-2 hover:bg-[var(--layer2)] rounded-full text-2xl  cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? '☀️' : '🌙'}
                        </button>
                    </li>
                </ul>

                <div className="flex items-center gap-2">
                    {session ? (
                        <button
                            className="font-bold text-[var(--nice-blue)] px-4 py-2"
                            onClick={() => router.push('/dashboard')}>
                            My Dashboard
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                className="text-[var(--text)] cursor-pointer font-bold px-4 py-2 hover:bg-[var(--layer2)] rounded-xl transition-colors text-sm"
                                onClick={() => setAuthMode('login')}>
                                Log in
                            </button>
                            <button
                                className="bg-[var(--nice-blue)] cursor-pointer text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
                                onClick={() => setAuthMode('signup')}>
                                Sign up
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="relative w-full max-w-4xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                <input
                    type="text"
                    placeholder="Flashcard sets, textbooks, questions"
                    className="w-full bg-[var(--layer2)] py-3 pl-12 pr-4 rounded-xl border border-transparent focus:border-[var(--nice-blue)] outline-none transition-all text-[var(--text)]"
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>
        </nav>
    );
}