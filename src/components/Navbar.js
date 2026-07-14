"use client";

import { Search, Menu, Settings, LogOut, UserCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from "react-hot-toast";
import Image from "next/image";
import { useTheme } from 'next-themes';
import { createBrowserClient } from "@supabase/ssr";

// ─── 1. SUPABASE CLIENT ───────────────────────────────────────────────────────
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar({ setSearchInput, isNavOpen, setIsNavOpen, setAuthMode, router }) {

    // ─── 2. GLOBAL SETUP & STATES ───────────────────────────────────────────────
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [email, setEmail] = useState(null);

    const [mounted, setMounted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { theme, setTheme } = useTheme();

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
            zIndex: '9999',
        },
        iconTheme: {
            primary: 'var(--nice-blue)',
            secondary: '#FFFAEE',
        },
    };

    // ─── 3. ACTION HANDLERS ─────────────────────────────────────────────────────
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
        router.refresh();
    };

    // ─── 4. UNIFIED AUTHENTICATION EFFECT ───────────────────────────────────────
    useEffect(() => {
        setMounted(true);

        const initializeAuth = async () => {
            // 1. Fetch the session (Single Source of Truth)
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);

            // 2. If a session exists, use its data to fetch the profile
            if (currentSession?.user) {
                setEmail(currentSession.user.email);

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentSession.user.id)
                    .maybeSingle();

                if (error) {
                    console.error(error);
                    toast.error(error.message, toastStyle);
                }
                setUserProfile(profile);
            } else {
                // 3. If no session exists, boot them to the homepage safely
                if (window.location.pathname !== '/') {
                    router.replace('/');
                }
            }
        };

        initializeAuth();

        // 4. Listen for Login / Logout events
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            // Unconditionally set the session (so logouts actually clear the state to null!)
            setSession(newSession);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Removed 'supabase' and 'router' from dependencies to prevent infinite loops

    // ─── 5. RENDER ──────────────────────────────────────────────────────────────
    return (
        <nav className="sticky top-0 z-50 flex flex-col gap-6 w-full bg-[var(--layer1)] p-4 md:p-6 shadow-sm border-b border-[var(--layer3)] mb-4">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">

                {/* Mobile Menu Toggle */}
                <button
                    className="cursor-pointer min-[1200px]:hidden p-3 hover:bg-[var(--layer2)] rounded-full transition-colors"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6 text-[var(--text)]" />
                </button>

                {/* Logo */}
                <Link href="/" className="font-brand font-black tracking-tighter z-20 text-3xl lg:text-5xl text-[var(--nice-blue)]">
                    POW
                </Link>

                {/* Desktop Navigation Links */}
                <ul className="hidden min-[1200px]:flex items-center gap-3 [1200px]:gap-4 font-semibold">
                    <li>
                        <button
                            className="flex items-center gap-3 p-2 [1000px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group"
                            onClick={() => {
                                if (session) {
                                    router.push(`/dashboard/Materials`);
                                    setIsNavOpen(false)
                                }}}>
                            <span className="text-xl">🗃️</span>
                            <span className="text-[var(--text)]">Materials</span>
                        </button>
                    </li>
                    <li>
                        <Link
                            href={'/dashboard/Folders'}
                            className="flex items-center gap-3 p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group"
                        >
                            <span className="text-xl w-6 text-center">
                                <span className="inline group-hover:hidden">📁</span>
                                <span className="hidden group-hover:inline">📂</span>
                            </span>
                            <span className="text-[var(--text)]">Folders</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={'/dashboard/Notes'}
                            className="flex items-center gap-3 p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl">📖</span>
                            <span className="text-[var(--text)]">Notes</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={'/dashboard/Folders'}
                            className="flex items-center gap-3 p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl">📝</span>
                            <span className="text-[var(--text)]">Flashcards</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={'/dashboard/Folders'}
                            className="flex items-center gap-3 p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl">🗑️</span>
                            <span className="text-[var(--text)]">Trash</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={'/dashboard/Folders'}
                            className="flex items-center gap-3 p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-xl cursor-pointer transition-all group">
                            <span className="text-xl">❓</span>
                            <span className="text-[var(--text)]">Support</span>
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 [1200px]:p-3 hover:bg-[var(--layer3)] rounded-full text-2xl cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            {mounted ? (theme === 'light' ? '☀️' : '🌙') : '☀️'}
                        </button>
                    </li>
                </ul>

                {/* Auth Section & Dropdown */}
                <div className="flex items-center gap-2">
                    {session ? (
                        <div className="relative">
                            {isDropdownOpen && (
                                <div
                                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-all duration-300"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                            )}
                            <button
                                className="relative z-50 px-4 py-2 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {userProfile?.avatar_url ? (
                                    userProfile.avatar_url.includes('dicebear') ? (
                                        <img
                                            src={userProfile.avatar_url}
                                            alt="avatar"
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover shadow-sm"
                                        />
                                    ) : (
                                        <Image
                                            src={userProfile.avatar_url}
                                            alt="avatar"
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover shadow-sm"
                                        />
                                    )
                                ) : (
                                    <div className="w-[48px] h-[48px] bg-white rounded-full shadow-md border border-[var(--layer3)] flex items-center justify-center">
                                    <span className="text-[var(--nice-blue)] text-xs font-black">
                                        {userProfile?.username?.charAt(0).toUpperCase() || "P"}
                                    </span>
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 top-full pt-2 w-80 md:w-96 transition-all duration-200 z-50 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                                <div className="bg-[var(--layer2)] rounded-xl shadow-lg border border-[var(--layer1)] flex flex-col overflow-hidden">
                                    <div
                                        className="px-4 py-4 text-left font-bold flex gap-8 text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        onClick={() => {
                                            console.log('opening profile page')
                                        }}
                                    >
                                        {userProfile?.avatar_url ? (
                                            userProfile.avatar_url.includes('dicebear') ? (
                                                <img
                                                    src={userProfile.avatar_url}
                                                    alt="avatar"
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full object-cover shadow-sm"
                                                />
                                            ) : (
                                                <Image
                                                    src={userProfile.avatar_url}
                                                    alt="avatar"
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full object-cover shadow-sm"
                                                />
                                            )
                                        ) : (
                                            <div className="w-[48px] h-[48px] bg-white rounded-full shadow-md border border-[var(--layer3)] flex items-center justify-center">
                                    <span className="text-[var(--nice-blue)] text-xs font-black">
                                        {userProfile?.username?.charAt(0).toUpperCase() || "N/A"}
                                    </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className={'whitespace-nowrap text-xl text-[var(--text)]'}>{userProfile?.username}</p>
                                            <p className={'whitespace-nowrap text-sm text-[var(--text-muted)] truncate max-w-[180px]'}>{email}</p>
                                        </div>
                                    </div>

                                    <div className="h-[1px] bg-[var(--layer3)] w-full"></div>

                                    <button
                                        className="flex flex-row gap-4 px-5 py-4 text-left font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        onClick={() => {
                                            console.log('Navigate to profile');
                                        }}
                                    >
                                        <UserCircle className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--text)] shrink-0"/>
                                        <span>Profile</span>
                                    </button>

                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className="px-5 py-4 text-left font-bold text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        aria-label="Toggle theme"
                                    >
                                        {mounted ? (theme === 'light' ? '☀️ Dark Mode' : '🌙 Light Mode') : '☀️ Dark Mode'}
                                    </button>

                                    <button
                                        className="flex flex-row gap-4 whitespace-nowrap px-5 py-4 text-left font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        onClick={() => {
                                            console.log('Navigate to settings');
                                        }}
                                    >
                                        <Settings className="w-5 h-5 text-[var(--text-muted)] shrink-0"/>
                                        <span>Settings</span>
                                    </button>

                                    <button
                                        className="flex flex-row gap-4 px-5 py-4 text-left font-bold text-yellow-600 hover:text-yellow-400 hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        onClick={() => {
                                            console.log('Handle upgrade');
                                        }}
                                    >
                                        <Sparkles className="w-5 h-5 text-yellow-400 shrink-0"/>
                                        <span>Upgrade</span>
                                    </button>

                                    <div className="h-[1px] bg-[var(--layer3)] w-full"></div>

                                    <button
                                        className="flex flex-row gap-4 px-5 py-4 text-left font-bold text-red-400 hover:text-red-600 transition-colors cursor-pointer hover:bg-[var(--layer3)]"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="w-5 h-5 text-red-600 shrink-0"/>
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
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

            {/* Global Search Bar */}
            <div className="relative w-full max-w-4xl mx-auto -mt-5">
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