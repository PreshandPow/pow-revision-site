'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Folder, FileText, MoreVertical, Plus,
    CreditCard, Clock
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from "react-hot-toast";

// Components
import RenameItemModal from "../../../components/RenameItemModal";
import MoveItemModal from "../../../components/MoveItemModal";
import UseDeleteItemModal from "../../../components/deleteItemModal";
import UseItemOptionDropdown from "../../../components/itemOptionsDropdown";
import CreateModal from '../../../components/CreateModal';
import CreateFolderModal from '../../../components/createFolderModal';

// Hooks
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from "../../hooks/useItemActions";
import { createNoteAction, createFolderAction } from "../../hooks/createItemActions";

// ─── 1. SUPABASE CLIENT ───────────────────────────────────────────────────────
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function MaterialsPage() {
    // ─── 2. GLOBAL SETUP & STATES ───────────────────────────────────────────────
    const router = useRouter();
    const supabase = createClient();

    // Data States
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [flashcards, setFlashcards] = useState([]);

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
        { id: 6, name: 'Spanish Vocab', type: 'flashcard', date: 'Jun 22' },
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
    const { rename } = useRenameItem();
    const { moveItem } = useMoveItem();
    const { deleteItem } = useDeleteItem();
    const { duplicateItem } = useDuplicateItem();

    // ─── 4. LIFECYCLE EFFECTS ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchAllMaterials = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/');
                return;
            }

            // Fetch ALL folders and notes for this user
            const [foldersRes, notesRes] = await Promise.all([
                supabase
                    .from('folders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false }),
                supabase
                    .from('notes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
            ]);

            if (foldersRes.error) toast.error('Error fetching folders', toastStyle);
            else setFolders(foldersRes.data || []);

            if (notesRes.error) toast.error('Error fetching notes', toastStyle);
            else setNotes(notesRes.data || []);

            setLoading(false);
        };

        fetchAllMaterials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            if (isNote) {
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
            // Even if we move it to a specific folder, can be kept visible on the "All Materials" page
            // so we don't need to filter it out of the array here!
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

    // Note: Passing null as folderId so it gets created at the root level!
    const handleCreateNoteInRoot = async () => {
        const newNote = await createNoteAction(null, router);
        if (newNote) setNotes(prev => [newNote, ...prev]);
        setShowCreateItemModal(false);
    };

    const handleCreateFolderInRoot = async () => {
        const newFolder = await createFolderAction(newFolderName, null, router);
        if (newFolder) setFolders(prev => [newFolder, ...prev]);
        setShowCreateFolderModal(false);
        setNewFolderName('');
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // ─── 6. RENDER ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse
            shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your Materials ready
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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">Materials</h1>
                        <p className="text-[var(--vanilla-cream)] mt-1 text-sm">Everything you have created all in one place.</p>
                    </div>

                    <button
                        onClick={() => {
                            setActiveTaskModal('notes');
                            setShowCreateItemModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-[var(--nice-blue)]
                        text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit cursor-pointer">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                {/* ─── FOLDERS SECTION ─── */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Folders</h2>
                    {folders.length === 0 ? (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-[var(--layer3)] rounded-2xl bg-[var(--layer1)]/30 text-center">
                            <p className="text-sm font-medium text-[var(--text-muted)]">No Folders yet.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* 1. Updated Container: 2-Rows, Column Flow, Right Padding added */}
                            <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-6 pt-2 pb-64 -mb-60
                            overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]
                            [scrollbar-width:none] pr-24">
                                {folders.map((folder) => (
                                    <motion.div
                                        key={folder.id}
                                        whileHover={activeDropdown !== folder.id ? { y: -4 } : {}}
                                        onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                                        className={`w-[85vw] sm:w-[320px] shrink-0 snap-start group relative cursor-pointer
                                         ${activeDropdown === folder.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                                    >
                                        <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg
                                            group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />
                                        <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl
                                            rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)]
                                            group-hover:shadow-md transition-all duration-300">

                                            <div className="flex items-start justify-between mb-3 relative dropdown-container">
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

                                                <div className="flex items-center justify-between border-t border-[var(--layer3)]
                                            pt-3 mt-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase
                                                tracking-wider text-[var(--text-muted)]">
                                                        <Clock size={12} />
                                                        {formatDate(folder.updated_at)}
                                                    </div>
                                                    <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full
                                                text-[var(--text-muted)] font-semibold">
                                                    Folder
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {folders.length > 2 && (
                                <div className="absolute right-0 top-0 bottom-[15rem] w-24 bg-gradient-to-l
                                from-[var(--layer1)] to-transparent pointer-events-none z-30" />
                            )}
                        </div>
                    )}
                </div>

                {/* ─── NOTES SECTION ─── */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Notes</h2>
                    {notes.length === 0 ? (
                        <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-[var(--layer3)] rounded-2xl bg-[var(--layer1)]/30 text-center">
                            <p className="text-sm font-medium text-[var(--text-muted)]">No notes yet.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-6 pt-2 pb-64 -mb-60
                            overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]
                            [scrollbar-width:none] pr-24">
                                {notes.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        whileHover={activeDropdown !== note.id ? { y: -4 } : {}}
                                        onClick={() => router.push(`/dashboard/Notes/${note.id}`)}
                                        className={`w-[85vw] sm:w-[320px] shrink-0 snap-start group relative flex flex-col 
                                        cursor-pointer ${activeDropdown === note.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                                    >
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[var(--layer1)]
                                            to-[var(--layer2)] border-b border-l border-[var(--layer3)] rounded-bl-xl z-10
                                            group-hover:border-[var(--nice-blue)] group-hover:from-[var(--nice-blue)]/10
                                            transition-all duration-300" />
                                        <div className="relative bg-[var(--layer2)] border border-[var(--layer3)]
                                        rounded-xl p-4 flex flex-col h-full min-h-[100px] max-h-[200px] shadow-sm
                                        group-hover:border-[var(--nice-blue)]
                                         group-hover:shadow-md transition-all duration-300">
                                            <div className="flex items-start justify-between mb-2 pr-6 relative dropdown-container">
                                                <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                                    <FileText size={20} />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === note.id ? null : note.id);
                                                    }}
                                                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]
                                                hover:bg-[var(--layer3)] transition-colors cursor-pointer"
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

                                            <div className="flex-1 flex flex-col min-h-0">
                                                <h3 className="font-bold text-[var(--text)] text-base line-clamp-2 mb-2 pr-4
                                            leading-tight shrink-0">
                                                    {note.title || 'Untitled Note'}
                                                </h3>
                                                <div className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4 flex-1
                                            leading-relaxed overflow-hidden break-words">
                                                    {note.content
                                                        ? (
                                                            note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90)
                                                            + (note.content.length > 90 ? '...' : '')
                                                        )
                                                        : 'Start writing...'}
                                                </div>

                                                <div className="flex items-center justify-between border-t border-[var(--layer3)] pt-3 mt-auto">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase
                                                tracking-wider text-[var(--text-muted)]">
                                                        <Clock size={12} />
                                                        {formatDate(note.updated_at)}
                                                    </div>
                                                    <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full
                                                text-[var(--text-muted)] font-semibold">
                                                    Note
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {notes.length > 2 && (
                                <div className="absolute right-0 top-0 bottom-[15rem] w-24 bg-gradient-to-l
                                from-[var(--layer1)] to-transparent pointer-events-none z-30" />
                            )}
                        </div>
                    )}
                </div>

                {/* ─── FLASHCARDS SECTION ─── */}
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Flashcards</h2>
                    <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-6 pt-2 pb-64 -mb-60 overflow-x-auto
                    snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-24">
                        {items.filter(i => i.type === 'flashcard').map((flashcard) => (
                            <motion.div
                                key={flashcard.id}
                                whileHover={{ y: -6 }}
                                className="min-w-[85vw] sm:min-w-[320px] shrink-0 snap-start group relative aspect-[4/3] cursor-pointer"
                            >
                                <div className="absolute -bottom-2 inset-x-4 h-full bg-[var(--layer3)]
                                border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-1" />
                                <div className="absolute -bottom-1 inset-x-2 h-full bg-[var(--layer2)]
                                border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-0.5" />

                                <div className="relative h-full p-5 bg-[var(--layer1)] border border-[var(--layer3)]
                                rounded-xl group-hover:border-[var(--nice-blue)] transition-colors shadow-sm z-10 flex
                                flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                            <CreditCard size={20} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-[var(--text)] leading-snug mb-1">{flashcard.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase
                                            tracking-tight">Edited {flashcard.date}</p>
                                            <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2
                                            py-0.5 rounded-full font-bold">
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
                            handleCreateNote={handleCreateNoteInRoot}
                            handleCreateFolder={handleCreateFolderInRoot}
                            setShowCreateFolderModal={setShowCreateFolderModal}
                        />
                    )}

                    {showCreateFolderModal && (
                        <CreateFolderModal
                            createFolderModalRef={createFolderModalRef}
                            setShowCreateFolderModal={setShowCreateFolderModal}
                            folderName={newFolderName}
                            setFolderName={setNewFolderName}
                            handleCreateFolder={handleCreateFolderInRoot}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}