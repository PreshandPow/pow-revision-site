'use client';

import { useState, useEffect, useRef } from "react";
import {AnimatePresence, motion, useScroll, useTransform} from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import AuthPage from "../components/AuthPage";
import { supabase } from "../lib/supabase-client";
import { useRouter } from 'next/navigation';

export default function Home() {

    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [theme, setTheme] = useState('');
    const [authMode, setAuthMode] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [session, setSession] = useState(null);

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
    }
    useEffect(() => {
        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
        return () => {
            authListener.subscription.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(saved || system);
    }, []);
    useEffect(() => {
        if (!theme) return;
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);
    const handleThemeChange = (e) => {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const targetRef = useRef(null);
    const scrollRef = useRef(null);
    const [xOffset, setXOffset] = useState(0);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });
    useEffect(() => {
        const updateScrollRange = () => {
            if (scrollRef.current) {
                const totalWidth = scrollRef.current.scrollWidth;
                const viewportWidth = window.innerWidth;
                const paddingAdjustment = viewportWidth * 0.075;
                setXOffset(totalWidth - viewportWidth + paddingAdjustment);
            }
        };
        updateScrollRange();
        window.addEventListener("resize", updateScrollRange);
        return () => window.removeEventListener("resize", updateScrollRange);
    }, []);
    const x = useTransform(scrollYProgress, [0, 1], [0, -xOffset]);

    useEffect(() => {
        if (isNavOpen || authMode === 'signup' || authMode === 'login' || authMode ===  'resetpassword') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isNavOpen, authMode]);

    return (
        <main className="bg-[var(--layer1)] min-h-screen transition-colors duration-300">
            <Navbar
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                theme={theme}
                handleThemeChange={handleThemeChange}
                isNavOpen={isNavOpen}
                setIsNavOpen={setIsNavOpen}
                setAuthMode={setAuthMode}
                session={session}
                router={router}
            />
            <header className="relative z-10 bg-[var(--layer2)] py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[var(--text)] leading-[1.1]">
                        <span className="text-[var(--nice-blue)]">POW</span>er up Your Learning
                    </h1>
                    <p className="text-[var(--text-muted)] text-xl md:text-2xl mt-8 mb-12 max-w-2xl mx-auto">
                        Ace all your tests by creating interactive flashcards and notes with your own personal assistant.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="cursor-pointer bg-[var(--nice-blue)] text-white px-10 py-4 rounded-2xl
                                        font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                                onClick={() => session ? router.push('/dashboard') : setAuthMode('login')}>
                            Get started for free
                        </button>
                        <button className="cursor-pointer bg-[var(--layer2)] text-[var(--text)] border
                                        border-[var(--layer3)] px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--layer3)] transition-colors"
                                onClick={() => session ? router.push('/dashboard') : setAuthMode('login')}>
                            See how it works
                        </button>
                    </div>
                </div>
            </header>
            <section ref={targetRef} className="relative h-[300vh] bg-[var(--layer2)]">
                <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
                    <h2 className="text-4xl md:text-6xl font-bold text-center mb-12 text-[var(--text)]">
                        Explore our <span className="text-[var(--nice-blue)]">Features</span>
                    </h2>
                    <motion.div style={{ x }} ref={scrollRef} className="flex gap-8 md:gap-16 px-[7.5vw]">
                        <div className="card-animation min-w-[85vw] md:min-w-[900px] h-[550px] md:h-[600px] rounded-[3.5rem] bg-[hsl(154,61%,81%)] shadow-2xl flex flex-col overflow-hidden snap-center">
                            <div className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-gray-800">Create Organised Notes</h3>
                            </div>
                            <div className="mx-6 flex-grow bg-white dark:bg-[var(--layer1)] rounded-t-[2.5rem] p-6 shadow-sm flex flex-col gap-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 md:w-40 md:h-28 font-semibold bg-[var(--nice-blue)] rounded-md shadow-md flex items-center justify-center text-[12px] md:text-[18px] text-[var(--text)] p-2">
                                        Plant Cells
                                    </div>
                                    <div className="flex-grow space-y-2">
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--text)]">Biology</span>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✓ Updated</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-[var(--layer2)] rounded-2xl p-4 flex-grow">
                                    <p className="text-xs font-bold text-[var(--text-muted)] mb-2">Introduction</p>
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2"/>
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <p className="text-xs font-bold text-[var(--text-muted)] mb-2">The Structure of Plant Cells</p>
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2"/>
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-200 rounded mb-2" />
                                </div>
                            </div>
                        </div>
                        <div className="card-animation min-w-[85vw] md:min-w-[900px] h-[550px] md:h-[600px] rounded-[3.5rem] bg-[hsl(245,67%,49%)] shadow-2xl flex flex-col overflow-hidden snap-center">
                            <div className="p-10 text-center">
                                <h3 className="text-3xl md:text-4xl font-black text-white">Flashcards</h3>
                            </div>
                            <div className="flex-grow flex items-center justify-center relative px-10">
                                <div className="w-full max-w-sm bg-white dark:bg-[var(--layer1)] aspect-[3/4] rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
                                    <p className="text-5xl mb-4">🦠</p>
                                    <p className="text-3xl font-black text-gray-800">Microbe</p>
                                </div>
                            </div>
                        </div>
                        <div className="card-animation min-w-[85vw] md:min-w-[900px] h-[550px] md:h-[600px] rounded-[3.5rem] bg-[hsl(32,95%,86%)] shadow-2xl flex flex-col overflow-hidden snap-center">
                            <div className="p-6 md:p-8 text-center shrink-0">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">POWER bot AI</h3>
                            </div>
                            <div className="mx-4 md:mx-6 flex-grow bg-white dark:bg-[var(--layer1)] rounded-t-[2.5rem] p-4 md:p-6 shadow-sm flex flex-col min-h-0">
                                <div className="flex-grow overflow-y-auto flex flex-col justify-end gap-3 no-scrollbar pb-2">
                                    <div className="flex items-end gap-2 self-start max-w-[90%]">
                                        <div className="w-8 h-8 rounded-full bg-[var(--nice-blue)] flex items-center justify-center text-sm shrink-0">🤖</div>
                                        <div className="bg-gray-100 dark:bg-[var(--layer2)] p-3 rounded-2xl rounded-bl-none text-[1rem] text-[var(--text-muted)] shadow-inner">
                                            <p>`Hey there! I'm ready to help you POWER up your learning. Ask me anything about your notes!`</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 self-end max-w-[90%]">
                                        <div className="bg-[var(--nice-blue)] p-3 rounded-2xl rounded-br-none text-[1rem] text-white">Can you summarize the main points about Greek Art from my notes?</div>
                                        <div className="w-8 h-8 rounded-full bg-[var(--text)] flex items-center justify-center text-[var(--layer1)] text-sm shrink-0">👤</div>
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-50 dark:bg-[var(--layer2)] rounded-full p-1.5 pl-4 flex items-center justify-between border border-[var(--layer3)]">
                                    <span className="text-xs text-gray-400">Ask...</span>
                                    <div className="w-7 h-7 rounded-full bg-[var(--nice-blue)] flex items-center justify-center text-white">↑</div>
                                </div>
                            </div>
                        </div>
                        <div className="card-animation min-w-[85vw] md:min-w-[900px] h-[550px] md:h-[600px] rounded-[3.5rem] bg-[var(--layer3)] shadow-2xl flex flex-col overflow-hidden snap-center">
                            <div className="p-10 text-center">
                                <h3 className="text-3xl md:text-4xl font-black text-gray-800">Visual Organization</h3>
                            </div>

                            <div className="mx-6 flex-grow bg-white dark:bg-[var(--layer1)] rounded-t-[3rem] p-8 flex flex-col gap-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex flex-col gap-3 md:gap-8 hover:scale-105 transition-transform">
                                        <div className="w-10 h-8 bg-emerald-400 rounded-md shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-4 h-2 bg-emerald-600 rounded-br-sm" />
                                        </div>
                                        <p className="font-bold text-emerald-900 text-sm">Biology Notes</p>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 opacity-30" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-100 flex flex-col gap-3 md:gap-8 hover:scale-105 transition-transform">
                                        <div className="w-10 h-8 bg-amber-400 rounded-md shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-4 h-2 bg-amber-600 rounded-br-sm" />
                                        </div>
                                        <p className="font-bold text-amber-900 text-sm">Calculus Prep</p>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        </div>
                                    </div>

                                    {/* Folder 3: Physics */}
                                    <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 flex flex-col gap-3 md:gap-8 hover:scale-105 transition-transform">
                                        <div className="w-10 h-8 bg-blue-400 rounded-md shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-4 h-2 bg-blue-600 rounded-br-sm" />
                                        </div>
                                        <p className="font-bold text-blue-900 text-sm">Physics Labs</p>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-100 flex flex-col gap-3 md:gap-8 hover:scale-105 transition-transform">
                                        <div className="w-10 h-8 bg-purple-400 rounded-md shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-4 h-2 bg-purple-600 rounded-br-sm" />
                                        </div>
                                        <p className="font-bold text-purple-900 text-sm">World History</p>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                                            <span className="w-2 h-2 rounded-full bg-purple-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            {isNavOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity" onClick={() => setIsNavOpen(!isNavOpen)} />
            )}
            <Sidebar
                isNavOpen={isNavOpen}
                setIsNavOpen={setIsNavOpen}
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                theme={theme}
                handleThemeChange={handleThemeChange}
            />
            <Footer />
            <AnimatePresence>
                {authMode && (
                    <AuthPage
                        authMode={authMode}
                        setAuthMode={setAuthMode}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}