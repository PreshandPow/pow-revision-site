'use client';

import { motion } from "framer-motion";
import Image from 'next/image';
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    const supabase = createClient()

    useEffect(() => {
        // Listen for the recovery event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                setSessionReady(true);
            }
        });
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

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
            setTimeout(() => router.push('/'), 1500);
        }
    }

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
                <h1 className="relative z-10 text-6xl font-black text-[var(--layer1)] leading-tight">
                    Seems like you forgot something.
                </h1>
                <h2 className="absolute bottom-10 left-10 z-20 text-5xl font-black text-[var(--nice-blue)] tracking-tighter">
                    <a href="/">POW</a>
                </h2>
            </div>

            <div className="flex-1 flex flex-col w-full min-h-screen overflow-y-auto p-8 md:p-12 lg:p-20 bg-[var(--layer1)]">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <input
                            type="password"
                            placeholder="Confirm password"
                            className="p-4.5 font-semibold rounded-xl bg-[var(--layer2)] text-[var(--text-muted)] border-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)] mb-8"
                            onChange={e => setConfirmPassword(e.target.value)}
                        />

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