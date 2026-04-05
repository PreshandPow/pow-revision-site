import { ChevronDown, Menu } from "lucide-react";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Sidebar({ isNavOpen, setIsNavOpen, isOptionsOpen, setIsOptionsOpen, theme, handleThemeChange, router }) {
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const sidebarRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isNavOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsNavOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNavOpen, setIsNavOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
                    isNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                aria-hidden="true"
            />
            <aside ref={sidebarRef}
                   className={`
                fixed top-0 left-0 h-screen w-[280px] bg-[var(--layer1)] z-[70] 
                transform transition-transform duration-300 ease-in-out
                ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
                p-6 shadow-2xl
            `}
                   aria-label="Side Navigation"
                   aria-hidden={!isNavOpen}
            >
                <header className="flex items-center justify-between mb-8">
                    <Link href="/" className="font-brand font-black tracking-tighter text-5xl font-black text-[var(--nice-blue)]">
                        POW
                    </Link>
                    <button
                        className="cursor-pointer md:hidden p-3 hover:bg-[var(--layer2)] rounded-full transition-colors"
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6 text-[var(--text)]" />
                    </button>
                </header>
                <nav className="flex flex-col h-full">
                    <ul className="space-y-2">
                        <li>
                            <button
                                className="flex items-center gap-4 w-full p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group"
                                onClick={() => {
                                    if (session) {
                                        console.log('awdawsddwa');
                                        router.push(`/dashboard/Notes`);
                                    }}}>
                                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">📝</span>
                                <span className="font-bold text-[var(--text)]">Notes</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center gap-4 w-full p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group">
                                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🗃️</span>
                                <span className="font-bold text-[var(--text)]">Flashcards</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                                aria-expanded={isOptionsOpen}
                                className="flex items-center justify-between w-full p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">⚙️</span>
                                    <span className="font-bold text-[var(--text)]">Options</span>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`text-[var(--text-muted)] transition-transform duration-300 ${isOptionsOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            <div className={`grid transition-all duration-300 ease-in-out ${
                                isOptionsOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                            }`}>
                                <div className="overflow-hidden">
                                    <ul className="ml-6 border-l-2 border-[var(--layer3)] pl-4 flex flex-col gap-2">
                                        <li>
                                            <button
                                                onClick={handleThemeChange}
                                                className="cursor-pointer flex items-center justify-between w-full p-3 hover:bg-[var(--layer2)] rounded-lg transition-colors group text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{theme === 'light' ? '☀️' : '🌙'}</span>
                                                    <span className="font-semibold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Appearance</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--layer3)] px-2 py-0.5 ml-1 rounded shadow-sm">
                                                {theme}
                                            </span>
                                            </button>
                                        </li>
                                        <li>
                                            <button className="cursor-pointer flex items-center gap-2 w-full p-3 hover:bg-[var(--layer2)] rounded-lg transition-colors group text-left">
                                                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">❓</span>
                                                <span className="font-semibold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Support Center</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}