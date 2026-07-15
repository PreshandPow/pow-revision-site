'use client';

import { useState, useCallback } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import FlashcardFaceEditor from './flashcardFaceEditor';

function createEmptyCard() {
    return {
        id: crypto.randomUUID(),
        term: '',
        definition: '',
    };
}

export default function FlashcardCreator({ initialCards, onChange }) {
    const [cards, setCards] = useState(() =>
        initialCards && initialCards.length > 0 ? initialCards : [createEmptyCard()]
    );

    const emitChange = useCallback((next) => {
        setCards(next);
        onChange?.(next);
    }, [onChange]);

    const updateCardField = (id, field, value) => {
        emitChange(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addCard = () => {
        emitChange([...cards, createEmptyCard()]);
    };

    const deleteCard = (id) => {
        if (cards.length === 1) return; // keep at least one card
        emitChange(cards.filter(c => c.id !== id));
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
            <ul className="flex flex-col gap-4">
                {cards.map((card, index) => (
                    <li
                        key={card.id}
                        className="group relative bg-[var(--layer1)] border border-[var(--layer3)] rounded-xl p-4 md:p-5 flex flex-col gap-4"
                    >
                        {/* Header row: index + drag handle (left), delete (right) */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                {/* Visual only for now — wire up @dnd-kit for real
                                    reordering when you get to it. */}
                                <GripVertical size={16} className="cursor-grab opacity-40 group-hover:opacity-100 transition-opacity" />
                                <span className="text-xs font-bold opacity-50">{index + 1}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteCard(card.id)}
                                disabled={cards.length === 1}
                                className="text-[var(--text-muted)] hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Term / Definition columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:divide-x md:divide-[var(--layer3)]">
                            <div className="flex flex-col gap-2 md:pr-4">
                                <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] opacity-50">
                                    TERM
                                </span>
                                <FlashcardFaceEditor
                                    initialContent={card.term}
                                    placeholder="Enter term"
                                    onChange={(html) => updateCardField(card.id, 'term', html)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:pl-4">
                                <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] opacity-50">
                                    DEFINITION
                                </span>
                                <FlashcardFaceEditor
                                    initialContent={card.definition}
                                    placeholder="Enter definition"
                                    onChange={(html) => updateCardField(card.id, 'definition', html)}
                                />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Add Card */}
            <button
                type="button"
                onClick={addCard}
                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[var(--layer3)] rounded-xl
                    text-[var(--text-muted)] hover:text-[var(--nice-blue)] hover:border-[var(--nice-blue)] transition-all cursor-pointer font-semibold text-sm"
            >
                <Plus size={16} strokeWidth={2.5} />
                Add Card
            </button>
        </div>
    );
}