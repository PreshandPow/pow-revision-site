'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, FileText, Clock, Trash2, MoreVertical, ExternalLink, Edit2, FolderOutput, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from "framer-motion";

import RenameItemModal from "../../../components/RenameItemModal";
import MoveItemModal from "../../../components/MoveItemModal";
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from '../../hooks/useItemActions';
import UseItemOptionDropdown from '../../../components/itemOptionsDropdown';
import UseDeleteItemModal from "../../../components/deleteItemModal";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function NotesPage() {
    // ─── 1. GLOBAL SETUP & STATES ─────────────────────────────────────────────────
    const router = useRouter();
    const supabase = createClient();

    const [notes, setNotes] = useState([]);
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

    // ─── 2. CREATE NOTE FEATURE ───────────────────────────────────────────────────
    const handleCreateNote = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: note, error } = await supabase
            .from('notes')
            .insert({ user_id: user.id, title: 'Untitled', content: '' })
            .select()
            .single();

        if (error) { toast.error('Could not create note', toastStyle); return; }
        router.push(`/dashboard/Notes/${note.id}`);
    };

    // ─── 3. RENAME NOTE FEATURE ───────────────────────────────────────────────────
    const [showRenameNoteModal, setShowRenameNoteModal] = useState(false);
    const [noteName, setNoteName] = useState('Untitled Note');
    const showRenameNoteModalRef = useRef(null);

    const { rename, isRenaming } = useRenameItem();

    const handleNoteRename = async (newName) => {
        const success = await rename('note', selectedItem.id, newName);

        if (success) {
            setNotes(prevNotes =>
                prevNotes.map(n =>
                    n.id === selectedItem.id ? { ...n, title: newName } : n
                )
            );
            selectedItem(null);
        }
    };

    // ─── 4. MOVE NOTE FEATURE ─────────────────────────────────────────────────────
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const itemToMoveRef = useRef(null);

    const { moveItem, isMoving } = useMoveItem();

    const handleMove = async (destinationId) => {
        const loadingToast = toast.loading('Moving note...', toastStyle);
        const success = await moveItem('note', selectedItem.id, destinationId);
        toast.dismiss(loadingToast);

        if (success) {
            setShowMoveItemModal(false);
            setFolders(prev => prev.filter(n => n.id !== selectedItem.id));
            toast.success('Folder moved successfully', toastStyle);
            setSelectedItem(false);
        }
    }

    // ─── 5. DELETE NOTE FEATURE ───────────────────────────────────────────────────
    const [noteToDelete, setNoteToDelete] = useState(null);
    const deleteNoteModalRef = useRef(null);

    const { deleteItem, issDeleting } = useDeleteItem();

    const handleDeleteConfirm = async () => {
        const loadingToast = toast.loading('Deleting note...', toastStyle);
        const success = await deleteItem('note', noteToDelete.id);
        toast.dismiss(loadingToast);

        if (success) {
            setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
            setNoteToDelete(null);
        }
    };

    // ─── 6. DUPLICATE NOTE FEATURE ────────────────────────────────────────────────
    const { duplicateItem, isDuplicating } = useDuplicateItem();

    const handleDuplicateNote = async (note) => {
        const loadingToast = toast.loading('Duplicating note...', toastStyle);
        const newNote = await duplicateItem('note', note);
        toast.dismiss(loadingToast);

        if (newNote) {
            setNotes(prev => [newNote, ...prev]);
            toast.success('Note duplicated', toastStyle);
        }
    };

    // ─── 7. DATA FETCHING & EFFECTS ───────────────────────────────────────────────
    useEffect(() => {
        const fetchAllData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace('/'); return; }

            // Using Promise.all to fetch notes and folders simultaneously (prevents UI race conditions)
            const [notesResponse, foldersResponse] = await Promise.all([
                supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
                supabase.from('folders').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
            ]);

            if (notesResponse.error) {
                toast.error(notesResponse.error.message, toastStyle);
            } else {
                setNotes(notesResponse.data || []);
            }

            if (foldersResponse.error) {
                toast.error(foldersResponse.error.message, toastStyle);
            } else {
                setFolders(foldersResponse.data || []);
            }

            setLoading(false);
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.folder-dropdown-container')) {
                setActiveDropdown(null);
            }
            if (showRenameNoteModalRef.current && !showRenameNoteModalRef.current.contains(e.target)) {
                setShowRenameNoteModal(false);
            }
            if (itemToMoveRef.current && !itemToMoveRef.current.contains(e.target)) {
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

    const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '');
    };

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
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your notes for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--layer2)] p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">Notes</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={handleCreateNote}
                        className="flex items-center gap-2 bg-[var(--nice-blue)] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform cursor-pointer"
                    >
                        <Plus size={18} />
                        New note
                    </button>
                </div>

                {/* Empty State */}
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--layer1)] border border-[var(--layer3)] flex items-center justify-center">
                            <FileText size={28} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text)] font-bold text-lg">No notes yet</p>
                        <p className="text-[var(--text-muted)] text-sm">Create your first note to get started.</p>
                        <button
                            onClick={handleCreateNote}
                            className="flex items-center gap-2 border border-[var(--layer3)] text-[var(--text)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--layer1)] transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                            Create note
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Note Cards */}
                        {notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => router.push(`/dashboard/Notes/${note.id}`)}
                                className={`group relative bg-[var(--layer1)] border border-[var(--layer3)] 
                                        rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-colors duration-200
                                        ${activeDropdown === note.id ? 'z-[100] border-[var(--nice-blue)]' : 'z-10 hover:border-[var(--nice-blue)]'}`}
                            >
                                <div className="flex items-start justify-between gap-2 folder-dropdown-container">
                                    <p className="font-bold text-[var(--text)] truncate flex-1">{note.title || 'Untitled'}</p>

                                    {/* Dropdown Trigger */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(note);
                                            setActiveDropdown(activeDropdown === note.id ? null : note.id);
                                        }}
                                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeDropdown === note.id && (
                                        <UseItemOptionDropdown
                                            item={note}
                                            itemType='note'
                                            setActiveDropdown={setActiveDropdown}
                                            setShowRenameNoteModal={setShowRenameNoteModal}
                                            setItemName={setNoteName}
                                            setShowMoveItemModal={setShowMoveItemModal}
                                            handleDuplicateNote={handleDuplicateNote}
                                            setNoteToDelete={setNoteToDelete}
                                        />
                                    )}
                                </div>

                                <p className="text-sm text-[var(--text-muted)] line-clamp-2 flex-1">
                                    {stripHtml(note.content) || 'No content yet...'}
                                </p>

                                {note.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {note.tags.map(tag => (
                                            <span key={tag} className="text-xs font-semibold bg-[var(--layer2)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--layer3)] pt-3 mt-auto">
                                    <Clock size={12} />
                                    {formatDate(note.updated_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {/* Delete Modal */}
                    {noteToDelete && (
                        <UseDeleteItemModal
                            item={selectedItem}
                            itemType='note'
                            deleteItemModalRef={deleteNoteModalRef}
                            handleDeleteConfirm={handleDeleteConfirm}
                            setNoteToDelete={setNoteToDelete}
                        />
                    )}

                    {/* Rename Modal */}
                    {showRenameNoteModal && (
                        <RenameItemModal
                            renameModalRef={showRenameNoteModalRef}
                            currentName={noteName}
                            handleRename={handleNoteRename}
                            setItemName={setNoteName}
                            setShowRenameItemModal={setShowRenameNoteModal}
                        />
                    )}

                    {/* Move Modal */}
                    {showMoveItemModal && selectedItem && (
                        <MoveItemModal
                            moveModalRef={itemToMoveRef}
                            folders={folders}
                            currentItem={selectedItem}
                            onMove={handleMove}
                            onClose={() => {
                                setShowMoveItemModal(false);
                                setSelectedItem(null);
                            }}
                            itemType={'note'}
                        />
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}