'use client';

import { motion } from "framer-motion";
import Image from 'next/image';

export default function ResetPasswordPage() {
    return (
        <motion.div
            className="fixed inset-0 flex flex-col lg:flex-row w-full min-h-screen bg-[var(--layer1)]/95 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="relative hidden lg:flex lg:w-1/2 lg:h-screen bg-[var(--nice-blue)] p-20 sticky top-0 overflow-hidden">
                <Image
                    src="/authPage-image.png"
                    alt="POWer learning illustration"
                    fill
                    className="object-cover opacity-100"
                    priority
                />
                <h1 className="relative z-10 text-6xl font-bold text-[var(--vanilla-cream)] leading-tight">
                    Try to retrace your steps.
                </h1>
                <h2 className="absolute bottom-10 left-10 z-20 text-5xl font-black text-[var(--nice-blue)] tracking-tighter">
                    <a href="http://localhost:3000">POW</a>
                </h2>
            </div>
            <div className="flex-1 flex flex-col w-full min-h-screen overflow-y-auto p-8 md:p-12 lg:p-20 bg-[var(--layer1)]">
                <div className="w-full flex justify-end items-center mb-12">
                    <button
                        className="text-[var(--text)] text-2xl font-bold cursor-pointer hover:text-[var(--text-muted)] transition-colors"
                        onClick={() => window.history.back()}
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="w-full max-w-md mx-auto">
                        <div className="flex flex-col">
                            <h3 className="text-4xl font-extrabold text-[var(--text)] mb-4">
                                Reset Password
                            </h3>
                            <p className="text-[var(--text-muted)] mb-8">
                                Make sure you remember this one
                            </p>
                            <input
                                type="password"
                                placeholder="Enter your new password"
                                className="p-4.5 font-semibold rounded-xl bg-[var(--layer2)] text-[var(--text-muted)] border-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] mb-6"
                            />
                            <input
                                type="password"
                                placeholder="Confirm password"
                                className="p-4.5 font-semibold rounded-xl bg-[var(--layer2)] text-[var(--text-muted)] border-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] mb-6"
                            />

                            <button className="p-4 font-bold rounded-full bg-[var(--nice-blue)] text-white shadow-lg hover:scale-95 transition-transform">
                                Set new password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}