'use client';

import { useState } from 'react';
import { Folder, FileText, MoreVertical, Plus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FolderContentPage() {
    const [items] = useState([
        { id: 1, name: 'Core Pure 1', type: 'folder', count: 12 },
        { id: 2, name: 'Statistics Year 1', type: 'folder', count: 5 },
        { id: 3, name: 'Matrix Transformations', type: 'note', date: '2 days ago' },
        { id: 4, name: 'Complex Numbers Intro', type: 'note', date: 'May 15' },
    ]);

    return (
        <div className="min-h-screen bg-[var(--layer1)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header and Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <span className="hover:text-[var(--text)] cursor-pointer transition-colors">Folders</span>
                        <ChevronRight size={16} />
                        <span className="text-[var(--text)] font-bold">Mathematics</span>
                    </div>

                    <button className="flex items-center justify-center gap-2 bg-[var(--nice-blue)] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                {/* Folders */}
                <div className="mb-10">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Folders</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {items.filter(i => i.type === 'folder').map((folder) => (
                            <motion.div
                                key={folder.id}
                                whileHover={{ y: -2 }}
                                className="group flex items-center justify-between p-4 bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl cursor-pointer hover:border-[var(--nice-blue)] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                        <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text)] text-sm">{folder.name}</h3>
                                        <p className="text-xs text-[var(--text-muted)] font-medium">{folder.count} items</p>
                                    </div>
                                </div>
                                <MoreVertical size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Notes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.filter(i => i.type === 'note').map((note) => (
                            <motion.div
                                key={note.id}
                                whileHover={{ y: -2 }}
                                className="group relative aspect-[4/3] p-5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl cursor-pointer hover:shadow-xl hover:shadow-black/5 hover:border-[var(--nice-blue)] transition-all overflow-hidden"
                            >
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-[var(--layer2)] rounded-lg text-[var(--text-muted)] group-hover:text-[var(--nice-blue)] transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <button className="p-1 hover:bg-[var(--layer3)] rounded-md transition-colors text-[var(--text-muted)]">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-[var(--text)] leading-snug mb-1">{note.name}</h3>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Edited {note.date}</p>
                                    </div>
                                </div>

                                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--nice-blue)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}