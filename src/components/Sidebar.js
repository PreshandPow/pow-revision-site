import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Sidebar({ isNavOpen, setIsNavOpen, isOptionsOpen, setIsOptionsOpen, theme, handleThemeChange }) {

    const sidebarRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isNavOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsNavOpen(false); // Close it
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNavOpen, setIsNavOpen]);

    return (
        <aside ref={sidebarRef}
            className={`
                fixed top-0 left-0 h-full w-2/3 bg-[var(--layer1)] z-[70] 
                transform transition-transform duration-300 ease-in-out
                ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
                p-6 shadow-2xl border-r border-[var(--layer3)]
            `}
            aria-label="Side Navigation"
            aria-hidden={!isNavOpen}
        >
            <header className="flex items-center justify-between mb-8">
                <div className="text-[var(--nice-blue)] font-black text-2xl tracking-tighter">
                    <a href="#">POW</a>
                </div>
                <button
                    className="cursor-pointer md:hidden p-3 hover:bg-[var(--layer2)] rounded-full transition-colors"
                    onClick={() => setIsNavOpen(!isNavOpen)}
                >
                    <div className="flex flex-col gap-1.5">
                        <span className="w-6 h-0.5 bg-[var(--text)] rounded-full"></span>
                        <span className="w-6 h-0.5 bg-[var(--text)] rounded-full"></span>
                        <span className="w-6 h-0.5 bg-[var(--text)] rounded-full"></span>
                    </div>
                </button>
            </header>

            <nav className="flex flex-col h-full">
                <ul className="space-y-2">
                    <li>
                        <button className="flex items-center gap-4 w-full p-3 hover:bg-[var(--layer2)] rounded-xl cursor-pointer transition-all group">
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
                                            <span className="text-xl">❓</span>
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
    );
}