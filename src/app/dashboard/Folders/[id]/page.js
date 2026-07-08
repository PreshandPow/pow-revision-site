'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Folder, FileText, MoreVertical, Plus, ChevronRight,
    CreditCard, Clock
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from "react-hot-toast";

// Components
import RenameItemModal from "../../../../components/RenameItemModal";
import MoveItemModal from "../../../../components/MoveItemModal";
import UseDeleteItemModal from "../../../../components/deleteItemModal";
import UseItemOptionDropdown from "../../../../components/itemOptionsDropdown";
import CreateModal from '../../../../components/CreateModal';
import CreateFolderModal from "../../../../components/createFolderModal";

// Hooks
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from "../../../hooks/useItemActions";
import { createNoteAction, createFolderAction } from "../../../hooks/createItemActions";

// ─── 1. SUPABASE CLIENT ───────────────────────────────────────────────────────
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FolderContentPage() {
    // ─── 2. GLOBAL SETUP & STATES ───────────────────────────────────────────────
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    // Data States
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [nestedFolderBreadcrumbs, setNestedFolderBreadcrumbs] = useState([]);

    // UI & Action States
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemNameInput, setItemNameInput] = useState('');

    // Modal States
    const [showRenameItemModal, setShowRenameItemModal] = useState(false);
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showCreateItemModal, setShowCreateItemModal] = useState(false);
    const [activeTaskModal, setActiveTaskModal] = useState(null);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Refs
    const renameModalRef = useRef(null);
    const moveModalRef = useRef(null);
    const deleteModalRef = useRef(null);
    const createFolderModalRef = useRef(null);

    // Temporary mock items for Flashcards
    const [items] = useState([
        { id: 5, name: 'Calculus Definitions', type: 'flashcard', date: 'May 10' },
    ]);

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
        },
        iconTheme: { primary: 'var(--nice-blue)', secondary: '#FFFAEE' },
    };

    // ─── 3. ACTION HOOKS ────────────────────────────────────────────────────────
    const { rename, isRenaming } = useRenameItem();
    const { moveItem, isMoving } = useMoveItem();
    const { deleteItem, isDeleting } = useDeleteItem();
    const { duplicateItem, isDuplicating } = useDuplicateItem();

    // ─── 4. LIFECYCLE EFFECTS ───────────────────────────────────────────────────
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

            const { data: childFolders, error: childrenError } = await supabase
                .from('folders')
                .select('*')
                .eq('parent_folder_id', id)
                .order('updated_at', { ascending: false });

            if (!childrenError) setFolders(childFolders || []);

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
        };

        const fetchNotes = async () => {
            const { data: notes, error } = await supabase
                .from('notes')
                .select('*')
                .eq('folder_id', id)
                .order('updated_at', { ascending: false });

            if (!error) setNotes(notes || []);
        };

        const init = async () => {
            if (id) {
                await Promise.all([fetchFolderAndChildren(), fetchNotes()]);
                setLoading(false);
            }
        };

        init();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.dropdown-container')) setActiveDropdown(null);
            if (renameModalRef.current && !renameModalRef.current.contains(e.target)) setShowRenameItemModal(false);
            if (moveModalRef.current && !moveModalRef.current.contains(e.target)) setShowMoveItemModal(false);
            if (createFolderModalRef.current && !createFolderModalRef.current.contains(e.target)) setShowCreateFolderModal(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── 5. SMART ACTION HANDLERS ───────────────────────────────────────────────

    const handleRenameConfirm = async (newName) => {
        const isNote = selectedItem.title !== undefined;
        const itemType = isNote ? 'note' : 'folder';

        const success = await rename(itemType, selectedItem.id, newName);

        if (success) {
            if (selectedItem.id === currentFolder?.id) {
                setCurrentFolder({ ...currentFolder, name: newName });
            } else if (isNote) {
                setNotes(prev => prev.map(n => n.id === selectedItem.id ? { ...n, title: newName } : n));
            } else {
                setFolders(prev => prev.map(f => f.id === selectedItem.id ? { ...f, name: newName } : f));
            }
            setSelectedItem(null);
        }
    };

    const handleMoveConfirm = async (destinationId) => {
        const isNote = selectedItem.title !== undefined;
        const itemType = isNote ? 'note' : 'folder';

        const loadingToast = toast.loading(`Moving ${itemType}...`, toastStyle);
        const success = await moveItem(itemType, selectedItem.id, destinationId);
        toast.dismiss(loadingToast);

        if (success) {
            setShowMoveItemModal(false);
            if (isNote) {
                setNotes(prev => prev.filter(n => n.id !== selectedItem.id));
            } else {
                setFolders(prev => prev.filter(f => f.id !== selectedItem.id));
            }
            toast.success(`${itemType} moved successfully`, toastStyle);
            setSelectedItem(null);
        }
    };

    const handleDeleteConfirm = async () => {
        const isNote = itemToDelete.title !== undefined;
        const itemType = isNote ? 'note' : 'folder';

        const loadingToast = toast.loading(`Deleting ${itemType}...`, toastStyle);
        const success = await deleteItem(itemType, itemToDelete.id);
        toast.dismiss(loadingToast);

        if (success) {
            if (isNote) {
                setNotes(prev => prev.filter(n => n.id !== itemToDelete.id));
            } else {
                setFolders(prev => prev.filter(f => f.id !== itemToDelete.id));
            }
            setItemToDelete(null);
        }
    };

    const handleDuplicateConfirm = async (itemToDuplicate) => {
        const isNote = itemToDuplicate.title !== undefined;
        const itemType = isNote ? 'note' : 'folder';

        const loadingToast = toast.loading(`Duplicating ${itemType}...`, toastStyle);
        const newItem = await duplicateItem(itemType, itemToDuplicate);
        toast.dismiss(loadingToast);

        if (newItem) {
            if (isNote) {
                setNotes(prev => [newItem, ...prev]);
            } else {
                setFolders(prev => [newItem, ...prev]);
            }
            toast.success(`${itemType} duplicated`, toastStyle);
        }
    };

    const handleCreateNoteInFolder = async () => {
        const newNote = await createNoteAction(id, router);
        if (newNote) {
            setNotes(prev => [newNote, ...prev]);
        }
        setShowCreateItemModal(false);
    };

    const handleCreateFolderInFolder = async () => {
        const newFolder = await createFolderAction(newFolderName, id, router);
        if (newFolder) {
            setFolders(prev => [newFolder, ...prev]);
        }
        setShowCreateFolderModal(false);
        setNewFolderName('');
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // ─── 6. RENDER ──────────────────────────────────────────────────────────────
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
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] flex-wrap">
                        <button onClick={() => router.push('/dashboard/Folders')} className="hover:text-[var(--text)] cursor-pointer transition-colors text-lg">
                            Folders
                        </button>
                        {nestedFolderBreadcrumbs.map(crumb => (
                            <div key={crumb.id} className="flex items-center gap-2">
                                <ChevronRight size={16} />
                                <button onClick={() => router.push(`/dashboard/Folders/${crumb.id}`)} className="hover:text-[var(--text)] cursor-pointer transition-colors text-lg">
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                        <ChevronRight size={16} />
                        <span className="text-[var(--text)] font-bold text-lg">{currentFolder?.name}</span>

                        <div className={`dropdown-container relative ml-2 ${activeDropdown === 'header' ? 'z-[100]' : 'z-10'}`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === 'header' ? null : 'header');
                                }}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                            >
                                <MoreVertical size={18} />
                            </button>

                            <AnimatePresence>
                                {activeDropdown === 'header' && (
                                    <UseItemOptionDropdown
                                        item={currentFolder}
                                        itemType='folder'
                                        setActiveDropdown={setActiveDropdown}
                                        setShowRenameNoteModal={setShowRenameItemModal}
                                        setItemName={setItemNameInput}
                                        setSelectedItem={setSelectedItem}
                                        setShowMoveItemModal={setShowMoveItemModal}
                                        handleDuplicateNote={handleDuplicateConfirm}
                                        setNoteToDelete={setItemToDelete}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setActiveTaskModal('folders');
                            setShowCreateItemModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-[var(--nice-blue)]
                        text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit cursor-pointer">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Folders</h2>
                    {folders.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">No folders yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                            {folders.map((folder) => (
                                <motion.div
                                    key={folder.id}
                                    whileHover={activeDropdown !== folder.id ? { y: -4 } : {}}
                                    onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                                    className={`group relative cursor-pointer ${activeDropdown === folder.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                                >
                                    <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />
                                    <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)] group-hover:shadow-md transition-all duration-300">

                                        <div className={`flex items-start justify-between mb-3 relative dropdown-container ${activeDropdown === 'header' ? 'z-[100]' : 'z-10'}`}>
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
                                                    <UseItemOptionDropdown
                                                        item={folder}
                                                        itemType='folder'
                                                        setActiveDropdown={setActiveDropdown}
                                                        setShowRenameNoteModal={setShowRenameItemModal}
                                                        setItemName={setItemNameInput}
                                                        setSelectedItem={setSelectedItem}
                                                        setShowMoveItemModal={setShowMoveItemModal}
                                                        handleDuplicateNote={handleDuplicateConfirm}
                                                        setNoteToDelete={setItemToDelete}
                                                    />
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
                                                <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full text-[var(--text-muted)] font-semibold">
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

                {/* Notes */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Notes</h2>
                    {notes.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">No notes yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    whileHover={activeDropdown !== note.id ? { y: -4 } : {}}
                                    onClick={() => router.push(`/dashboard/Notes/${note.id}`)}
                                    className={`group relative cursor-pointer flex flex-col ${activeDropdown === note.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                                >
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[var(--layer1)] to-[var(--layer2)] border-b border-l border-[var(--layer3)] rounded-bl-xl z-10 group-hover:border-[var(--nice-blue)] group-hover:from-[var(--nice-blue)]/10 transition-all duration-300" />

                                    <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl p-5 flex flex-col h-full min-h-[160px] shadow-sm group-hover:border-[var(--nice-blue)] group-hover:shadow-md transition-all duration-300">
                                        <div className={`flex items-start justify-between mb-4 pr-6 relative dropdown-container ${activeDropdown === 'header' ? 'z-[100]' : 'z-10'}`}>
                                            <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                                <FileText size={20} />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === note.id ? null : note.id);
                                                }}
                                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {activeDropdown === note.id && (
                                                    <UseItemOptionDropdown
                                                        item={note}
                                                        itemType='note'
                                                        setActiveDropdown={setActiveDropdown}
                                                        setShowRenameNoteModal={setShowRenameItemModal}
                                                        setItemName={setItemNameInput}
                                                        setSelectedItem={setSelectedItem}
                                                        setShowMoveItemModal={setShowMoveItemModal}
                                                        handleDuplicateNote={handleDuplicateConfirm}
                                                        setNoteToDelete={setItemToDelete}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <h3 className="font-bold text-[var(--text)] text-base line-clamp-2 mb-2 pr-4 leading-tight">
                                                {note.title || 'Untitled Note'}
                                            </h3>
                                            <div className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4 flex-1 leading-relaxed">
                                                {note.content?.replace(/<[^>]*>/g, '') || 'Start writing...'}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-[var(--layer3)] pt-3 mt-auto">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <Clock size={12} />
                                                    {formatDate(note.updated_at)}
                                                </div>
                                                <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full text-[var(--text-muted)] font-semibold">
                                                    Note
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Flashcards */}
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

                {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {itemToDelete && (
                        <UseDeleteItemModal
                            item={itemToDelete}
                            itemType={itemToDelete.title !== undefined ? 'note' : 'folder'}
                            deleteItemModalRef={deleteModalRef}
                            handleDeleteConfirm={handleDeleteConfirm}
                            setNoteToDelete={setItemToDelete}
                        />
                    )}

                    {showRenameItemModal && selectedItem && (
                        <RenameItemModal
                            renameModalRef={renameModalRef}
                            currentName={itemNameInput}
                            handleRename={handleRenameConfirm}
                            setItemName={setItemNameInput}
                            setShowRenameItemModal={setShowRenameItemModal}
                        />
                    )}

                    {showMoveItemModal && selectedItem && (
                        <MoveItemModal
                            moveModalRef={moveModalRef}
                            folders={folders}
                            currentItem={selectedItem}
                            onMove={handleMoveConfirm}
                            onClose={() => {
                                setShowMoveItemModal(false);
                                setSelectedItem(null);
                            }}
                            itemType={selectedItem.title !== undefined ? 'note' : 'folder'}
                        />
                    )}
                    {showCreateItemModal && (
                        <CreateModal
                            setOpenCreateModal={setShowCreateItemModal}
                            activeTaskModal={activeTaskModal}
                            setActiveTaskModal={setActiveTaskModal}
                            handleCreateNote={handleCreateNoteInFolder}
                            handleCreateFolder={handleCreateFolderInFolder}
                            setShowCreateFolderModal={setShowCreateFolderModal}
                        />
                    )}
                    {showCreateFolderModal && (
                        <CreateFolderModal
                            createFolderModalRef={createFolderModalRef}
                            setShowCreateFolderModal={setShowCreateFolderModal}
                            folderName={newFolderName}
                            setFolderName={setNewFolderName}
                            handleCreateFolder={handleCreateFolderInFolder}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}