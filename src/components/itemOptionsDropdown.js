'use client';

import { motion } from "framer-motion";
import { Copy, Edit2, ExternalLink, FolderOutput, Trash2 } from "lucide-react";

export default function UseItemOptionDropdown({
                                                  item, itemType, setActiveDropdown,
                                                  setShowRenameNoteModal, setItemName,
                                                  setShowMoveItemModal, handleDuplicateNote,
                                                  setNoteToDelete, setSelectedItem
                                              }) {
    const targetUrl = `/dashboard/${itemType === 'folder' ? 'Folders' : 'Notes'}/${item?.id}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl py-1.5 overflow-hidden origin-top-right"
        >
            <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                >
                    <ExternalLink size={16} /> Open in new tab
                </button>
            </a>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowRenameNoteModal(true);
                    setSelectedItem(item);

                    if (itemType === 'note') setItemName(item.title);
                    if (itemType === 'folder') setItemName(item.name);

                    setActiveDropdown(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
            >
                <Edit2 size={16} /> Rename
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveItemModal(true);
                    setSelectedItem(item);
                    setActiveDropdown(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
            >
                <FolderOutput size={16} /> Move to
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateNote(item);
                    setActiveDropdown(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
            >
                <Copy size={16} /> Duplicate
            </button>

            <div className="h-px bg-[var(--layer3)] my-1 w-full" />

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setNoteToDelete(item);
                    setActiveDropdown(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
                <Trash2 size={16} /> Delete {itemType}
            </button>
        </motion.div>
    )
}