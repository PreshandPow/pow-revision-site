'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { Folder } from "lucide-react";

export default function MoveItemModal({ moveModalRef, onClose, folders = [], currentItem, onMove, itemType }) {
    const [selectedDestination, setSelectedDestination] = useState(null);

    // 1. Derive keys synchronously based on itemType (No useEffect needed!)
    const parentRowName = itemType === 'folder' ? 'parent_folder_id' : 'folder_id';
    const rowName = itemType === 'note' ? 'title' : 'name';

    // 2. Identify the parent ID and if it lives in the root directory
    const parentId = currentItem?.[parentRowName];
    const isAtRoot = !parentId; // If it's null or undefined, it's in the main directory

    const currentParentFolder = folders.find(f => f.id === parentId);

    // 3. Filter out the item itself and the folder it currently lives in
    const availableFolders = folders.filter(f => f.id !== currentItem?.id && f.id !== parentId);

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
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">Move item</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        Select a destination for <span className="font-bold text-[var(--text)]">{currentItem?.[rowName] || 'this item'}</span>.
                    </p>
                </div>

                <div className="px-6 pb-6 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-2">

                    {/* CURRENT LOCATION (Always Shows) */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 mt-1">Current location</p>
                        <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-[var(--nice-blue)] bg-[var(--nice-blue)]/5 text-left">
                            <div className="p-1.5 rounded-md bg-[var(--nice-blue)] text-white">
                                <Folder size={18} fill="currentColor" />
                            </div>
                            <span className="text-sm font-medium truncate text-[var(--text)]">
                                {isAtRoot ? 'Main Directory (Root)' : (currentParentFolder?.name || 'Unknown Folder')}
                            </span>
                        </div>
                        <div className="h-px bg-[var(--layer3)] my-3" />
                    </div>

                    {/* ROOT DESTINATION (Only shows if NOT currently at root) */}
                    {!isAtRoot && (
                        <button
                            onClick={() => setSelectedDestination('root')}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-200 text-left cursor-pointer mb-1
                            ${selectedDestination === 'root'
                                ? 'border-[var(--nice-blue)] bg-[var(--nice-blue)]/5'
                                : 'border-[var(--layer3)] bg-[var(--layer2)] hover:border-[var(--text-muted)]'}`}
                        >
                            <div className={`p-1.5 rounded-md ${selectedDestination === 'root' ? 'bg-[var(--nice-blue)] text-white' : 'bg-[var(--layer3)] text-[var(--text-muted)]'}`}>
                                <Folder size={18} />
                            </div>
                            <span className="text-sm font-medium text-[var(--nice-blue)]">
                                Main Directory (Root)
                            </span>
                        </button>
                    )}

                    {/* AVAILABLE FOLDER DESTINATIONS */}
                    {availableFolders.length === 0 ? (
                        <div className="text-center py-8 text-sm text-[var(--text-muted)] border border-dashed border-[var(--layer3)] rounded-xl bg-[var(--layer2)]/50 mt-1">
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
                                    <span className="text-sm font-medium truncate text-[var(--text)]">
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