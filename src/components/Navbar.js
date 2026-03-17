import {Search} from "lucide-react";

export default function Navbar({ setSearchInput, theme, handleThemeChange, isNavOpen, setIsNavOpen, setAuthMode }) {
    return (
        <nav className="sticky top-0 z-50 flex flex-col gap-6 w-full bg-[var(--layer1)] p-4 md:p-6 shadow-sm border-b border-[var(--layer3)]">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
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
                <p className="text-2xl font-black text-[var(--nice-blue)] tracking-tighter"><a href="#">POW</a></p>
                <div className="hidden md:flex items-center gap-8 font-semibold">
                    <button className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--nice-blue)] transition-colors">
                        <p><span>❔</span>Support</p>
                    </button>
                    <button onClick={handleThemeChange} className="cursor-pointer p-2 hover:bg-[var(--layer2)] rounded-full">
                        {theme === 'light' ? '☀️' : '🌙'}
                    </button>
                </div>

                <div className="flex gap-2 md:gap-4">
                    <button
                        className="cursor-pointer text-[var(--text)] font-bold px-4 py-2 hover:bg-[var(--layer2)] rounded-xl transition-colors text-sm"
                        onClick={() => setAuthMode('login')}>
                        Log in</button>
                    <button className="cursor-pointer bg-[var(--nice-blue)] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-105"
                            onClick={() => setAuthMode('signup')}
                    >
                        Sign up</button>
                </div>
            </div>
            <div className="relative w-full max-w-4xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                <input
                    type="text"
                    placeholder="Flashcard sets, textbooks, questions"
                    className="w-full bg-[var(--layer2)] py-3 pl-12 pr-4 rounded-xl border border-transparent focus:border-[var(--nice-blue)] outline-none transition-all"
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>
        </nav>
    )
}