'use client';

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function DetailsModal({ day, setDay, month, setMonth, year, setYear, onSubmit }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-0 md:p-6">
            <motion.div
                className="relative flex flex-col items-center justify-center w-full h-full md:w-2/3 md:h-2/3 bg-[var(--layer1)] md:rounded-3xl shadow-2xl border-0 md:border md:border-[var(--layer2)] p-6 md:p-12 overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >

                <div className="text-center mb-10 w-full max-w-lg">
                    <h1 className="text-3xl md:text-5xl mb-4 font-brand text-[var(--text)] font-black tracking-tight leading-tight">
                        Finish setting up your profile.
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-[var(--text-muted)]">
                        We just need your date of birth to complete your account.
                    </p>
                </div>

                <div className="flex flex-col items-center w-full max-w-md gap-8">
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

                    <button
                        onClick={onSubmit}
                        className="cursor-pointer w-full py-4 px-8 bg-[var(--nice-blue)] text-white font-bold text-lg rounded-full shadow-lg shadow-blue-500/20 hover:scale-[0.98] transition-transform"
                    >
                        Save & Continue
                    </button>
                </div>

            </motion.div>
        </div>
    );
}