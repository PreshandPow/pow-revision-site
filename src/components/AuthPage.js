'use client';

import { motion } from "framer-motion";
import { Squiggle } from "../components/squiggle";
import { supabase } from "../lib/supabase-client";
import Image from 'next/image';
import {useState} from "react";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Add this at the top

export default function AuthPage( { authMode, setAuthMode, email, setEmail, password, setPassword, session }) {

    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [sendingRecovery, setSendingRecovery] = useState(false);
    const [popup, setPopup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!email || !password) {
            setPopup(true);
        }   else (
            setPopup(false)
        )


        if (authMode === 'signup') {
            const {error: signUpError} = await supabase.auth.signUp({email, password})
            if (signUpError || !email || !password) {
                console.error('Error signing up:', signUpError)
                toast.error(signUpError.message, {
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
                });
            } else {
                toast.success('Please check your email to verify!', {
                    style: {
                        border: '1px solid var(--nice-blue)',
                        padding: '16px',
                        color: 'var(--text)',
                        background: 'var(--layer2)',
                    },
                    iconTheme: {
                        primary: 'var(--nice-blue)',
                        secondary: '#FFFAEE',
                    },
                });
            }
        } else {
            const {error: signInError} = await supabase.auth.signInWithPassword({email, password})
            if (signInError) {
                console.error('Error signing in:', signInError)
                toast.error(signInError.message, {
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
                });
            }   else {
                toast.success('Successfully logged in!', {
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
                });
                router.push('/dashboard');
            }
        }
    };

    const sendRecovery = async (e) => {
        if (e) e.preventDefault();
        if (!email) {
            setPopup(true);
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/resetPassword',
        });
        if (error) {
            console.error("Error sending reset email:", error.message);
            toast.error(error.message, {
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
            });
        } else {
            toast.success('Password reset link sent to email!', {
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
            });
            setAuthMode('login');
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/dashboard',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                },
            },
        });

        if (error) {
            toast.error("Error connecting to Google");
            console.error(error.message);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 flex flex-col lg:flex-row w-full min-h-screen bg-[var(--layer1)]/95 z-[60] backdrop-blur-sm transition-opacity"
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
                />
                <h1 className="relative z-10 text-6xl font-black text-[var(--layer1)] leading-tight">
                    {authMode === 'resetpassword' ? 'Try to retrace your steps.' : (authMode === 'signup' ? `The best way to study. Sign up for free.` : `Pow bot has been waiting to see you again.`)}
                </h1>
                <h2 className="absolute bottom-10 left-10 z-20 text-5xl font-black text-[var(--nice-blue)]"><a href="http://localhost:3000">POW</a></h2>
            </div>
            <div className="flex-1 flex flex-col w-full min-h-screen overflow-y-auto p-4 md:p-12">
                <div className={`w-full flex ${authMode === 'resetpassword' ? 'justify-end' : 'justify-between'} items-center mb-8`}>
                    {authMode !== 'resetpassword' && (
                        <div className="flex gap-4 md:gap-8" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="whitespace-nowrap relative font-bold text-[var(--text)] text-2xl cursor-pointer transition-colors"
                                onClick={() => setAuthMode('signup')}
                            >
                                Sign up
                                {authMode === 'signup' && (
                                    <motion.div
                                        layoutId="squiggle"
                                        className="absolute -bottom-2 left-0 w-full h-2 pointer-events-none"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                                    >
                                        <Squiggle />
                                    </motion.div>
                                )}
                            </button>
                            <button
                                className="whitespace-nowrap relative font-bold text-[var(--text)] text-2xl cursor-pointer transition-colors"
                                onClick={() => setAuthMode('login')}
                            >
                                Log in
                                {authMode === 'login' && (
                                    <motion.div
                                        layoutId="squiggle"
                                        className="absolute -bottom-2 left-0 w-full h-2 pointer-events-none"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                                    >
                                        <Squiggle />
                                    </motion.div>
                                )}
                            </button>
                            <button
                                className="text-[var(--text)] text-2xl font-bold absolute right-8 cursor-pointer hover:text-[var(--text-muted)] p-2"
                                onClick={() => setAuthMode(null)}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className="w-full max-w-md mx-auto">
                        {authMode === "login" && (
                            <form className="w-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-4 p-4 font-bold border-2 border-[var(--layer2)] rounded-full hover:bg-[var(--layer2)] transition-colors cursor-pointer text-[var(--text)]"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Log in with Google
                                </button>
                                <div className="w-full flex items-center my-6">
                                    <div className="flex-1 h-[1px] bg-[var(--layer2)]"></div>
                                    <span className="px-4 text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">OR</span>
                                    <div className="flex-1 h-[1px] bg-[var(--layer2)]"></div>
                                </div>
                                <label htmlFor="email" className="font-bold text-[var(--text-muted)] w-full text-left text-[1rem] mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email address"
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none focus:ring-2 focus:ring-[var(--nice-blue)] outline-none mb-8"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="w-full mb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="password" title="password" className="font-bold text-[var(--text-muted)] text-[1rem]">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            className="text-[var(--nice-blue)] font-bold text-sm hover:underline cursor-pointer"
                                            onClick={() => setAuthMode('resetpassword')}
                                        >
                                            Forgot password
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            placeholder="Enter your password"
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
                                </div>
                                <p className={'md:whitespace-nowrap mb-8 text-sm font-semibold text-[var(--nice-blue)]'}>
                                    By clicking Log in, you accept Pow's Terms of Service and Privacy Policy
                                </p>
                                {popup && (
                                    <div
                                        className="cursor-pointer p-4 font-semibold border-none rounded-2xl w-full bg-[var(--vanilla-cream)] text-red-400 mb-8"
                                    >
                                        {!email ? 'Your email address cannot be left blank' : 'Your password cannot be left blank'}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 mb-8 hover:scale-95 transition-transform"
                                >
                                    Log in
                                </button>
                                <button
                                    type="button"
                                    className="p-4.5 font-semibold border rounded-full w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8 hover:bg-[var(--text)] cursor-pointer"
                                    onClick={() => setAuthMode('signup')}
                                >
                                    New to Pow? Create an account.
                                </button>
                            </form>
                        )}
                        {authMode === "signup" && (
                            <form className="w-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-4 p-4 font-bold border-2 border-[var(--layer2)] rounded-full hover:bg-[var(--layer2)] transition-colors cursor-pointer text-[var(--text)]"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </button>
                                <div className="w-full flex items-center my-6">
                                    <div className="flex-1 h-[1px] bg-[var(--layer2)]"></div>
                                    <span className="px-4 text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">OR</span>
                                    <div className="flex-1 h-[1px] bg-[var(--layer2)]"></div>
                                </div>
                                <label htmlFor="email" className="font-bold text-[var(--text-muted)] w-full text-left text-[1rem] mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="user@email.co.uk"
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none focus:ring-2 focus:ring-[var(--nice-blue)] outline-none mb-8"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <div className="w-full mb-8">
                                    <label htmlFor="password" title="password" className="font-bold text-[var(--text-muted)] text-[1rem] block mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
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
                                </div>
                                <button
                                    type="submit"
                                    className="cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform mb-8"
                                >
                                    Sign up
                                </button>
                                <button
                                    type="button"
                                    className="p-4.5 font-semibold border rounded-full w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8 hover:bg-[var(--text)] cursor-pointer"
                                    onClick={() => setAuthMode('login')}
                                >
                                    Already have an account? Log in
                                </button>
                            </form>
                        )}
                        {authMode === "resetpassword" && (
                            <div className="w-full py-8">
                                <form onSubmit={sendRecovery}>
                                    <button
                                        className="text-[var(--text)] text-2xl font-bold cursor-pointer absolute right-8 top-2 hover:text-[var(--text-muted)] p-2"
                                        onClick={() => setAuthMode('login')}
                                    >
                                        ✕
                                    </button>
                                    <h1 className={'text-5xl font-bold text-[var(--text)] mb-8'}>
                                        Reset your password
                                    </h1>
                                    <p className={'text-xxl text-[var(--text-muted)] mb-8'}>
                                        Enter the email you signed up with. We'll send you a link to log in and reset your password. If you signed up with a parent’s email, we’ll send them the link.
                                    </p>
                                    <label htmlFor="email" className="font-bold text-[var(--text-muted)] w-full text-left text-[1rem] mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="user@email.co.uk"
                                        className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none focus:ring-2 focus:ring-[var(--nice-blue)] outline-none mb-8"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {popup && (
                                        <div
                                            className="cursor-pointer p-4 font-semibold border-none rounded-2xl w-full bg-[var(--vanilla-cream)] text-red-400 mb-8"
                                        >
                                            {!email ? 'Your email address cannot be left blank' : 'Your password cannot be left blank'}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform mb-8"
                                    >
                                        Send link
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </motion.div>
    )
};