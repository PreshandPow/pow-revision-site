'use client';

import {useEffect, useState} from 'react';
import { Folder, FileText, MoreVertical, Plus, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from "react-hot-toast";
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FolderContentPage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [prevFolder, setPrevFolder] = useState('');

    const [items] = useState([
        { id: 1, name: 'Core Pure 1', type: 'folder', count: 12 },
        { id: 2, name: 'Statistics Year 1', type: 'folder', count: 5 },
        { id: 3, name: 'Matrix Transformations', type: 'note', date: '2 days ago' },
        { id: 4, name: 'Complex Numbers Intro', type: 'note', date: 'May 15' },
    ]);

    // ── data fetching ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchFolder = async () => {
            const { data: folder, error } = await supabase
                .from('folders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                toast.error('Could not load folder', toastStyle);
                router.replace('/dashboard/Folders');
                return;
            }

            setFolderName(folder?.name || '');
            if (folder?.parent_folder_id) {
                setPrevFolder(folder?.parent_folder_id)
            }
            folder?.parent_folder_id ? setPrevFolder(folder?.parent_folder_id) : setPrevFolder('Folders')
            setLoading(false);
        };
        fetchFolder();
    }, [id]);

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg
                    className="animate-spin"
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                >
                    <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                    />
                    <path
                        d="M16 4 A12 12 0 0 1 28 16"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your Folder ready for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>

    );

    return (
        <div className="min-h-screen bg-[var(--layer1)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header and Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <button
                            onClick={() => router.push('/dashboard/Folders')}
                            className="hover:text-[var(--text)] cursor-pointer transition-colors text-lg">
                            {prevFolder}
                        </button>
                        <ChevronRight size={16} />
                        <span className="text-[var(--text)] font-bold text-lg">{folderName}</span>
                    </div>

                    <button className="flex items-center justify-center gap-2 bg-[var(--nice-blue)] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                {/* Notes */}
                <div className={'mb-10'}>
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

                {/* Flashcards */}
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">FLASHCARDS</h2>
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