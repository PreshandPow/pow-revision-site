'use client';

import { useState } from 'react';
import { motion } from "framer-motion";

export default function RenameItemModal({ renameModalRef, currentName, handleRename, setItemName, setShowRenameItemModal }) {

    const [newName, setNewName] = useState('');

    console.log('DEBUG CURRENTNAME:', currentName)

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                ref={renameModalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[400px] bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl overflow-hidden"
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-[var(--text)] mb-2">Rename Item</h2>
                    <input
                        type="text"
                        defaultValue={currentName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-lg bg-[var(--layer2)] text-[var(--text)] border border-[var(--layer3)] outline-none focus:border-[var(--nice-blue)]"
                    />
                </div>
                <div className="px-6 py-4 bg-[var(--layer2)]/50 border-t border-[var(--layer3)] flex justify-end gap-3">
                    <button onClick={() => {
                        setShowRenameItemModal(false);
                    }} className="px-4 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setItemName(newName);
                            setShowRenameItemModal(false);
                            handleRename(newName);
                        }}
                        disabled={!newName.trim() || currentName.trim() === newName.trim()}
                        className={`px-4 py-2 text-sm font-semibold bg-[var(--nice-blue)] text-[var(--text)] rounded-lg cursor-pointer
                            hover:transform hover:scale-105 transition-transform duration-200
                            ${!newName.trim() || currentName.trim() === newName.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                    >
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
}