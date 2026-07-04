'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Folder, FileText, MoreVertical, Plus, ChevronRight,
    Trash2, Clock, ExternalLink, Edit2, FolderOutput, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import CreateFolderModal from '../../../components/createFolderModal';
import RenameItemModal from "../../../components/RenameItemModal";
import MoveItemModal from "../../../components/MoveItemModal";

import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from '../../hooks/useItemActions';
import { createBrowserClient } from '@supabase/ssr';

function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FolderContentPage() {
    // ─── 1. GLOBAL SETUP & STATES ─────────────────────────────────────────────────
    const supabase = createClient();
    const router = useRouter();

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

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

    // ─── 2. CREATE FOLDER FEATURE ─────────────────────────────────────────────────
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [folderName, setFolderName] = useState('Untitled Folder');
    const createFolderModalRef = useRef(null);

    const handleCreateFolder = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: folder, error } = await supabase
            .from('folders')
            .insert({ name: folderName, user_id: user.id, parent_folder_id: null })
            .select()
            .single();

        if (error) { toast.error('Could not create folder', toastStyle); return; }
        router.push(`/dashboard/Folders/${folder.id}`);
        setShowCreateFolderModal(false);
    };

    // ─── 3. RENAME FOLDER FEATURE ─────────────────────────────────────────────────
    const [showRenameItemModal, setShowRenameItemModal] = useState(false);
    const [folderToRename, setFolderToRename] = useState(null);
    const showRenameFolderModalRef = useRef(null);

    const { rename, isRenaming } = useRenameItem();

    const handleFolderRename = async (newName) => {
        const success = await rename('folder', folderToRename.id, newName);

        if (success) {
            setFolders(prevFolders =>
                prevFolders.map(f =>
                    f.id === folderToRename.id ? { ...f, name: newName } : f
                )
            );

            setFolderToRename(null);
        }
    };

    // ─── 4. MOVE FOLDER FEATURE ───────────────────────────────────────────────────
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const [folderToMove, setFolderToMove] = useState(null);
    const [targetFolder, setTargetFolder] = useState(null);
    const folderToMoveRef = useRef(null);

    const { moveItem, isMoving } = useMoveItem();

    const handleMove = async (destinationId) => {
        const success = await moveItem('folder', folderToMove.id, destinationId);

        if (success) {
            setShowMoveItemModal(false);
            setFolders(prev => prev.filter(f => f.id !== folderToMove.id));
            toast.success('Folder moved successfully', toastStyle);
            setFolderToMove(false);
        }
    };

    // ─── 5. DELETE FOLDER FEATURE ─────────────────────────────────────────────────
    const [folderToDelete, setFolderToDelete] = useState(null);
    const deleteFolderModalRef = useRef(null);

    const { deleteItem, isDeleting } = useDeleteItem();

    const handleDeleteConfirm = async () => {
        const success = await deleteItem('folder', folderToDelete.id);

        if (success) {
            setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
            setFolderToDelete(null);
        }
    };

    // ─── 6. DUPLICATE FOLDER FEATURE ──────────────────────────────────────────────
    const { duplicateItem, isDuplicating } = useDuplicateItem();

    const handleDuplicateFolder = async (folder) => {
        const newFolder = await duplicateItem('folder', folder);

        if (newFolder) {
            setFolders(prev => [newFolder, ...prev]);
            toast.success('Folder duplicated', toastStyle);
        }
    };

    // ─── 7. DATA FETCHING & EFFECTS ───────────────────────────────────────────────
    const fetchFolders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/'); return; }

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) toast.error(error.message, toastStyle);
        else setFolders(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (createFolderModalRef.current && !createFolderModalRef.current.contains(e.target)) {
                setShowCreateFolderModal(false);
            }
            if (!e.target.closest('.folder-dropdown-container')) {
                setActiveDropdown(null);
            }
            if (showRenameFolderModalRef.current && !showRenameFolderModalRef.current.contains(e.target)) {
                setShowRenameItemModal(false);
            }
            if (folderToMove.current && !folderToMoveRef.current.contains(e.target)) {
                setShowMoveItemModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── 8. HELPERS ───────────────────────────────────────────────────────────────
    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const foldersWithoutParent = folders.filter(f => f.parent_folder_id === null);

    // ─── 9. RENDER ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your Folders ready for you
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">Folders</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm">{foldersWithoutParent.length} folder{foldersWithoutParent.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 bg-[var(--nice-blue)] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform cursor-pointer"
                    >
                        <Plus size={18} />
                        New folder
                    </button>
                </div>

                {/* Folders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {folders.filter(i => i?.parent_folder_id === null).map(folder => (
                        <motion.div
                            key={folder.id}
                            whileHover={activeDropdown !== folder.id ? { y: -4 } : {}}
                            onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                            className={`group relative cursor-pointer ${activeDropdown === folder.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                        >
                            <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />

                            <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)] group-hover:shadow-md transition-all duration-300">

                                <div className="flex items-start justify-between mb-3 relative folder-dropdown-container">
                                    <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                        <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === folder.id ? null : folder.id);
                                        }}
                                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    <AnimatePresence>
                                        {activeDropdown === folder.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-10 mt-2 w-56 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl shadow-2xl py-1.5 z-60 overflow-hidden left-25 md:left-40"
                                            >
                                                <a href={`/dashboard/Folders/${folder.id}`} target="_blank" rel="noopener noreferrer">
                                                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer">
                                                        <ExternalLink size={16} /> Open in new tab
                                                    </button>
                                                </a>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowRenameItemModal(!showRenameItemModal);
                                                        setFolderToRename(folder);
                                                        setFolderName(folder.name);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                                                >
                                                    <Edit2 size={16} /> Rename
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFolderToMove(folder);
                                                        setShowMoveItemModal(true);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer2)] transition-colors cursor-pointer"
                                                >
                                                    <FolderOutput size={16} /> Move to
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDuplicateFolder(folder);
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
                                                        setFolderToDelete(folder);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 size={16} /> Delete folder
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {showCreateFolderModal && (
                        <CreateFolderModal
                            createFolderModalRef={createFolderModalRef}
                            setShowCreateFolderModal={setShowCreateFolderModal}
                            setFolderName={setFolderName}
                            handleCreateFolder={handleCreateFolder}
                        />
                    )}

                    {folderToDelete && (
                        <div ref={deleteFolderModalRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
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
                                    <h2 className="text-xl font-bold text-[var(--text)] tracking-tight mb-2">Delete folder?</h2>
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                        Are you sure you want to delete this folder? All contents inside will be safe. This action cannot be undone.
                                    </p>
                                </div>

                                <div className="px-6 py-4 bg-[var(--layer2)]/50 border-t border-[var(--layer3)] flex items-center justify-end gap-3">
                                    <button onClick={() => setFolderToDelete(null)} className="px-4 py-2 text-sm font-semibold rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95 transition-all cursor-pointer">
                                        Yes, delete folder
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showRenameItemModal && (
                        <RenameItemModal
                            renameModalRef={showRenameFolderModalRef}
                            currentName={folderName}
                            handleRename={handleFolderRename}
                            setItemName={setFolderName}
                            setShowRenameItemModal={setShowRenameItemModal}
                        />
                    )}

                    {showMoveItemModal && folderToMove && (
                        <MoveItemModal
                            moveModalRef={folderToMoveRef}
                            folders={folders}
                            currentItem={folderToMove}
                            onMove={handleMove}
                            targetFolder={targetFolder}
                            setTargetFolder={setTargetFolder}
                            onClose={() => {
                                setShowMoveItemModal(false);
                                setFolderToMove(null);
                            }}
                            itemType={'folder'}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}