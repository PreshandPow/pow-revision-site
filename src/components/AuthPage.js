import { motion } from "framer-motion";
import { Squiggle } from "../components/squiggle";
import { supabase } from "../lib/supabase-client";
import Image from 'next/image';
import {useState} from "react";

export default function AuthPage( { authMode, setAuthMode, email, setEmail, password, setPassword, session }) {

    const [showPassword, setShowPassword] = useState(false);
    const [sendingRecovery, setSendingRecovery] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (authMode === 'signup') {
            const {error: signUpError} = await supabase.auth.signUp({email, password})
            if (signUpError) {
                console.error('Error signing up:', signUpError)
            } else {
                window.alert('log in with details provided')
            }
        } else {
            const {error: signInError} = await supabase.auth.signInWithPassword({email, password})
            if (signInError) {
                console.error('Error signing in:', signInError)
            }
        }
    };

    const sendRecovery = async (e) => {
        if (e) e.preventDefault();
        if (!email) {
            window.alert("Please enter your email address first.");
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/reset-password',
        });
        if (error) {
            console.error("Error sending reset email:", error.message);
            window.alert(error.message);
        } else {
            window.alert("Password reset email sent! Check your inbox.");
        }
    };

    const handleLogOut = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.alert('log out successfully');
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
                <h1 className="relative z-10 text-6xl font-bold text-[var(--vanilla-cream)] leading-tight">
                    {authMode === 'signup' ? `The best way to study. Sign up for free.` : `Pow bot has been waiting to see you again.`}
                </h1>
                <h2 className="absolute bottom-10 left-10 z-20 text-5xl font-black text-[var(--nice-blue)]"><a href="#">POW</a></h2>
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
                                <button
                                    type="submit"
                                    className="cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform"
                                >
                                    Log in
                                </button>
                                {session && (
                                    <button
                                        type="button"
                                        className="mt-4 cursor-pointer p-4 font-semibold border rounded-xl w-full text-[var(--text)]"
                                        onClick={handleLogOut}
                                    >
                                        Sign Out
                                    </button>
                                )}
                            </form>
                        )}
                        {authMode === "signup" && (
                            <form className="w-full flex flex-col items-center justify-center" onSubmit={handleSubmit}>
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
                            <div className="w-full min-h-screen">
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