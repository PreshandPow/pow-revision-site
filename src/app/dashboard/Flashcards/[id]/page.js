'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, Rows3, RectangleHorizontal, Pencil } from 'lucide-react';

import FlashcardStudyCard from '../../../../components/flashcardStudyCard';
import CreateFlashcardModal from '../../../../components/createFlashcardModal';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

// Assumes a `flashcard_sets` table: id, title, cards (jsonb). Adjust to match
// your actual schema/table name if it's different.
const TABLE_NAME = 'flashcard_sets';

export default function FlashcardSetPage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [cards, setCards] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [mode, setMode] = useState('flip'); // 'flip' | 'both'
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    // ─── FETCH ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchSet = async () => {
            const { data: set, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                toast.error('Could not load flashcards', toastStyle);
                router.replace('/dashboard/Flashcards');
                return;
            }

            setTitle(set.title || '');
            setCards(set.cards || []);
            setLoading(false);
        };
        fetchSet();
    }, [id]);

    useEffect(() => {
        document.body.style.overflow = loading ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [loading]);

    // Reset flip state whenever the current card changes, so you always land
    // on the term side first.
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    // Clamp index if the deck shrinks (e.g. after editing removes cards).
    useEffect(() => {
        if (currentIndex > cards.length - 1) {
            setCurrentIndex(Math.max(0, cards.length - 1));
        }
    }, [cards, currentIndex]);

    // ─── NAVIGATION ────────────────────────────────────────────────────────────
    const goNext = useCallback(() => {
        setCurrentIndex((i) => Math.min(i + 1, cards.length - 1));
    }, [cards.length]);

    const goPrev = useCallback(() => {
        setCurrentIndex((i) => Math.max(i - 1, 0));
    }, []);

    const handleFlip = useCallback(() => {
        if (mode !== 'flip') return;
        setIsFlipped((f) => !f);
    }, [mode]);

    // Keyboard shortcuts: ← → to navigate, Space to flip.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === ' ') { e.preventDefault(); handleFlip(); }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [goNext, goPrev, handleFlip]);

    // ─── EDIT DECK (via modal) ─────────────────────────────────────────────────
    const handleSaveEdit = async (newTitle, newCards) => {
        setTitle(newTitle);
        setCards(newCards);

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ title: newTitle, cards: newCards })
            .eq('id', id);

        if (error) {
            toast.error('Could not save changes', toastStyle);
        } else {
            toast.success('Flashcards saved!', toastStyle);
        }
    };

    // ─── RENDER ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                Getting your <span className="text-[var(--nice-blue)]">Flashcards</span> ready
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">Fetching your data...</p>
        </div>
    );

    const hasCards = cards.length > 0;
    const currentCard = hasCards ? cards[currentIndex] : null;

    return (
        <main className="min-h-screen bg-[var(--layer2)] flex flex-col">

            {/* Top Navbar */}
            <ul className="sticky top-0 z-10 bg-[var(--layer1)] border-b border-[var(--layer3)] px-4 md:px-10 py-1.5 flex items-center justify-between gap-4">
                <li>
                    <button onClick={() => router.push('/dashboard/Flashcards')}
                            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer font-semibold text-sm">
                        <ArrowLeft size={16} /> Flashcards
                    </button>
                </li>
                <li>
                    <Link href="/" className="font-brand font-black tracking-tighter z-20 text-2xl text-[var(--nice-blue)]">POW</Link>
                </li>
                <li>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                    >
                        <Pencil size={14} /> Edit Cards
                    </button>
                </li>
            </ul>

            <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-0 py-10 flex flex-col gap-6">

                {/* Title + mode toggle */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-main font-bold text-[var(--text)] truncate">
                        {title || 'Untitled flashcard set'}
                    </h1>

                    <div className="flex items-center gap-1 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setMode('flip')}
                            title="Flip mode"
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-all
                                ${mode === 'flip' ? 'bg-[var(--nice-blue)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                        >
                            <RectangleHorizontal size={14} /> Flip
                        </button>
                        <button
                            onClick={() => setMode('both')}
                            title="Show both sides"
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-all
                                ${mode === 'both' ? 'bg-[var(--nice-blue)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                        >
                            <Rows3 size={14} /> Both
                        </button>
                    </div>
                </div>

                {!hasCards ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                        <p className="text-[var(--text-muted)] font-medium">This deck doesn't have any cards yet.</p>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-sm font-bold bg-[var(--nice-blue)] text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-95 transition-transform"
                        >
                            Add Cards
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Progress */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[var(--text-muted)] tabular-nums">
                                {currentIndex + 1} / {cards.length}
                            </span>
                            <div className="flex-1 h-1 bg-[var(--layer3)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--nice-blue)] transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Card */}
                        <FlashcardStudyCard
                            card={currentCard}
                            isFlipped={isFlipped}
                            onFlip={handleFlip}
                            mode={mode}
                        />

                        {mode === 'flip' && (
                            <p className="text-center text-xs text-[var(--text-muted)] opacity-60">
                                Click the card or press Space to flip
                            </p>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--layer1)] border border-[var(--layer3)]
                                    text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={goNext}
                                disabled={currentIndex === cards.length - 1}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--layer1)] border border-[var(--layer3)]
                                    text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <CreateFlashcardModal
                isOpen={isEditModalOpen}
                initialTitle={title}
                initialCards={cards}
                onSave={handleSaveEdit}
                onClose={() => setIsEditModalOpen(false)}
            />
        </main>
    );
}