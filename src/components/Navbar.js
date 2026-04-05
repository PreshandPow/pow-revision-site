"use client";

import { Search, Menu, Settings, LogOut, UserCircle, Sparkles } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from "react-hot-toast";
import Image from "next/image";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar({ setSearchInput, theme, handleThemeChange, isNavOpen, setIsNavOpen, setAuthMode, router }) {
    const [session, setSession] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [email, setEmail] = useState(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
        router.refresh();
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setEmail(user.email);
                const {data: profile, error} = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) {
                    console.error(error);
                    toast.error(error.message, toastStyle);
                }
                setUserProfile(profile);
            } else {
                router.replace('/');
            }
        }
        getUser();
    }, [supabase, router]);

    return (
        <nav className="sticky top-0 z-50 flex flex-col gap-6 w-full bg-[var(--layer1)] p-4 md:p-6 shadow-sm border-b border-[var(--layer3)] mb-4">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                <button
                    className="cursor-pointer md:hidden p-3 hover:bg-[var(--layer2)] rounded-full transition-colors"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6 text-[var(--text)]" />
                </button>
                <Link href="/" className="font-brand font-black tracking-tighter z-20 text-5xl text-[var(--nice-blue)]">
                    POW
                </Link>
                <ul className="hidden md:flex items-center gap-4 font-semibold">
                    <li>
                        <button
                            className="flex items-center gap-3 p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group"
                            onClick={() => {
                                if (session) {
                                    router.push(`/dashboard/Notes`);
                                }}}>
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
                            <span className="text-xl grayscale group-hover:grayscale-0">❓</span>
                            <span className="text-[var(--text)]">Support</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleThemeChange}
                            className="p-2 hover:bg-[var(--layer2)] rounded-full text-2xl cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? '☀️' : '🌙'}
                        </button>
                    </li>
                </ul>

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
            {userProfile?.username?.charAt(0).toUpperCase() || "P"}
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
                                        onClick={handleThemeChange}
                                        className="px-5 py-4 text-left font-bold text-[var(--text)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        aria-label="Toggle theme"
                                    >
                                        {theme === 'light' ? '☀️ Dark Mode' : `🌙 Light Mode`}
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