import { motion } from "framer-motion";

export default function Sign( { setAuthMode }) {
    return (
        <motion.div className="fixed inset-0 bg-[var(--layer1)]/90 z-[60] backdrop-blur-sm transition-opacity" onClick={() => setAuthMode('signup')}>
            <div
                className={'grid-cols-3 grid w-full'}
                onClick={(e) => e.stopPropagation()}>
                <button
                    className={'font-bold text-[var(--text)] text-2xl md:text-2xl mt-8 mb-12 max-w-2xl mx-auto ' +
                        'cursor-pointer hover:text-[var(--vanilla-cream)] transition-colors underline decoration-wavy decoration-[var(--nice-blue)] underline-offset-12'}
                >
                    Sign up
                </button>
                <button
                    className={'font-bold text-[var(--text)] text-2xl md:text-2xl mt-8 mb-12 max-w-2xl ml-4 mx-auto cursor-pointer hover:text-[var(--vanilla-cream))] transition-colors'}
                    onClick={() => setAuthMode('login')}
                >
                    Log in
                </button>
                <button
                    className={'text-[var(--text)] text-2xl md:text-2xl mt-8 mb-12 max-w-2xl mx-auto cursor-pointer rounded-full bg-[var(--layer2)] px-4 py-2 hover:bg-[var(--layer3)] mr-10'}
                    onClick={() => setAuthMode(null)}
                >
                    X
                </button>
            </div>
        </motion.div>
    )
};