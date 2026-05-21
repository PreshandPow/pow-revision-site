'use client';

import { motion } from "framer-motion";

export default function CreateFolderModal({ createFolderModalRef, setShowCreateFolderModal, setFolderName, handleCreateFolder }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
            <motion.div
                ref={createFolderModalRef}
                className="relative flex flex-col w-full max-w-[420px] bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">
                        Create new folder
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Organize your notes and materials into a new folder space.
                    </p>
                </div>

                {/* Input */}
                <div className="px-6 pb-6">
                    <input
                        type="text"
                        placeholder="e.g. A-Level Mathematics"
                        onChange={(e) => setFolderName(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-2.5 text-sm rounded-lg bg-[var(--layer2)]
                        text-[var(--text)] placeholder-[var(--text-muted)] border border-[var(--layer3)]
                        outline-none focus:border-[var(--nice-blue)] focus:ring-1 focus:ring-[var(--nice-blue)]
                        transition-all duration-200"
                    />
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-[var(--layer2)]/50 border-t border-[var(--layer3)] flex flex-col-reverse md:flex-row items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setShowCreateFolderModal(false)}
                        className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-lg text-[var(--text-muted)]
                        hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateFolder}
                        className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--nice-blue)]
                        text-white shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                        Create folder
                    </button>
                </div>
            </motion.div>
        </div>
    )
}