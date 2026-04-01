'use client';

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const PRESET_AVATARS = [
    "https://api.dicebear.com/9.x/shapes/svg?seed=Alpha&backgroundColor=ffdfbf",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Beta&backgroundColor=b6e3f4",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Gamma&backgroundColor=c0aede",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Delta&backgroundColor=d1d4f9",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Epsilon&backgroundColor=ffd5dc",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Zeta&backgroundColor=b5eaa0",
    "https://api.dicebear.com/9.x/shapes/svg?seed=Theta&backgroundColor=f6e6b4",
];

export default function DetailsModal({ day, setDay, month, setMonth, year, setYear, avatar, setAvatar, needsAvatar, onSubmit, needsDate }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-0 md:p-6">
            <motion.div
                className="relative flex flex-col items-center justify-center w-full h-full md:w-3/4 md:max-h-[70vh] bg-[var(--layer1)] md:rounded-3xl shadow-2xl border-0 md:border md:border-[var(--layer2)] p-6 md:p-12 overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <div className="text-center mb-10 w-full max-w-lg mt-10 md:mt-0">
                    <h1 className="text-3xl md:text-5xl mb-4 font-brand text-[var(--text)] font-black tracking-tight leading-tight">
                        Finish setting up your profile.
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-[var(--text-muted)]">
                        We just need a few more details to complete your account.
                    </p>
                </div>

                <div className="flex flex-col items-center w-full max-w-md gap-8">
                    {needsAvatar && (
                        <div className="w-full flex flex-col items-center mb-2">
                            <h3 className="text-[var(--text-muted)] font-bold mb-4">Choose an Avatar</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                {PRESET_AVATARS.map((url, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setAvatar(url)}
                                        className={`w-14 h-14 rounded-full overflow-hidden transition-all duration-200 cursor-pointer ${
                                            avatar === url
                                                ? 'ring-4 ring-[var(--nice-blue)] scale-110 shadow-lg'
                                                : 'hover:scale-110 opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {needsDate && (<div className="w-full flex flex-col items-center">
                        <h3 className="text-[var(--text-muted)] font-bold mb-4">Date of Birth</h3>
                        <div className="grid grid-cols-3 gap-3 w-full">
                            <div className="relative w-full">
                                <input
                                    type="number"
                                    placeholder="DD"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="cursor-pointer w-full bg-[var(--layer2)] text-center p-4 md:p-5 pr-6 rounded-xl font-bold text-lg text-[var(--text)]
                                    appearance-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] transition-all
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:bg-[var(--layer3)]"
                                />
                                <ChevronDown
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                                />
                            </div>
                            <div className="relative w-full">
                                <input
                                    type="number"
                                    placeholder="MM"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="cursor-pointer w-full bg-[var(--layer2)] text-center p-4 md:p-5 pr-6 rounded-xl font-bold text-lg text-[var(--text)]
                                    appearance-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] transition-all
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:bg-[var(--layer3)]"
                                />
                                <ChevronDown
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                                />
                            </div>
                            <div className="relative w-full">
                                <input
                                    type="number"
                                    placeholder="YYYY"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="cursor-pointer w-full bg-[var(--layer2)] text-center p-4 md:p-5 pr-6 rounded-xl font-bold text-lg text-[var(--text)]
                                    appearance-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] transition-all
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:bg-[var(--layer3)]"
                                />
                                <ChevronDown
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>)}

                    <button
                        onClick={onSubmit}
                        className="cursor-pointer w-full py-4 px-8 mt-4 bg-[var(--nice-blue)] text-white font-bold text-lg rounded-full shadow-lg shadow-blue-500/20 hover:scale-[0.98] transition-transform"
                    >
                        Save & Continue
                    </button>
                </div>
            </motion.div>
        </div>
    );
}