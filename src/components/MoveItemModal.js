'use client';

import { motion } from "framer-motion";
import {useEffect, useState} from "react";
import { Folder } from "lucide-react";

export default function MoveItemModal({ moveModalRef, onClose, folders, currentItem, onMove, itemType }) {
    const [selectedDestination, setSelectedDestination] = useState(null);

    const availableFolders = folders.filter(f => f.id !== currentItem?.id);

    const [parentRowName, setParentRowName] = useState(null);
    const [rowName, setRowName] = useState(null);

    useEffect(() => {
        if (itemType === 'note') {
            setParentRowName('folder_id');
            setRowName('title');
        }
        if (itemType === 'folder') {
            setParentRowName('parent_folder_id');
            setRowName('name');
        }
        console.log("DEBUG MOVE ITEM:", { rowName, itemType });
    })

    console.log("DEBUG MOVE ITEM:", { rowName });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                ref={moveModalRef}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col w-full max-w-[420px] bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">Move item</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Select a destination for <span className="font-bold text-[var(--text)]">{currentItem?.[rowName] || 'this item'}</span>.
                    </p>
                </div>

                <div className="px-6 pb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {parentRowName && (
                        <button
                            onClick={() => setSelectedDestination('root')}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-200 text-left cursor-pointer
                                ${selectedDestination === 'root'
                                ? 'border-[var(--nice-blue)] bg-[var(--nice-blue)]/5'
                                : 'border-[var(--layer3)] bg-[var(--layer2)] hover:border-[var(--text-muted)]'}`}
                        >
                            <div className={`p-1.5 text-[var(--vanilla-cream)] rounded-md ${selectedDestination === 'root' ? 'bg-[var(--nice-blue)] text-white' : 'bg-[var(--layer3)] text-[var(--text-muted)]'}`}>
                                <Folder size={18}/>
                            </div>
                            <span className={`text-sm font-medium text-[var(--nice-blue)]`}>
                                    Main Directory (Root)
                                </span>
                        </button>
                    )}
                    {availableFolders.length === 0 ? (
                        <div className="text-center py-8 text-sm text-[var(--text-muted)] border border-dashed border-[var(--layer3)] rounded-xl bg-[var(--layer2)]/50">
                            No other folders available.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {availableFolders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedDestination(folder.id)}
                                    className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-200 text-left cursor-pointer
                                    ${selectedDestination === folder.id
                                        ? 'border-[var(--nice-blue)] bg-[var(--nice-blue)]/5'
                                        : 'border-[var(--layer3)] bg-[var(--layer2)] hover:border-[var(--text-muted)]'}`}
                                >
                                    <div className={`p-1.5 rounded-md ${selectedDestination === folder.id ? 'bg-[var(--nice-blue)] text-white' : 'bg-[var(--layer3)] text-[var(--text-muted)]'}`}>
                                        <Folder size={18} fill={selectedDestination === folder.id ? "currentColor" : "none"} />
                                    </div>
                                    <span className={`text-sm font-medium truncate`}>
                                        {folder.name || 'Untitled Folder'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-[var(--layer2)]/50 border-t border-[var(--layer3)] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold rounded-lg text-[var(--text-muted)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onMove(selectedDestination)}
                        disabled={!selectedDestination}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--nice-blue)] text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Move here
                    </button>
                </div>
            </motion.div>
        </div>
    );
}