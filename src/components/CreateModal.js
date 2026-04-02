'use client';

import { motion } from "framer-motion";

export default function CreateModal( { setOpenCreateModal } ) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-0 md:p-6">
            <motion.div
                className="relative flex flex-col items-center justify-center w-full h-full md:w-3/4 md:max-h-[70vh] bg-[var(--layer1)] md:rounded-3xl shadow-2xl border-0 md:border md:border-[var(--layer2)] p-6 md:p-12 overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}>

            </motion.div>
        </div>
    );
};