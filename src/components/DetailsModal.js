import { motion } from "framer-motion";

export default function DetailsModal() {
    return (
        <motion.div
            className="mx-auto flex w-2/3 min-h-2/3 bg-[var(--layer1)]/95 z-[60] backdrop-blur-sm transition-opacity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <h1
                className={'text-2xl'}>
                Please finish setting up your profile.
            </h1>
            </motion.div>
    );
};