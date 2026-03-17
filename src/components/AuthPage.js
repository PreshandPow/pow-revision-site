import { motion } from "framer-motion";
import { Squiggle } from "../components/squiggle";
import { supabase } from "../lib/supabase-client";

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
            className="fixed inset-0 bg-[var(--layer1)]/95 z-[60] backdrop-blur-sm transition-opacity" initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}

        >
            <div
                className={'grid-cols-3 gap-20 grid w-full'}
                onClick={(e) => e.stopPropagation()}>
                <button
                    className={'whitespace-nowrap relative font-bold text-[var(--text)] text-2xl mt-8 mb-12 max-w-2xl mx-auto' +
                        ' cursor-pointer transition-colors ml-8'}
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
                    className={'whitespace-nowrap relative font-bold text-[var(--text)] text-2xl mt-8 mb-12 max-w-2xl mx-auto ' +
                        'cursor-pointer transition-colors -ml-1 md:-ml-40 '}
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
                    className={'text-[var(--text)] text-2xl font-bold md:text-2xl mt-8 mb-12 max-w-2xl mx-auto cursor-pointer hover:text-[var(--text-muted)] px-4 py-2 mr-10'}
                    onClick={() => setAuthMode(null)}
                >
                    X
                </button>
            </div>
            {authMode === "login" && (
                <form
                    className={'w-[80%] min-h-[80vh] flex flex-col items-center justify-center mx-auto'}

                >
                    <label
                        htmlFor="email"
                        className={'font-bold text-[var(--text)] text-[var(--text-muted)] text-justify text-[1rem] mb-2'}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id={'email'}
                        placeholder={'Enter your email address'}
                        className={'p-4.5 font-semibold border rounded-xl w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8'}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label
                        htmlFor="password"
                        className={'font-bold text-[var(--text)] text-[var(--text-muted)] text-justify text-[1rem]'}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id={'password'}
                        placeholder={'Enter your password'}
                        className={'p-4.5 font-semibold border rounded-xl w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8'}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={'cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 hover:scale-99'}
                        onClick={handleSubmit}
                    >
                        Log in
                    </button>
                    {session && (
                        <button
                            type="submit"
                            className={'cursor-pointer p-4 font-semibold border rounded-xl w'}
                            onClick={handleLogOut}
                        >
                            Sign Out
                        </button>
                    )}
                </form>
            )}
            {authMode === "signup" && (
                <form
                    className={'w-[80%] min-h-[80vh] flex flex-col items-center justify-center mx-auto'}
                >
                    <label
                        htmlFor="email"
                        className={'font-bold text-[var(--text)] text-[var(--text-muted)] text-justify text-[1rem] mb-2'}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder={'user@email.co.uk'}
                        className={'p-4.5 font-semibold border rounded-xl w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8'}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label
                        htmlFor="password"
                        className={'font-bold text-[var(--text)] text-[var(--text-muted)] text-justify text-[1rem] mb-2'}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id={'password'}
                        placeholder={'password'}
                        className={'p-4.5 font-semibold border rounded-xl w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8'}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={'cursor-pointer p-4 font-semibold border rounded-full w-full bg-[var(--nice-blue)] border-none shadow-lg shadow-blue-500/20 hover:scale-99 mb-8'}
                        onClick={handleSubmit}
                    >
                        Sign up
                    </button>
                    <button
                        type="submit"
                        className={'p-4.5 font-semibold border rounded-full w-full bg-[var(--text-muted)] text-[var(--layer2)] border-none mb-8 hover:bg-[var(--text)] cursor-pointer'}
                        onClick={() => setAuthMode('login')}
                    >
                        Already have an account? Log in
                    </button>
                </form>
            )}
        </motion.div>
    )
};