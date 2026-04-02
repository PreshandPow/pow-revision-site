'use client';

import { motion } from "framer-motion";
import { X, Folder, FileText, BookOpen } from "lucide-react";

const SIDEBAR_ITEMS = [
    {
        id: 'folders',
        label: 'Folders',
        icon: <Folder size={18} />,
        cards: [
            {
                icon: '📁',
                title: 'Create a folder',
                desc: 'Organise your notes and flashcards into folders.',
            },
        ],
    },
    {
        id: 'notes',
        label: 'Notes',
        icon: <FileText size={18} />,
        cards: [
            {
                icon: '📄',
                title: 'Create from a PDF, PPT, or file',
                desc: "We'll create notes from your file.",
            },
            {
                icon: '🎙️',
                title: 'Create from live recording',
                desc: 'Start a live lecture recording now.',
            },
            {
                icon: '✏️',
                title: 'Create from scratch',
                desc: 'Start writing your own notes.',
            },
        ],
    },
    {
        id: 'flashcards',
        label: 'Flashcards',
        icon: <BookOpen size={18} />,
        cards: [
            {
                icon: '🗃️',
                title: 'Create from scratch',
                desc: 'Build a flashcard set manually.',
            },
            {
                icon: '📄',
                title: 'Create from a file',
                desc: "We'll generate flashcards from your file.",
            },
            {
                icon: '📝',
                title: 'Create from notes',
                desc: 'Turn your existing notes into flashcards.',
            },
        ],
    },
];

export default function CreateModal({ setOpenCreateModal, activeTaskModal, setActiveTaskModal }) {

    const current = SIDEBAR_ITEMS.find(i => i.id === activeTaskModal);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-0 md:p-6"
            onClick={() => setOpenCreateModal(false)}
        >
            <motion.div
                className="relative flex w-full h-full md:w-3/4 md:max-h-[70vh] bg-[var(--layer1)] md:rounded-3xl shadow-2xl border-0 md:border md:border-[var(--layer2)] overflow-hidden"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-3/7 md:w-52 flex-shrink-0 bg-[var(--layer2)] border-r border-[var(--layer3)] flex flex-col p-4 gap-1">
                    {SIDEBAR_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTaskModal(item.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-colors text-left
                                ${activeTaskModal === item.id
                                ? 'bg-[var(--nice-blue)] text-white'
                                : 'text-[var(--text-muted)] hover:bg-[var(--layer3)] hover:text-[var(--text)]'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text)]">Create</h2>
                            <p className="text-[var(--text-muted)] text-sm mt-1">Navigate through the different categories</p>
                        </div>
                        <button
                            onClick={() => setOpenCreateModal(false)}
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--layer2)] hover:bg-[var(--layer3)] cursor-pointer transition-colors text-[var(--text)]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {current.cards.map((card, idx) => (
                            <div
                                key={idx}
                                className="bg-[var(--layer2)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--nice-blue)] transition-colors"
                            >
                                <span className="text-2xl">{card.icon}</span>
                                <p className="font-bold text-[var(--text)]">{card.title}</p>
                                <p className="text-sm text-[var(--text-muted)]">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}