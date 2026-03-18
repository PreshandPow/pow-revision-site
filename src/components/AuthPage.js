import { motion } from "framer-motion";
import { Squiggle } from "../components/squiggle";
import { supabase } from "../lib/supabase-client";
import Image from 'next/image';

export default function AuthPage( { authMode, setAuthMode, email, setEmail, password, setPassword, session }) {

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
                console.error('Error signing up:', signInError)
            }
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
                <div className="w-full flex justify-between items-center mb-8">
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
                    </div>
                    <button
                        className="text-[var(--text)] text-2xl font-bold cursor-pointer hover:text-[var(--text-muted)] p-2"
                        onClick={() => setAuthMode(null)}
                    >
                        ✕
                    </button>
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
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none mb-8"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="password" title="password" className="font-bold text-[var(--text-muted)] w-full text-left text-[1rem] mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none mb-8"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
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
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none mb-8"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="password" title="password" className="font-bold text-[var(--text-muted)] w-full text-left text-[1rem] mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password-signup"
                                    placeholder="password"
                                    className="p-4.5 font-semibold border rounded-xl w-full bg-[var(--layer2)] text-[var(--text-muted)] border-none mb-8"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
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
                    </div>
                </div>
            </div>
        </motion.div>
    )
};