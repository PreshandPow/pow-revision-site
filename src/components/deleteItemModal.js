'use client';

import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function UseDeleteItemModal({ item, itemType, deleteItemModalRef, handleDeleteConfirm, setNoteToDelete }) {
    return (
        <AnimatePresence>
            <div ref={deleteItemModalRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col w-full max-w-[400px] bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text)] tracking-tight mb-2">Delete {itemType}?</h2>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            Are you sure you want to delete this {itemType}? This action cannot be undone.
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-[var(--layer2)]/50 border-t border-[var(--layer3)] flex items-center justify-end gap-3">
                        <button onClick={() => setNoteToDelete(null)} className="px-4 py-2 text-sm font-semibold
                        rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-semibold rounded-lg
                         bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95 transition-all cursor-pointer">
                            Yes, delete {itemType}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}