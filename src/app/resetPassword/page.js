'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import { supabase } from "../../lib/supabase-client";
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    // ─── 1. GLOBAL SETUP & STATES ─────────────────────────────────────────────────
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ─── 2. AUTHENTICATION & SESSION EFFECT ───────────────────────────────────────
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Listen to the recovery event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                setSessionReady(true);
            }
        });

        // Check the current session on mount
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    // ─── 3. ACTION HANDLERS ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!sessionReady) {
            toast.error('Session expired. Please request a new reset link.');
            return;
        }
        if (!password || !confirmPassword) {
            toast.error('Please fill in both fields!');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters!');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Password updated successfully! 🚀');
            await router.push('/');
        }
    };

    // ─── 4. RENDER ────────────────────────────────────────────────────────────────
    return (
        <motion.div
            className="fixed inset-0 flex flex-col lg:flex-row w-full min-h-screen bg-[var(--layer1)]/95 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {/* Left Side: Image Banner */}
            <div className="relative hidden lg:flex lg:w-1/2 lg:h-screen bg-[var(--nice-blue)] p-20 sticky top-0 overflow-hidden">
                <Image
                    src="/authPage-image.png"
                    alt="POWer learning illustration"
                    fill
                    className="object-cover opacity-100"
                    priority
                />
                <h1 className="relative z-10 text-6xl font-black text-[var(--layer1)] leading-tight">
                    Seems like you forgot something.
                </h1>
                <h2 className="absolute bottom-10 left-10 z-20 text-5xl font-black text-[var(--nice-blue)] tracking-tighter">
                    <a href="/">POW</a>
                </h2>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col w-full min-h-screen overflow-y-auto p-8 md:p-12 lg:p-20 bg-[var(--layer1)]">

                {/* Close Button */}
                <div className="w-full flex justify-end items-center mb-12">
                    <button
                        className="text-[var(--text)] text-2xl font-bold cursor-pointer hover:text-[var(--text-muted)] p-2"
                        onClick={() => router.push('/')}
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center w-full">
                    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col">
                        <h3 className="text-4xl font-extrabold text-[var(--text)] mb-4">
                            Reset Password
                        </h3>
                        <p className="text-[var(--text-muted)] mb-8">
                            Make sure you remember this one.
                        </p>

                        <div className="relative mb-8">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                className="p-4.5 pr-12 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none focus:ring-2 focus:ring-[var(--nice-blue)] outline-none"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--nice-blue)] cursor-pointer "
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <Eye size={24} />
                                ) : (
                                    <Eye size={24} />
                                )}
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="confirm password"
                                className="p-4.5 pr-12 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none focus:ring-2 focus:ring-[var(--nice-blue)] outline-none"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--nice-blue)] cursor-pointer "
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <Eye size={24} />
                                ) : (
                                    <Eye size={24} />
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] text-white shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform"
                        >
                            Set new password
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}