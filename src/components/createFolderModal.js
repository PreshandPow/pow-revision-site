'use client';

import { motion } from "framer-motion";

export default function CreateFolderModal({ createFolderModalRef }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-0 md:p-6">
            <motion.div
                ref={createFolderModalRef}
                className="relative flex flex-col items-center justify-center w-full h-full md:w-1/3 md:max-h-[30vh]
                bg-[var(--layer1)] md:rounded-3xl shadow-2xl border-0 md:border md:border-[var(--layer2)] p-6 md:p-12 overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <div className="text-center mb-10 w-full max-w-lg mt-10 md:mt-0">
                    <h1 className="text-2xl md:text-5xl mb-4 font-main text-[var(--text)] text-left font-black tracking-tight leading-tight">
                        New Folder
                    </h1>
                    <input
                        type="text"
                        placeholder="Untitled Folder"
                        className="p-2 font-semibold rounded-xl bg-[var(--layer2)] text-[var(--text-muted)] border-none outline-none focus:ring-2 focus:ring-[var(--nice-blue)]"
                    />
                </div>
            </motion.div>
        </div>
    )
}