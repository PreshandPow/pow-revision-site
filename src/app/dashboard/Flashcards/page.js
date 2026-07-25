'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard, MoreVertical, Plus, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from "react-hot-toast";

// Components
import RenameItemModal from "../../../components/RenameItemModal";
import MoveItemModal from "../../../components/MoveItemModal";
import UseDeleteItemModal from "../../../components/deleteItemModal";
import UseItemOptionDropdown from "../../../components/itemOptionsDropdown";
import CreateFlashcardModal from '../../../components/createFlashcardModal';

// Hooks
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from "../../hooks/useItemActions";
import { createFlashcardAction } from '../../hooks/createItemActions';


export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FlashcardsMainPage() {
    // ─── 1. GLOBAL SETUP & STATES ───────────────────────────────────────────────
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [flashcards, setFlashcards] = useState([]);
    const [folders, setFolders] = useState([]);

    // UI & Action States
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemNameInput, setItemNameInput] = useState('');

    // Modal States
    const [showRenameItemModal, setShowRenameItemModal] = useState(false);
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showCreateFlashcardModal, setShowCreateFlashcardModal] = useState(false);

    // Refs
    const renameModalRef = useRef(null);
    const moveModalRef = useRef(null);
    const deleteModalRef = useRef(null);

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
        },
        iconTheme: { primary: 'var(--nice-blue)', secondary: '#FFFAEE' },
    };

    // ─── 2. ACTION HOOKS ────────────────────────────────────────────────────────
    const { rename } = useRenameItem();
    const { moveItem } = useMoveItem();
    const { deleteItem } = useDeleteItem();
    const { duplicateItem } = useDuplicateItem();

    // ─── 3. DATA FETCHING & EFFECTS ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchAllData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace('/'); return; }

            const [flashcardDecksResponse, foldersResponse] = await Promise.all([
                supabase
                    .from('flashcard_decks')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false }),
                supabase
                    .from('folders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
            ]);

            if (flashcardDecksResponse.error) {
                toast.error(flashcardDecksResponse.error.message, toastStyle);
            } else {
                setFlashcards(flashcardDecksResponse.data || []);
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
            if (!e.target.closest('.dropdown-container')) setActiveDropdown(null);
            if (renameModalRef.current && !renameModalRef.current.contains(e.target)) setShowRenameItemModal(false);
            if (moveModalRef.current && !moveModalRef.current.contains(e.target)) setShowMoveItemModal(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── 4. SMART ACTION HANDLERS ───────────────────────────────────────────────
    const handleRenameConfirm = async (newName) => {
        const success = await rename('flashcard', selectedItem.id, newName);
        if (success) {
            setFlashcards(prev => prev.map(f => f.id === selectedItem.id ? { ...f, name: newName } : f));
            setSelectedItem(null);
        }
    };

    const handleMoveConfirm = async (destinationId) => {
        const loadingToast = toast.loading(`Moving deck...`, toastStyle);
        const success = await moveItem('flashcard', selectedItem.id, destinationId);
        toast.dismiss(loadingToast);

        if (success) {
            setShowMoveItemModal(false);
            toast.success(`Deck moved successfully`, toastStyle);
            setSelectedItem(null);
        }
    };

    const handleDeleteConfirm = async () => {
        const loadingToast = toast.loading(`Deleting deck...`, toastStyle);
        const success = await deleteItem('flashcard', itemToDelete.id);
        toast.dismiss(loadingToast);

        if (success) {
            setFlashcards(prev => prev.filter(f => f.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    const handleDuplicateConfirm = async (itemToDuplicate) => {
        const loadingToast = toast.loading(`Duplicating deck...`, toastStyle);
        const newItem = await duplicateItem('flashcard', itemToDuplicate);
        toast.dismiss(loadingToast);

        if (newItem) {
            setFlashcards(prev => [newItem, ...prev]);
            toast.success(`Deck duplicated`, toastStyle);
        }
    };

    const handleCreateFlashcardDeck = async (deckData) => {
        const loadingToast = toast.loading('Creating deck...');

        const newDeck = await createFlashcardAction(deckData, null, router);

        toast.dismiss(loadingToast);

        if (newDeck) {
            setShowCreateFlashcardModal(false);
            setFlashcards(prev => [newDeck, ...prev]);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // ─── 5. RENDER ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your Decks ready
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
                        <h1 className="text-3xl font-bold text-[var(--text)]">Flashcards</h1>
                        <p className="text-[var(--vanilla-cream)] mt-1 text-sm">{flashcards.length} deck{flashcards.length !== 1 ? 's' : ''}</p>
                    </div>

                    <button
                        onClick={() => {
                            setShowCreateFlashcardModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-[var(--nice-blue)] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit cursor-pointer">
                        <Plus size={18} />
                        New Deck
                    </button>
                </div>

                {/* ─── FLASHCARDS GRID ─── */}
                {flashcards.length === 0 ? (
                    <p className="text-sm text-[var(--vanilla-cream)]">No decks yet. Create one to get started!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                        {flashcards.map((deck) => (
                            <motion.div
                                key={deck.id}
                                whileHover={activeDropdown !== deck.id ? { y: -4 } : {}}
                                onClick={() => router.push(`/dashboard/Flashcards/${deck.id}`)}
                                className={`group relative aspect-[16/10] cursor-pointer ${activeDropdown === deck.id ? 'z-[100]' : 'z-10 hover:z-20'}`}
                            >
                                {/* Layered Card Backs */}
                                <div className="absolute -bottom-2 inset-x-4 h-full bg-[var(--layer3)] border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-1" />
                                <div className="absolute -bottom-1 inset-x-2 h-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl shadow-sm transition-transform group-hover:translate-y-0.5" />

                                {/* Main Face */}
                                <div className="relative h-full p-4 sm:p-5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl group-hover:border-[var(--nice-blue)] transition-colors shadow-sm z-10 flex flex-col justify-between">

                                    {/* Header: Icon & Options Grouped */}
                                    <div className="flex justify-between items-start mb-2 relative dropdown-container">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                            <CreditCard size={18} />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                                {deck?.card_count ?? deck.cards?.length ?? 0} cards
                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === deck.id ? null : deck.id);
                                                }}
                                                className="p-1 hover:bg-[var(--layer3)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-md transition-colors cursor-pointer"
                                            >
                                                <MoreVertical size={15} />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {activeDropdown === deck.id && (
                                                <UseItemOptionDropdown
                                                    item={deck}
                                                    itemType='flashcard'
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

                                    {/* Title & Description */}
                                    <div className="flex-1 flex flex-col min-h-0 mt-1">
                                        <h3 className="font-bold text-[var(--text)] text-sm sm:text-base leading-tight mb-1 truncate">
                                            {deck.name}
                                        </h3>
                                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                            {deck.description || 'No description added yet.'}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-[var(--text-muted)]">
                                            <Clock size={12} />
                                            Edited {formatDate(deck.updated_at)}
                                        </div>
                                        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold hidden sm:block">
                            Deck
                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
                <AnimatePresence>
                    {itemToDelete && (
                        <UseDeleteItemModal
                            item={itemToDelete}
                            itemType='flashcard'
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
                            itemType='flashcard'
                        />
                    )}

                    {showCreateFlashcardModal && (
                        <CreateFlashcardModal
                            setShowCreateFlashcardModal={setShowCreateFlashcardModal}
                            handleSaveDeck={handleCreateFlashcardDeck}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}