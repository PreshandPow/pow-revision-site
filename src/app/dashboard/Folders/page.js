'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Folder, MoreVertical, Plus,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import CreateFolderModal from '../../../components/createFolderModal';
import RenameItemModal from "../../../components/RenameItemModal";
import MoveItemModal from "../../../components/MoveItemModal";
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from '../../hooks/useItemActions';
import { createBrowserClient } from '@supabase/ssr';
import UseItemOptionDropdown from '../../../components/itemOptionsDropdown';
import UseDeleteItemModal from "../../../components/deleteItemModal";

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

    const [selectedItem, setSelectedItem] = useState(null);

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
    const [showItemOptionsDropdown, setShowItemOptionsDropdown] = useState(false);

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
    const showRenameFolderModalRef = useRef(null);

    const { rename, isRenaming } = useRenameItem();

    const handleFolderRename = async (newName) => {
        const success = await rename('folder', selectedItem.id, newName);

        if (success) {
            setFolders(prevFolders =>
                prevFolders.map(f =>
                    f.id === selectedItem.id ? { ...f, name: newName } : f
                )
            );

            setSelectedItem(null);
        }
    };

    // ─── 4. MOVE FOLDER FEATURE ───────────────────────────────────────────────────
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const folderToMoveRef = useRef(null);

    const { moveItem, isMoving } = useMoveItem();

    const handleMove = async (destinationId) => {
        const loadingToast = toast.loading('Moving folder...', toastStyle);
        const success = await moveItem('folder', selectedItem.id, destinationId);
        toast.dismiss(loadingToast);

        if (success) {
            setShowMoveItemModal(false);
            setFolders(prev => prev.filter(f => f.id !== selectedItem.id));
            toast.success('Folder moved successfully', toastStyle);
            setSelectedItem(null);
        }
    };

    // ─── 5. DELETE FOLDER FEATURE ─────────────────────────────────────────────────
    const [folderToDelete, setFolderToDelete] = useState(null);
    const deleteFolderModalRef = useRef(null);

    const { deleteItem, isDeleting } = useDeleteItem();

    const handleDeleteConfirm = async () => {
        const loadingToast = toast.loading('Deleting folder...', toastStyle);
        const success = await deleteItem('folder', folderToDelete.id);
        toast.dismiss(loadingToast);

        if (success) {
            setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
            setFolderToDelete(null);
        }
    };

    // ─── 6. DUPLICATE FOLDER FEATURE ──────────────────────────────────────────────
    const { duplicateItem, isDuplicating } = useDuplicateItem();

    const handleDuplicateFolder = async (folder) => {
        const loadingToast = toast.loading('Duplicating folder...', toastStyle);
        const newFolder = await duplicateItem('folder', folder);
        toast.dismiss(loadingToast);

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
            if (!e.target.closest('.dropdown-container')) setActiveDropdown(null);
            if (showRenameFolderModalRef.current && !showRenameFolderModalRef.current.contains(e.target)) {
                setShowRenameItemModal(false);
            }
            if (folderToMoveRef.current && !folderToMoveRef.current.contains(e.target)) {
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
                <AnimatePresence>
                    {activeDropdown && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setActiveDropdown(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[3px] z-[90]"
                        />
                    )}
                </AnimatePresence>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">Folders</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm">{foldersWithoutParent.length} folder{foldersWithoutParent.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 bg-[var(--nice-blue)] text-white font-bold px-5 py-2.5
                        rounded-xl shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform cursor-pointer"
                    >
                        <Plus size={18} />
                        New folder
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {folders.filter(i => i?.parent_folder_id === null).map(folder => (
                        <motion.div
                            key={folder.id}
                            whileHover={activeDropdown !== folder.id ? { y: -4 } : {}}
                            onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                            className={`group relative cursor-pointer ${activeDropdown === folder.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                        >
                            <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg
                            group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />

                            <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl
                            rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)]
                             group-hover:shadow-md transition-all duration-300">

                                <div className={`flex items-start justify-between mb-3 relative dropdown-container ${activeDropdown === 'header' ? 'z-[100]' : 'z-10'}`}>
                                    <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                        <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === folder.id ? null : folder.id);
                                        }}
                                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]
                                        hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    <AnimatePresence>
                                        {activeDropdown === folder.id && (
                                            <UseItemOptionDropdown
                                                item={folder}
                                                itemType='folder'
                                                setActiveDropdown={setActiveDropdown}
                                                setShowRenameNoteModal={setShowRenameItemModal}
                                                setItemName={setFolderName}
                                                setShowMoveItemModal={setShowMoveItemModal}
                                                setSelectedItem={setSelectedItem}
                                                handleDuplicateNote={handleDuplicateFolder}
                                                setNoteToDelete={setFolderToDelete}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="mt-auto">
                                    <h3 className="font-bold text-[var(--text)] text-base truncate mb-1">
                                        {folder.name || 'Untitled Folder'}
                                    </h3>

                                    <div className="flex items-center justify-between border-t border-[var(--layer3)] pt-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase
                                        tracking-wider text-[var(--text-muted)]">
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
                    {folderToDelete && (
                        <UseDeleteItemModal
                            item={folderToDelete}
                            itemType='folder'
                            deleteItemModalRef={deleteFolderModalRef}
                            handleDeleteConfirm={handleDeleteConfirm}
                            setNoteToDelete={setFolderToDelete}
                        />
                    )}
                    {showRenameItemModal && selectedItem && (
                        <RenameItemModal
                            renameModalRef={showRenameFolderModalRef}
                            currentName={folderName}
                            handleRename={handleFolderRename}
                            setItemName={setFolderName}
                            setShowRenameItemModal={setShowRenameItemModal}
                        />
                    )}
                    {showMoveItemModal && selectedItem && (
                        <MoveItemModal
                            moveModalRef={folderToMoveRef}
                            folders={folders}
                            currentItem={selectedItem}
                            onMove={handleMove}
                            onClose={() => {
                                setShowMoveItemModal(false);
                                setSelectedItem(null);
                            }}
                            itemType={'folder'}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}