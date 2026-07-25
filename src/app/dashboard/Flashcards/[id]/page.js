'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'; // 👈 Add this
import toast from 'react-hot-toast'; // 👈 Add this
import {
    ChevronRight, MoreHorizontal, Edit, Play, Brain, Settings,
    Gamepad2, Headphones, Shuffle, Search, Star, Volume2,
    ChevronLeft, ChevronRight as ArrowRightIcon, Maximize,
    Type, Bold, Italic, Underline, Strikethrough, PaintBucket,
    Code, Link, Subscript, Superscript, Undo, Redo, Image as ImageIcon, Mic, X,
    FileText
} from 'lucide-react';

// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FlashcardStudyPage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    // ─── 1. REAL DATA STATES ───────────────────────────────────────────────────
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);

    // ─── 2. UI STATES ──────────────────────────────────────────────────────────
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Modal States
    const [showEditDeckModal, setShowEditDeckModal] = useState(false);
    const [cardToEdit, setCardToEdit] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // ─── 3. FETCH DATA ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;

        const fetchDeckData = async () => {
            try {
                // 1. Fetch the parent deck wrapper
                const { data: deckData, error: deckError } = await supabase
                    .from('flashcard_decks')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (deckError) throw deckError;

                // 2. Fetch the individual flashcards for this deck, ordered correctly
                const { data: cardsData, error: cardsError } = await supabase
                    .from('flashcards')
                    .select('*')
                    .eq('deck_id', id)
                    .order('order_index', { ascending: true });

                if (cardsError) throw cardsError;

                // 3. Set the data to state so the UI can render
                setDeck(deckData);
                setCards(cardsData || []);

            } catch (error) {
                console.error("Error fetching flashcard data:", error);
                toast.error("Could not load flashcards.", {
                    style: {
                        border: '1px solid var(--nice-blue)',
                        padding: '16px',
                        color: 'var(--text)',
                        background: 'var(--layer2)',
                    },
                    iconTheme: { primary: 'var(--nice-blue)', secondary: '#FFFAEE' },
                });

                // Kick the user back to the main flashcards page if the URL is invalid
                router.replace('/dashboard/Flashcards');
            }
        };

        fetchDeckData();
    }, [id, router]);

    // ─── 4. KEYBOARD NAVIGATION LOGIC ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Disable shortcuts if user is typing in an input or modal, or if cards aren't loaded
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable || cardToEdit || cards.length === 0) return;

            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault(); // Prevent page scrolling
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

    // ─── 5. EDIT CARD MODAL UI ─────────────────────────────────────────────────
    const EditCardModal = () => {
        if (!cardToEdit) return null;
        return (
            <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl shadow-2xl w-full max-w-5xl relative flex flex-col p-6 min-h-[400px]"
                >
                    <button
                        onClick={() => setCardToEdit(null)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-[var(--layer3)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>

                    {/* Toolbar */}
                    <div className="flex justify-center mb-12 mt-2">
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--layer3)] bg-[var(--layer1)]/50 text-[var(--text-muted)]">
                            <Type size={16} className="cursor-pointer hover:text-white" />
                            <div className="w-px h-4 bg-[var(--layer3)] mx-1" />
                            <Bold size={16} className="cursor-pointer hover:text-white" />
                            <Italic size={16} className="cursor-pointer hover:text-white" />
                            <Underline size={16} className="cursor-pointer hover:text-white" />
                            <Strikethrough size={16} className="cursor-pointer hover:text-white" />
                            <PaintBucket size={16} className="cursor-pointer hover:text-white" />
                            <Code size={16} className="cursor-pointer hover:text-white" />
                            <Link size={16} className="cursor-pointer hover:text-white" />
                            <Subscript size={16} className="cursor-pointer hover:text-white" />
                            <Superscript size={16} className="cursor-pointer hover:text-white" />
                            <div className="w-px h-4 bg-[var(--layer3)] mx-1" />
                            <Undo size={16} className="cursor-pointer hover:text-white" />
                            <Redo size={16} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col md:flex-row gap-8 items-center flex-1">
                        <div className="flex-1 w-full flex items-center gap-4">
                            <div className="flex flex-col gap-2 shrink-0">
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--layer3)] rounded-lg text-xs font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                    <ImageIcon size={14} /> Image
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--layer3)] rounded-lg text-xs font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                    <Mic size={14} /> Record
                                </button>
                            </div>
                            <input
                                type="text"
                                defaultValue={cardToEdit.term}
                                className="w-full bg-transparent border-b-2 border-white/20 pb-2 text-lg text-white focus:outline-none focus:border-white transition-colors"
                            />
                        </div>

                        <div className="flex-1 w-full flex items-center gap-4">
                            <input
                                type="text"
                                defaultValue={cardToEdit.definition}
                                className="w-full bg-transparent border-b-2 border-white/20 pb-2 text-lg text-white focus:outline-none focus:border-white transition-colors"
                            />
                            <div className="flex flex-col gap-2 shrink-0">
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--layer3)] rounded-lg text-xs font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                    <ImageIcon size={14} /> Image
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-[var(--layer3)] rounded-lg text-xs font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                    <Mic size={14} /> Record
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // ─── GUARD: Wait until data is loaded ──────────────────────────────────────
    if (!deck || cards.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 border-4 border-[var(--layer3)] border-t-[var(--nice-blue)] rounded-full animate-spin mb-4" />
                <p className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-xs">Loading Deck...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[var(--text)] font-sans pb-32">

            <div className="max-w-5xl mx-auto pt-6 px-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] mb-4">
                    <span onClick={() => router.push('/dashboard/Flashcards')} className="hover:text-white cursor-pointer transition-colors">Decks</span>
                    <ChevronRight size={14} />
                    {deck.folderName && (
                        <>
                            <span className="hover:text-white cursor-pointer transition-colors">{deck.folderName}</span>
                            <ChevronRight size={14} />
                        </>
                    )}
                    <span className="text-white">{deck.name || deck.title}</span>
                </div>

                <div className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{deck.name || deck.title}</h1>
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                            <span>{(deck.rating || 0.0).toFixed(1)}</span>
                            <div className="flex items-center text-gray-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                            <span>({deck.reviews || 0})</span>
                            <span>Studied by {deck.studiedBy || 0} people</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEditDeckModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--layer3)] text-sm font-bold text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                        >
                            <Edit size={16} /> Edit flashcards
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--layer3)] hover:bg-[var(--layer3)] text-white transition-colors cursor-pointer">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
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
                    { name: 'Knowt Play', icon: Gamepad2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { name: 'Podcast', icon: Headphones, color: 'text-purple-400', bg: 'bg-purple-400/10', hasAdd: true },
                ].map((mode, i) => (
                    <button key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--layer2)] border border-[var(--layer3)] hover:border-[var(--nice-blue)] hover:shadow-[0_0_15px_rgba(var(--blue-rgb),0.1)] transition-all group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${mode.bg} ${mode.color}`}>
                                <mode.icon size={18} />
                            </div>
                            <span className="text-sm font-bold text-white group-hover:text-[var(--nice-blue)] transition-colors">{mode.name}</span>
                        </div>
                        {mode.hasAdd ? (
                            <span className="text-[10px] font-bold px-2 py-1 bg-[var(--layer3)] rounded-full text-white">Add +</span>
                        ) : (
                            <ArrowRightIcon size={16} className="text-[var(--text-muted)] group-hover:text-[var(--nice-blue)] group-hover:translate-x-1 transition-all" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Interactive Flashcard Viewer */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="w-full aspect-video sm:h-[450px] relative perspective-1000" style={{ perspective: '1000px' }}>
                    <motion.div
                        animate={{ rotateX: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full h-full relative cursor-pointer"
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="absolute inset-0 bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl shadow-lg flex items-center justify-center p-8" style={{ backfaceVisibility: 'hidden' }}>

                            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                <button className="px-3 py-1.5 rounded-full border border-[var(--layer3)] text-xs font-bold text-white hover:bg-[var(--layer3)] transition-colors">Get a hint</button>
                                <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors"><Volume2 size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); setCardToEdit(cards[currentCardIndex]); }} className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors"><Edit size={14} /></button>
                                <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors"><Star size={14} /></button>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center break-words max-w-2xl" dangerouslySetInnerHTML={{ __html: cards[currentCardIndex].term }} />
                        </div>

                        <div className="absolute inset-0 bg-[var(--layer2)] border border-[var(--nice-blue)] rounded-2xl shadow-lg flex items-center justify-center p-8" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center break-words max-w-2xl" dangerouslySetInnerHTML={{ __html: cards[currentCardIndex].definition }} />
                        </div>
                    </motion.div>
                </div>

                {/* Viewer Controls */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">Card Sorting</span>
                        <div className="w-10 h-6 bg-[var(--layer3)] rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-[var(--text-muted)] rounded-full absolute left-1 top-1" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => Math.max(0, prev - 1)); }}
                            className="w-10 h-10 rounded-full bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-[var(--nice-blue)] transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-white w-12 text-center">
                            {currentCardIndex + 1}/{cards.length}
                        </span>
                        <button
                            onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => Math.min(cards.length - 1, prev + 1)); }}
                            className="w-10 h-10 rounded-full bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-[var(--nice-blue)] transition-colors cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-white transition-colors cursor-pointer"><Star size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-white transition-colors cursor-pointer"><Shuffle size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-white transition-colors cursor-pointer"><Settings size={18} /></button>
                        <button className="w-10 h-10 rounded-xl bg-[var(--layer2)] border border-[var(--layer3)] flex items-center justify-center hover:bg-[var(--layer3)] text-white transition-colors cursor-pointer"><Maximize size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Studying Progress UI */}
            <div className="max-w-5xl mx-auto px-4 mt-16 space-y-6">
                <div className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-3xl p-6">
                    <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--layer3)] pb-4">
                        {['All Modes', 'Learn', 'Practice Test', 'Matching', 'Spaced Repetition', 'Call with Kai'].map((tab, i) => (
                            <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors cursor-pointer ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent border-[var(--layer3)] text-[var(--text-muted)] hover:text-white'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[var(--text-muted)]">Last updated today</span>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--layer3)] text-xs font-bold text-white hover:bg-[var(--layer3)] cursor-pointer"><Undo size={14} /> Update</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-bold text-white min-w-[600px]">
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
                        <h2 className="text-xl font-bold text-white">Studying Progress</h2>
                        <span className="px-3 py-1 bg-[var(--layer3)] rounded-full text-sm font-bold text-white">0%</span>
                    </div>

                    <div className="space-y-3">
                        {[
                            { name: 'New cards', count: cards.length, color: 'text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500/20', circle: 'border-pink-400' },
                            { name: 'Still learning', count: 0, color: 'text-purple-400', bg: 'bg-purple-500/10', bar: 'bg-transparent', circle: 'border-purple-400 text-purple-400' },
                            { name: 'Almost done', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-transparent', circle: 'border-blue-400 text-blue-400' },
                            { name: 'Mastered', count: 0, color: 'text-green-400', bg: 'bg-green-500/10', bar: 'bg-transparent', circle: 'border-green-400 text-green-400' },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl ${stat.bar} ${stat.count === 0 && 'border border-[var(--layer3)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 ${stat.circle}`} />
                                        <span className={`font-bold ${stat.color}`}>{stat.name}</span>
                                    </div>
                                    <span className="font-bold text-white">{stat.count}</span>
                                </div>
                                <button className="px-5 py-3 rounded-xl border border-[var(--layer3)] text-sm font-bold text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer">
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
                    <h2 className="text-xl font-bold text-white">{cards.length} Terms</h2>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search terms/definitions"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--nice-blue)] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                        View all ({cards.length})
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--layer3)] text-white font-bold text-sm hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                        <Star size={16} /> Star these {cards.length}
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {cards.filter(c => c.term.toLowerCase().includes(searchQuery.toLowerCase()) || c.definition.toLowerCase().includes(searchQuery.toLowerCase())).map((card, index) => (
                        <div key={card.id} className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col group hover:border-gray-500 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <span className="w-8 h-8 rounded-full bg-[var(--layer3)] flex items-center justify-center font-bold text-white text-sm">
                                    {index + 1}
                                </span>
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Volume2 size={14} /></button>
                                    <button onClick={() => setCardToEdit(card)} className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Edit size={14} /></button>
                                    <button className="w-8 h-8 rounded-full border border-[var(--layer3)] flex items-center justify-center text-white hover:bg-[var(--layer3)] transition-colors cursor-pointer"><Star size={14} /></button>
                                    <span className="ml-2 px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full border border-pink-400" /> New cards
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Using dangerouslySetInnerHTML allows the rich-text Tiptap tags (bold, italic, etc) to render correctly! */}
                                <div
                                    className="flex-1 text-white font-bold text-lg md:border-r border-[var(--layer3)] md:pr-6 whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: card.term }}
                                />
                                <div
                                    className="flex-1 text-white font-bold text-lg whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: card.definition }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Portaled Modals */}
            <AnimatePresence>
                {cardToEdit && <EditCardModal />}
            </AnimatePresence>

        </div>
    );
}