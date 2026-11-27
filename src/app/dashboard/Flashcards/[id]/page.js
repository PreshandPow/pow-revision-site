'use client';
// ─── IMPORTS ───────────────────────────────────────────────────────
import {useState, useEffect, useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import {
    ChevronRight, MoreHorizontal, Edit, Play, Brain, Settings,
    Gamepad2, Headphones, Shuffle, Search, Star, Volume2,
    ChevronLeft, ChevronRight as ArrowRightIcon, Maximize,
    Type, Bold, Italic, Underline, Strikethrough, PaintBucket,
    Code, Link, Subscript, Superscript, Undo, Redo, X,
    FileText
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import NotesToolbar from '@/components/notesToolbar';
import { extensions, editorClasses, cardImageClasses } from '@/lib/tiptap/tiptapExports';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
// ─── MODAL IMPORTS ───────────────────────────────────────────────────────
import UseItemOptionDropdown from '@/components/itemOptionsDropdown';
import UseDeleteItemModal from '@/components/deleteItemModal';
import RenameItemModal from "@/components/RenameItemModal";
import MoveItemModal from "@/components/MoveItemModal";
// ─── HOOK IMPORTS ───────────────────────────────────────────────────────
import { useRenameItem, useMoveItem, useDeleteItem, useDuplicateItem } from '@/app/hooks/useItemActions';
import CreateFlashcardModal from "@/components/createFlashcardModal";
import {createFlashcardAction} from "@/app/hooks/createItemActions";
// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
const supabase = createClient();
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

// ─── EDIT CARD MODAL UI ─a
function EditCardModal({ cardToEdit, cardToEditRef, onClose, onSave, isSaving }) {
    const [term, setTerm] = useState(cardToEdit?.term ?? '');
    const [definition, setDefinition] = useState(cardToEdit?.definition ?? '');
    const [activeEditorType, setActiveEditorType] = useState('term');
    const termFileInputRef = useRef(null);
    const defFileInputRef = useRef(null);

    const termEditor = useEditor({
        extensions,
        content: cardToEdit.term,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        onUpdate: ({ editor }) => setTerm(editor.getHTML()),
        onFocus: () => setActiveEditorType('term'),
        editorProps: {
            attributes: {
                class: editorClasses,
            },
        },
    });

    const definitionEditor = useEditor({
        extensions,
        content: cardToEdit.definition,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        onUpdate: ({ editor }) => setDefinition(editor.getHTML()),
        onFocus: () => setActiveEditorType('definition'),
        editorProps: {
            attributes: {
                class: editorClasses,
            },
        },
    });
    const hasChanges = term !== cardToEdit?.term || definition !== cardToEdit?.definition;
    const activeEditor = activeEditorType === 'term' ? termEditor : definitionEditor;
    const hasContent = (htmlStr = '') => {
        return htmlStr.replace(/<[^>]*>/g, '').trim().length > 0 || htmlStr.includes('<img');
    };

    const handleToolbarImageInsert = () => {
        if (activeEditorType === 'term') {
            termFileInputRef.current?.click();
        } else {
            defFileInputRef.current?.click();
        }
    };

    const handleImageUpload = async (e, editor) => {
        const file = e.target.files?.[0];
        try {
            if (file && editor) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    toast.error('No User Logged In!')
                    return;
                }
                const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
                const { error } = await supabase.storage
                    .from('flashcard_images')
                    .upload(path, file)

                if (error) {
                    toast.error(error.message);
                    return;
                }

                const { data } = supabase.storage
                    .from('flashcard_images')
                    .getPublicUrl(path);


                editor.chain().focus().setImage({ src: data.publicUrl }).run();
            }
        } finally {
            e.target.value = '';
        }
    };

    if (!cardToEdit) return null;
    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center
        p-4 overflow-y-auto">
            <motion.div
                ref={cardToEditRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl shadow-2xl w-full max-w-5xl
                relative flex flex-col p-4 pt-14 sm:p-6 sm:min-h-[400px]"
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border
                    border-[var(--layer3)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)]
                    transition-colors cursor-pointer z-61"
                >
                    <X size={16} />
                </button>

                <div className="border-b p-2 flex justify-center relative z-60">
                    {activeEditor && (
                        <NotesToolbar
                            editor={activeEditor}
                            onInsertImage={handleToolbarImageInsert}
                        />
                    )}
                </div>

                {/* Inputs */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center flex-1 mt-4 sm:mt-0">
                    <div className="flex-1 w-full min-w-0">
                        {/* Hidden: opened by the toolbar's Image button */}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            ref={termFileInputRef}
                            onChange={(e) => handleImageUpload(e, termEditor)}
                        />
                        <EditorContent
                            editor={termEditor}
                            className="w-full bg-transparent border-b-2 border-(--text)/20 pb-2 text-lg
                            text-(--text-muted) focus-within:border-(--text) transition-colors"
                        />
                    </div>

                    <div className="flex-1 w-full min-w-0">
                        {/* Hidden: opened by the toolbar's Image button */}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            ref={defFileInputRef}
                            onChange={(e) => handleImageUpload(e, definitionEditor)}
                        />
                        <EditorContent
                            editor={definitionEditor}
                            className="w-full bg-transparent border-b-2 border-(--text)/20 pb-2 text-lg
                            text-(--text-muted) focus-within:border-(--text) transition-colors"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={() => onSave(term, definition)}
                        disabled={!hasChanges || (!hasContent(term) || !hasContent(definition)) || isSaving}
                        className="px-5 py-2 rounded-lg bg-[var(--nice-blue)] text-white text-sm font-semibold transition-all
                        hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function FlashcardStudyPage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    // ─── 1. REAL DATA STATES ───────────────────────────────────────────────────
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [folders, setFolders] = useState([]);

    // ─── 2. UI STATES ──────────────────────────────────────────────────────────
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Modal States

    // edit cards
    const [showEditDeckModal, setShowEditDeckModal] = useState(false);
    const [cardToEdit, setCardToEdit] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // ─── 3. FETCH DATA ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;

        const fetchDeckData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                const [deckResponse, cardsResponse, foldersResponse] = await Promise.all([
                    supabase.from('flashcard_decks').select('*').eq('id', id).single(),
                    supabase.from('flashcards').select('*').eq('deck_id', id).order('order_index', { ascending: true }),
                    user
                        ? supabase.from('folders').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
                        : Promise.resolve({ data: [] }),
                ]);

                if (deckResponse.error) throw deckResponse.error;
                if (cardsResponse.error) throw cardsResponse.error;

                setDeck(deckResponse.data);
                setCards(cardsResponse.data || []);
                setFolders(foldersResponse.data || []);

            } catch (error) {
                console.error("Error fetching flashcard data:", error);
                toast.error("Could not load flashcards.");

                router.replace('/dashboard/Flashcards');
            }
        };

        fetchDeckData();
    }, [id, router]);

    useEffect(() => {
        if (!cardToEdit) return;
        toast.success('yopoooo');
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [cardToEdit]);

    // ─── 4. KEYBOARD NAVIGATION LOGIC ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable || cardToEdit || cards.length === 0) return;

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                setIsFlipped(prev => !prev);
            } else if (e.code === 'ArrowLeft') {
                setIsFlipped(false);
                setCurrentCardIndex(prev => Math.max(0, prev - 1));
            } else if (e.code === 'ArrowRight') {
                setIsFlipped(false);
                setCurrentCardIndex(prev => Math.min(cards.length - 1, prev + 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cards.length, cardToEdit]);

    // ─── 5. RENAME DECK FEATURE ───────────────────────────────────────────────────
    const [showRenameItemModal, setShowRenameItemModal] = useState(false);
    const [itemName, setItemName] = useState('Untitled Deck');
    const renameModalRef = useRef(null);

    const { rename, isRenaming } = useRenameItem();

    const handleDeckRename = async (newName) => {
        const success = await rename('flashcard', selectedItem.id, newName);

        if (success) {
            setDeck(prev => ({ ...prev, name: newName }));
            setSelectedItem(null);
        }
    };

    // ─── 6. MOVE DECK FEATURE ─────────────────────────────────────────────────────
    const [showMoveItemModal, setShowMoveItemModal] = useState(false);
    const itemToMoveRef = useRef(null);

    const { moveItem, isMoving } = useMoveItem();

    const handleDeckMove = async (destinationId) => {
        const loadingToast = toast.loading('Moving flashcard deck...');
        const success = await moveItem('flashcard', selectedItem.id, destinationId);
        toast.dismiss(loadingToast);

        if (success) {
            setShowMoveItemModal(false);
            setDeck(prev => ({ ...prev, folder_id: destinationId === 'root' ? null : destinationId }));
            toast.success('Deck moved successfully');
            setSelectedItem(null);
        }
    };

    // ─── 7. CLOSE DROPDOWN/MODALS ON OUTSIDE CLICK ─────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.isConnected) return;
            if (!e.target.closest('.dropdown-container')) setActiveDropdown(null);
            if (renameModalRef.current && !renameModalRef.current.contains(e.target)) {
                setShowRenameItemModal(false);
            }
            if (itemToMoveRef.current && !itemToMoveRef.current.contains(e.target)) {
                setShowMoveItemModal(false);
            }
            if (cardToEditRef.current && !cardToEditRef.current.contains(e.target)) {
                setCardToEdit(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── 8. DELETE DECK FEATURE ───────────────────────────────────────────────────
    const [itemToDelete, setItemToDelete] = useState(null);
    const deleteModalRef = useRef(null);

    const { deleteItem, issDeleting } = useDeleteItem();

    const handleDeleteConfirm = async () => {
        const loadingToast = toast.loading('Deleting flashcard deck...');
        const success = await deleteItem('flashcard', itemToDelete.id);
        toast.dismiss(loadingToast);

        if (success) {
            router.push('/dashboard/Flashcards')
        }
    };

    // ─── 9. DUPLICATE DECK FEATURE ────────────────────────────────────────────────
    const { duplicateItem, isDuplicating } = useDuplicateItem();
    const handleDuplicateDeck = async (deck) => {
        const loadingToast = toast.loading('Duplicating flashcard deck...');
        const newNote = await duplicateItem('flashcard', deck);
        toast.dismiss(loadingToast);

        if (newNote) {
            setDeck(prev => [newNote, ...prev]);
            toast.success('Note duplicated');
        }
    };

    // ─── 10. EDIT CARD MODAL UI ────────────────────────────────────────────────
    const cardToEditRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleSaveCard = async (newTerm, newDefinition) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('flashcards')
                .update({ term: newTerm, definition: newDefinition })
                .eq('id', cardToEdit.id)
            if (error) {
                toast.error(error.message);
                return;
            }
        } finally {
            setIsSaving(false);
        }
        setCardToEdit(null);
        setCards(prev => prev.map(f => f.id === cardToEdit.id ? { ...f, term: newTerm, definition: newDefinition} : f));
    };
    if (!deck || cards.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--layer1)] flex flex-col items-center justify-center text-[var(--text)]">
                <div className="w-10 h-10 border-4 border-[var(--layer3)] border-t-[var(--nice-blue)] rounded-full animate-spin mb-4" />
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-xs">Loading Deck...</p>
            </div>
        );
    }

    const handleUpdateDeck = async (deckData) => {
        const loadingToast = toast.loading('Creating deck...');

        const newDeck = await createFlashcardAction(deckData, null, router);

        toast.dismiss(loadingToast);

        if (newDeck) {
            setShowEditDeckModal(false);
            setDeck(prev => [newDeck, ...prev]);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--layer1)] text-[var(--text)] font-sans pb-32">

            <div className="max-w-5xl mx-auto pt-6 px-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] mb-4">
                    <span onClick={() => router.push('/dashboard/Flashcards')} className="hover:text-[var(--text-muted)] cursor-pointer transition-colors">Decks</span>
                    <ChevronRight size={14} />
                    {deck.folderName && (
                        <>
                            <span className="hover:text-[var(--text-muted)] cursor-pointer transition-colors">{deck.folderName}</span>
                            <ChevronRight size={14} />
                        </>
                    )}
                    <span className="text-[var(--text-muted)]">{deck.name || deck.title}</span>
                </div>

                <div className={`bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col
                sm:flex-row sm:items-center gap-4 justify-between shadow-sm relative dropdown-container ${activeDropdown === deck.id ? 'z-[100]' : 'z-10'}`}>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-[var(--text-muted)] mb-1 break-words">{deck.name || deck.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                            <span>{(deck.rating || 0.0).toFixed(1)}</span>
                            <div className="flex items-center text-[var(--text-muted)]">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                            <span>({deck.reviews || 0})</span>
                            <span>Studied by {deck.studiedBy || 0} people</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEditDeckModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--layer3)]
                            text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                        >
                            <Edit size={16} /> Edit flashcards
                        </button>
                        <button
                            onClick={() => setActiveDropdown(activeDropdown === deck.id ? null : deck.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full border
                            border-[var(--layer3)] hover:bg-[var(--layer3)] text-[var(--text-muted)] transition-colors cursor-pointer"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                    <AnimatePresence>
                        {activeDropdown === deck.id && (
                            <UseItemOptionDropdown
                                item={deck}
                                itemType='flashcard'
                                setActiveDropdown={setActiveDropdown}
                                setShowRenameItemModal={setShowRenameItemModal}
                                setItemName={setItemName}
                                setShowMoveItemModal={setShowMoveItemModal}
                                setSelectedItem={setSelectedItem}
                                handleDuplicateItem={handleDuplicateDeck}
                                setItemToDelete={setItemToDelete}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modes Grid */}
            <div className="max-w-5xl mx-auto px-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { name: 'POW BOT', icon: Brain, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { name: 'Learn', icon: Brain, color: 'text-pink-400', bg: 'bg-pink-400/10' },
                    { name: 'Practice Test', icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { name: 'Spaced Repetition', icon: Shuffle, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { name: 'Match', icon: Star, color: 'text-red-400', bg: 'bg-red-400/10' },
                    { name: 'Flashcards', icon: Brain, color: 'text-gray-400', bg: 'bg-gray-400/10' },
                    { name: 'POW Play', icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { name: 'Podcast', icon: Headphones, color: 'text-purple-400', bg: 'bg-purple-400/10', hasAdd: true },
                ].map((mode, i) => (
                    <button
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[var(--layer2)] border
                        border-[var(--layer3)] hover:border-[var(--nice-blue)] hover:shadow-[0_0_15px_rgba(var(--blue-rgb),0.1)]
                        transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${mode.bg} ${mode.color}`}>
                                <mode.icon size={18} />
                            </div>
                            <span className="text-xs sm:text-sm text-left font-bold text-[var(--text-muted)] group-hover:text-[var(--nice-blue)]
                            transition-colors">{mode.name}</span>
                        </div>
                        {mode.hasAdd ? (
                            <span className="hidden sm:inline text-[10px] font-bold px-2 py-1 bg-[var(--layer3)] rounded-full text-[var(--text-muted)]">Add +</span>
                        ) : (
                            <ArrowRightIcon size={16} className="hidden sm:block text-[var(--text-muted)] group-hover:text-[var(--nice-blue)]
                            group-hover:translate-x-1 transition-all" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Interactive Flashcard Viewer */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="w-full h-[340px] sm:h-[450px] relative perspective-1000" style={{ perspective: '1000px' }}>
                    <motion.div
                        animate={{ rotateX: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full h-full relative cursor-pointer"
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="absolute inset-0 bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl
                        shadow-lg flex items-center justify-center p-5 pt-14 sm:p-8" style={{ backfaceVisibility: 'hidden' }}>

                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                <button className="px-3 py-1.5 rounded-full border border-[var(--layer3)] text-xs
                                font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors">Get a hint</button>
                                <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center
                                justify-center text-[var(--text)] hover:bg-[var(--layer3)] transition-colors"><Volume2
                                    size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation();
                                    setCardToEdit(cards[currentCardIndex]); }} className="w-8 h-8 rounded-full border
                                    border-[var(--layer3)] flex items-center justify-center text-[var(--text)]
                                    hover:bg-[var(--layer3)] transition-colors"><Edit size={14} /></button>
                                <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center
                                justify-center text-[var(--text)] hover:bg-[var(--layer3)] transition-colors">
                                    <Star size={14} /></button>
                            </div>

                            <h2 className={`text-2xl sm:text-4xl font-bold text-[var(--text)] text-center break-words
                            max-w-2xl max-h-full ${cardImageClasses} [&_img]:mx-auto`}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(cards[currentCardIndex].term) }} />
                        </div>

                        <div className="absolute inset-0 bg-[var(--layer2)] border border-[var(--nice-blue)] rounded-2xl
                        shadow-lg flex items-center justify-center p-5 pt-14 sm:p-8" style={{ backfaceVisibility: 'hidden',
                            transform: 'rotateX(180deg)' }}>
                            <h2 className={`text-2xl sm:text-4xl font-bold text-[var(--text)] text-center break-words
                            max-w-2xl max-h-full ${cardImageClasses} [&_img]:mx-auto`}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(cards[currentCardIndex].definition) }} />
                        </div>
                    </motion.div>
                </div>

                {/* Viewer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-y-4 mt-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--text)]">Card Sorting</span>
                        <div className="w-10 h-6 bg-[var(--layer3)] rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-[var(--text-muted)] rounded-full absolute left-1 top-1" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 order-first w-full sm:order-none sm:w-auto">
                        <button
                            onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => Math.max(0, prev - 1)); }}
                            className="w-10 h-10 rounded-full bg-[var(--layer2)] border border-[var(--layer3)] flex
                            items-center
                            justify-center hover:bg-[var(--layer3)] text-[var(--nice-blue)] transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-[var(--text)] w-12 text-center">
                            {currentCardIndex + 1}/{cards.length}
                        </span>
                        <button
                            onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => Math.min(cards.length - 1, prev + 1)); }}
                            className="w-10 h-10 rounded-full bg-[var(--layer2)] border border-[var(--layer3)] flex items-center
                            justify-center hover:bg-[var(--layer3)] text-[var(--nice-blue)] transition-colors cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center
                        hover:bg-[var(--layer3)] text-[var(--text)] transition-colors cursor-pointer"><Star size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center
                        hover:bg-[var(--layer3)] text-[var(--text)] transition-colors cursor-pointer"><Shuffle size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center
                        hover:bg-[var(--layer3)] text-[var(--text)] transition-colors cursor-pointer"><Settings size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center
                        hover:bg-[var(--layer3)] text-[var(--text)] transition-colors cursor-pointer"><Maximize size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Studying Progress UI */}
            <div className="max-w-5xl mx-auto px-4 mt-16 space-y-6">
                <div className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-3xl p-6">
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--layer3)] pb-4">
                        {['All Modes', 'Learn', 'Practice Test', 'Matching', 'Spaced Repetition', 'Call With POW Bot'].map((tab, i) => (
                            <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors 
                            cursor-pointer ${i === 0 ? 'bg-[var(--text)] text-[var(--layer1)] ' +
                                'border-[var(--text)]' : 'bg-transparent border-[var(--layer3)] ' +
                                'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-muted)]">Last updated today</span>
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--layer3)]
                            text-xs font-bold text-[var(--text)] hover:bg-[var(--layer3)] cursor-pointer"
                        >
                            <Undo size={14} /> Update
                        </button>
                    </div>

                    <div className="overflow-x-auto pb-1">
                        <table className="w-full text-left text-sm font-bold text-[var(--text)] min-w-[600px]">
                            <thead>
                            <tr className="text-[var(--text-muted)] border-b border-[var(--layer3)]">
                                <th className="pb-3 font-medium">Mastery</th>
                                <th className="pb-3 font-medium">Learn</th>
                                <th className="pb-3 font-medium">Test</th>
                                <th className="pb-3 font-medium">Matching</th>
                                <th className="pb-3 font-medium">Spaced</th>
                                <th className="pb-3 font-medium">Call with Kai</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="pt-4"><span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">0 %</span></td>
                                <td className="pt-4"><span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-xs text-[var(--text-muted)]">0 m</span></td>
                                <td className="pt-4"><span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-xs text-[var(--text-muted)]">0 m</span></td>
                                <td className="pt-4"><span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-xs text-[var(--text-muted)]">0 m</span></td>
                                <td className="pt-4"><span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-xs text-[var(--text-muted)]">0 m</span></td>
                                <td className="pt-4"><span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-xs text-[var(--text-muted)]">0 m</span></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--text)]">Studying Progress</h2>
                        <span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-sm font-bold text-[var(--text)]">0%</span>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'New cards', count: cards.length, color: 'text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500/20', circle: 'border-pink-400' },
                            { name: 'Still learning', count: 0, color: 'text-purple-400', bg: 'bg-purple-500/10', bar: 'bg-transparent', circle: 'border-purple-400 text-purple-400' },
                            { name: 'Almost done', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-transparent', circle: 'border-blue-400 text-blue-400' },
                            { name: 'Mastered', count: 0, color: 'text-green-400', bg: 'bg-green-500/10', bar: 'bg-transparent', circle: 'border-green-400 text-green-400' },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 sm:gap-4">
                                <div className={`flex-1 min-w-0 flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl ${stat.bar} ${stat.count === 0 && 'border border-[var(--layer3)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 ${stat.circle}`} />
                                        <span className={`font-bold ${stat.color}`}>{stat.name}</span>
                                    </div>
                                    <span className="font-bold text-[var(--text)]">{stat.count}</span>
                                </div>
                                <button className="px-3 sm:px-5 py-3 rounded-xl border border-[var(--layer3)] text-sm font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                    Study
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Terms List Section */}
            <div className="max-w-5xl mx-auto px-4 mt-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-[var(--text)]">{cards.length} Terms</h2>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search terms/definitions"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-full pl-10 pr-4 py-2
                            text-sm text-[var(--text)] focus:outline-none focus:border-[var(--nice-blue)] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--text)] text-[var(--layer1)]
                    font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                        View all ({cards.length})
                    </button>
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--layer3)]
                        text-[var(--text)]
                        font-bold text-sm hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                    >
                        <Star size={16} /> Star these {cards.length}
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {cards.filter(c => c.term.toLowerCase().includes(searchQuery.toLowerCase()) || c.definition.toLowerCase().includes(searchQuery.toLowerCase())).map((card, index) => (
                        <div key={card.id} className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl p-5
                        flex flex-col group hover:border-[var(--nice-blue)] transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--layer3)] flex items-center justify-center
                                font-bold text-[var(--text)] text-sm">
                                    {index + 1}
                                </span>
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100
                                transition-opacity">
                                    <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center
                                    justify-center text-[var(--text)]
                                    hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Volume2 size={14} /></button>
                                    <button onClick={() => setCardToEdit(card)} className="w-8 h-8 rounded-full border
                                    border-[var(--layer3)] flex items-center justify-center text-[var(--text)]
                                    hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Edit size={14} /></button>
                                    <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center
                                    justify-center text-[var(--text)]
                                    hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Star size={14} /></button>
                                    <span className="ml-2 px-3 py-1 bg-pink-500/10 text-pink-400 border
                                    border-pink-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full border border-pink-400" /> New cards
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Using dangerouslySetInnerHTML allows the rich-text Tiptap tags (bold, italic, etc) to render correctly! */}
                                <div
                                    className={`flex-1 min-w-0 break-words text-[var(--text)] font-bold text-lg md:border-r border-[var(--layer3)] md:pr-6 whitespace-pre-wrap ${cardImageClasses}`}
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.term) }}
                                />
                                <div
                                    className={`flex-1 min-w-0 break-words text-[var(--text)] font-bold text-lg whitespace-pre-wrap ${cardImageClasses}`}
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.definition) }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {cardToEdit && (
                    <EditCardModal
                        key={cardToEdit.id}
                        cardToEdit={cardToEdit}
                        cardToEditRef={cardToEditRef}
                        onClose={() => setCardToEdit(null)}
                        onSave={handleSaveCard}
                        isSaving={isSaving}
                    />
                )}
                {itemToDelete && (
                    <UseDeleteItemModal
                        item={deck}
                        itemType='flashcard'
                        deleteItemModalRef={deleteModalRef}
                        handleDeleteConfirm={handleDeleteConfirm}
                        setItemToDelete={setItemToDelete}
                    />
                )}
                {showRenameItemModal && (
                    <RenameItemModal
                        renameModalRef={renameModalRef}
                        currentName={itemName}
                        handleRename={handleDeckRename}
                        setItemName={setItemName}
                        setShowRenameItemModal={setShowRenameItemModal}
                    />
                )}
                {showMoveItemModal && selectedItem && (
                    <MoveItemModal
                        moveModalRef={itemToMoveRef}
                        folders={folders}
                        currentItem={selectedItem}
                        onMove={handleDeckMove}
                        onClose={() => {
                            setShowMoveItemModal(false);
                            setSelectedItem(null);
                        }}
                        itemType='flashcard'
                    />
                )}
                {showEditDeckModal && (
                    <CreateFlashcardModal
                        setShowCreateFlashcardModal={setShowEditDeckModal}
                        handleSaveDeck={handleUpdateDeck}
                        deckToUpdate={{ deck, cards }}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}