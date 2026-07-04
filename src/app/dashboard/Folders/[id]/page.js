'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Folder, FileText, MoreVertical, Plus, ChevronRight,
    CreditCard, Clock, ExternalLink, Edit2, FolderOutput, Copy, Trash2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from "react-hot-toast";
import RenameItemModal from "../../../../components/RenameItemModal";
import { useRenameItem } from "../../../hooks/useItemActions";

// ───  SUPABASE CLIENT ───────────────────────────────────────────────────────
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FolderContentPage() {

    // ───  GLOBAL SETUP & STATES ───────────────────────────────────────────────
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [prevFolder, setPrevFolder] = useState('Folders');
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);

    const [showFolderOptionsDropdown, setShowFolderOptionsDropdown] = useState(false);
    const [nestedFolderBreadcrumbs, setNestedFolderBreadcrumbs] = useState([]);

    // Temporary mock items for Notes and Flashcards
    const [items] = useState([
        { id: 3, name: 'Matrix Transformations', type: 'note', date: '2 days ago' },
        { id: 4, name: 'Complex Numbers Intro', type: 'note', date: 'May 15' },
        { id: 5, name: 'Calculus Definitions', type: 'flashcard', date: 'May 10' },
    ]);

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
        },
        iconTheme: {
            primary: 'var(--nice-blue)',
            secondary: '#FFFAEE',
        },
    };

    // ───  LIFECYCLE EFFECTS ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchFolderAndChildren = async () => {
            const { data: currentFolder, error: folderError } = await supabase
                .from('folders')
                .select('*')
                .eq('id', id)
                .single();

            if (folderError) {
                toast.error('Could not load folder', toastStyle);
                router.replace('/dashboard/Folders');
                return;
            }

            setCurrentFolder(currentFolder);
            setFolderName(currentFolder?.name || '');
            setPrevFolder(currentFolder?.parent_folder_id ? 'Back' : 'Folders');

            const { data: childFolders, error: childrenError } = await supabase
                .from('folders')
                .select('*')
                .eq('parent_folder_id', id)
                .order('updated_at', { ascending: false });

            if (childrenError) {
                toast.error('Could not load contents', toastStyle);
            } else {
                setFolders(childFolders || []);
            }

            const crumbs = [];
            let folder = currentFolder;

            while (folder?.parent_folder_id) {
                const { data: parent } = await supabase
                    .from('folders')
                    .select('*')
                    .eq('id', folder.parent_folder_id)
                    .single();

                if (!parent) break;
                crumbs.unshift({ id: parent.id, name: parent.name });
                folder = parent;
            }

            setNestedFolderBreadcrumbs(crumbs);
            setLoading(false);
        };

        if (id) fetchFolderAndChildren();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.folder-dropdown-container')) {
                setShowFolderOptionsDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ───  ACTION HANDLERS ─────────────────────────────────────────────────────
    const [showRenameItemModal, setShowRenameItemModal] = useState(false);
    const showRenameFolderModalRef = useRef(null);
    const { rename, isRenaming } = useRenameItem();

    const handleFolderRename = async (newName) => {
        const success = await rename('folder', currentFolder.id, newName);

        if (success) {
            setFolders(prevFolders =>
                prevFolders.map(f =>
                    f.id === currentFolder.id ? { ...f, name: newName } : f
                )
            );

            currentFolder(null);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // ─── RENDER ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <button
                            onClick={() => router.push('/dashboard/Folders')}
                            className="hover:text-[var(--text)] cursor-pointer transition-colors text-lg"
                        >
                            Folders
                        </button>
                        {nestedFolderBreadcrumbs.map(crumb => (
                            <>
                                <ChevronRight size={16} />
                                <button
                                    key={crumb.id}
                                    onClick={() => router.push(`/dashboard/Folders/${crumb.id}`)}
                                    className="hover:text-[var(--text)] cursor-pointer transition-colors text-lg"
                                >
                                    {crumb.name}
                                </button>
                            </>
                        ))}
                        <ChevronRight size={16} />
                        <span className="text-[var(--text)] font-bold text-lg">{folderName}</span>

                        <div className="folder-dropdown-container relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFolderOptionsDropdown(true);
                                }}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                            >
                                <MoreVertical size={18} />
                            </button>

                            <AnimatePresence>
                                {showFolderOptionsDropdown && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-[1px] p-0 md:p-6">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute left-25 top-65 mt-2 w-56 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl py-1.5 z-60 overflow-hidden md:left-40"
                                        >
                                            <a href={`${window.location}`}
                                               target="_blank"
                                               rel="noopener noreferrer">
                                                <button onClick={(e) => {
                                                    e.stopPropagation(); setShowFolderOptionsDropdown(null);
                                                }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer">
                                                    <ExternalLink size={16} /> Open in new tab
                                                </button>
                                            </a>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowRenameItemModal(!showRenameItemModal);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                                            >
                                                <Edit2 size={16} /> Rename
                                            </button>

                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                                            >
                                                <FolderOutput size={16} /> Move to
                                            </button>

                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                                            >
                                                <Copy size={16} /> Duplicate
                                            </button>

                                            <div className="h-px bg-[var(--layer3)] my-1 w-full" />

                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={16} /> Delete folder
                                            </button>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 bg-[var(--nice-blue)] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                {/* Folders Section */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Folders</h2>
                    {folders.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">No folders yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                            {folders.map((folder) => (
                                <motion.div
                                    key={folder.id}
                                    whileHover={{ y: -4 }}
                                    onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />
                                    <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)] group-hover:shadow-md transition-all duration-300">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                                <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                            </div>
                                            <button className="p-1.5 rounded-lg text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-all cursor-pointer">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>

                                        <div className="mt-auto">
                                            <h3 className="font-bold text-[var(--text)] text-base truncate mb-1">
                                                {folder.name || 'Untitled Folder'}
                                            </h3>

                                            <div className="flex items-center justify-between border-t border-[var(--layer3)] pt-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <Clock size={12} />
                                                    {formatDate(folder.updated_at)}
                                                </div>
                                                <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full text-[var(--text-muted)]">
                                                    Folder
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Notes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.filter(i => i.type === 'note').map((note) => (
                            <motion.div
                                key={note.id}
                                whileHover={{ y: -4 }}
                                className="group relative aspect-[4/3] p-5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl cursor-pointer hover:shadow-lg hover:border-[var(--nice-blue)] transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[var(--layer2)] to-[var(--layer3)] border-b border-l border-[var(--layer3)] rounded-bl-xl shadow-sm z-10" />

                                <div className="flex flex-col h-full justify-between relative z-20">
                                    <div className="flex justify-between items-start pr-6">
                                        <div className="p-2 bg-[var(--layer2)] rounded-lg text-[var(--text-muted)] group-hover:text-[var(--nice-blue)] transition-colors">
                                            <FileText size={20} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-[var(--text)] leading-snug mb-1 pr-6">{note.name}</h3>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Edited {note.date}</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--nice-blue)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Flashcards Section */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Flashcards</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.filter(i => i.type === 'flashcard').map((flashcard) => (
                            <motion.div
                                key={flashcard.id}
                                whileHover={{ y: -6 }}
                                className="group relative aspect-[4/3] cursor-pointer"
                            >
                                <div className="absolute -bottom-2 inset-x-4 h-full bg-[var(--layer3)] border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-1" />
                                <div className="absolute -bottom-1 inset-x-2 h-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-0.5" />

                                <div className="relative h-full p-5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl group-hover:border-[var(--nice-blue)] transition-colors shadow-sm z-10 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                            <CreditCard size={20} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-[var(--text)] leading-snug mb-1">{flashcard.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Edited {flashcard.date}</p>
                                            <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full font-bold">
                                                Deck
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Rename Modal */}
                {showRenameItemModal && (
                    <RenameItemModal
                        renameModalRef={showRenameFolderModalRef}
                        currentName={folderName}
                        handleRename={handleFolderRename}
                        setItemName={setFolderName}
                        setShowRenameItemModal={setShowRenameItemModal}
                    />
                )}
            </div>
        </div>
    );
}