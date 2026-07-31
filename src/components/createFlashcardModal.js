'use client';

import { useState, useRef, useEffect } from 'react';
import {
    motion,
    AnimatePresence,
    Reorder,
    useDragControls,
} from 'framer-motion';
import {
    X,
    Check,
    Globe,
    Plus,
    Search,
    Sparkles,
    Download,
    ArrowLeftRight,
    GripVertical,
    Trash2,
    Mic,
    RotateCcw,
    Layers,
} from 'lucide-react';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';

import NotesToolbar from './notesToolbar';

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return { types: ['textStyle'] };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

function FlashcardRow({
                          index,
                          card,
                          updateCard,
                          deleteCard,
                          swapCard,
                          totalCards,
                          dragControls,
                      }) {
    const [activeEditorType, setActiveEditorType] = useState('term');
    const termFileInputRef = useRef(null);
    const defFileInputRef = useRef(null);

    const editorClasses = 'max-w-none min-h-[140px] w-full break-words whitespace-pre-wrap ' +
        'outline-none border-none ring-0 focus:outline-none focus:ring-0 [&_.ProseMirror]:outline-none ' +
        '[&_.ProseMirror:focus]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:ring-0 ' +
        '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 ' +
        '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 ' +
        '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-1 [&_h3]:mb-1 ' +
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 ' +
        '[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--layer3)] [&_blockquote]:pl-3 [&_blockquote]:italic ' +
        '[&_strong]:font-bold [&_em]:italic [&_s]:line-through ' +
        '[&_code]:bg-[var(--layer1)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono';

    const extensions = [
        StarterKit,
        TextStyle,
        Color,
        Image,
        FontFamily,
        FontSize,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: '"space" for AI, "/" for format' }),
    ];

    const termEditor = useEditor({
        extensions,
        content: card.term,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        onUpdate: ({ editor }) => updateCard(card.id, 'term', editor.getHTML()),
        onFocus: () => setActiveEditorType('term'),
        editorProps: {
            attributes: {
                class: editorClasses,
            },
        },
    });

    const defEditor = useEditor({
        extensions,
        content: card.definition,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        onUpdate: ({ editor }) => updateCard(card.id, 'definition', editor.getHTML()),
        onFocus: () => setActiveEditorType('definition'),
        editorProps: {
            attributes: {
                class: editorClasses,
            },
        },
    });

    const activeEditor = activeEditorType === 'term' ? termEditor : defEditor;

    const handleSwap = () => {
        if (!termEditor || !defEditor) return;
        const termContent = termEditor.getHTML();
        const defContent = defEditor.getHTML();
        termEditor.commands.setContent(defContent);
        defEditor.commands.setContent(termContent);
        swapCard(card.id);
    };

    const handleImageUpload = (e, editor) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            const imageUrl = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: imageUrl }).run();
        }
    };

    const handleToolbarImageInsert = () => {
        if (activeEditorType === 'term') {
            termFileInputRef.current?.click();
        } else {
            defFileInputRef.current?.click();
        }
    };

    return (
        <div
            className="bg-[var(--layer2)] rounded-2xl border border-[var(--layer3)] transition-all duration-300 relative z-10
                        hover:z-50 hover:border-[var(--nice-blue)]
                        focus-within:z-50 focus-within:border-[var(--nice-blue)] focus-within:ring-2
                        focus-within:ring-[var(--nice-blue)] focus-within:scale-[1.02]
                        focus-within:shadow-[0_10px_40px_rgba(var(--blue-rgb),0.15)]"
        >
            <div
                className="flex items-center justify-between p-3 border-b border-[var(--layer3)] bg-[var(--layer1)]/50
                rounded-t-2xl"
            >
                <span
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--layer2)]
                    border border-[var(--layer3)] text-[var(--text)] font-bold text-sm shadow-sm"
                >
                    {index + 1}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        className="group flex items-center gap-1.5 px-3 py-1.5 text-purple-400
                        hover:bg-purple-500/10 rounded-lg transition-colors mr-2 cursor-pointer"
                    >
                        <Sparkles
                            size={16}
                            className="group-hover:animate-pulse"
                        />
                        <span className="text-xs font-bold tracking-wide">POW bot</span>
                    </button>

                    <div className="w-px h-4 bg-[var(--layer3)] mx-1" />

                    <button
                        onClick={handleSwap}
                        title="Swap term and definition"
                        className="p-2 text-[var(--text-muted)]
                        hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeftRight size={16} />
                    </button>

                    <button
                        onClick={() => deleteCard(card.id)}
                        disabled={totalCards <= 3}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            totalCards <= 3
                                ? 'text-[var(--text-muted)]/30 cursor-not-allowed'
                                : 'text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10'
                        }`}
                    >
                        <Trash2 size={16} />
                    </button>

                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        style={{ touchAction: 'none' }}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)]
                        rounded-lg transition-colors cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>

            <div className="border-b border-[var(--layer3)] bg-[var(--layer1)]/30 p-2 flex justify-center relative z-[60]">
                {activeEditor && (
                    <NotesToolbar
                        editor={activeEditor}
                        onInsertImage={handleToolbarImageInsert}
                    />
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="flex-1 flex gap-4 min-w-0">
                    <div className="flex flex-col gap-2 shrink-0">
                        <input
                            type="file"
                            ref={termFileInputRef}
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, termEditor)}
                        />
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)]
                            text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)]
                            transition-colors cursor-pointer"
                        >
                            <Mic size={14} /> Record
                        </button>
                    </div>

                    <div
                        className="flex-1 min-w-0 relative cursor-text group"
                        onClick={() => termEditor?.commands.focus()}
                    >
                        <div
                            className="w-full bg-transparent border-b border-[var(--layer3)] transition-colors
                            min-h-[140px] outline-none ring-0 focus-within:border-[var(--nice-blue)]
                            group-focus-within:border-[var(--nice-blue)]"
                        >
                            <EditorContent editor={termEditor} />
                        </div>
                        <span
                            className={`absolute left-0 -bottom-4 text-[10px] font-bold uppercase tracking-widest
                            transition-colors ${
                                activeEditorType === 'term'
                                    ? 'text-[var(--nice-blue)]'
                                    : 'text-[var(--text-muted)] group-focus-within:text-[var(--nice-blue)]'
                            }`}
                        >
                            Term
                        </span>
                    </div>
                </div>

                <div className="hidden md:block w-px bg-[var(--layer3)] self-stretch mx-2" />
                <div className="md:hidden h-px w-full bg-[var(--layer3)] my-4" />

                <div className="flex-1 flex gap-4 min-w-0">
                    <div className="flex flex-col gap-2 shrink-0">
                        <input
                            type="file"
                            ref={defFileInputRef}
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, defEditor)}
                        />
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)]
                            text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)]
                            transition-colors cursor-pointer"
                        >
                            <Mic size={14} /> Record
                        </button>
                    </div>

                    <div
                        className="flex-1 min-w-0 relative cursor-text group"
                        onClick={() => defEditor?.commands.focus()}
                    >
                        <div
                            className="w-full bg-transparent border-b border-[var(--layer3)] transition-colors
                            min-h-[140px] outline-none ring-0 focus-within:border-[var(--nice-blue)]
                            group-focus-within:border-[var(--nice-blue)]"
                        >
                            <EditorContent editor={defEditor} />
                        </div>
                        <span
                            className={`absolute left-0 -bottom-4 text-[10px] font-bold uppercase tracking-widest
                            transition-colors ${
                                activeEditorType === 'definition'
                                    ? 'text-[var(--nice-blue)]'
                                    : 'text-[var(--text-muted)] group-focus-within:text-[var(--nice-blue)]'
                            }`}
                        >
                            Definition
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortableFlashcardItem({
                                   card,
                                   index,
                                   updateCard,
                                   deleteCard,
                                   swapCard,
                                   totalCards,
                               }) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={card}
            dragListener={false}
            dragControls={controls}
            className="relative z-10"
        >
            <FlashcardRow
                index={index}
                card={card}
                updateCard={updateCard}
                deleteCard={deleteCard}
                swapCard={swapCard}
                totalCards={totalCards}
                dragControls={controls}
            />
        </Reorder.Item>
    );
}

export default function CreateFlashcardModal({ setShowCreateFlashcardModal, handleSaveDeck }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showResetMenu, setShowResetMenu] = useState(false);

    const defaultCards = [
        { id: crypto.randomUUID(), term: '', definition: '' },
        { id: crypto.randomUUID(), term: '', definition: '' },
        { id: crypto.randomUUID(), term: '', definition: '' },
    ];

    const [cards, setCards] = useState(defaultCards);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const draft = localStorage.getItem('pow_flashcard_draft');
        if (draft) {
            const parsed = JSON.parse(draft);
            if (parsed.title) setTitle(parsed.title);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.cards && parsed.cards.length > 0) setCards(parsed.cards);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(
                'pow_flashcard_draft',
                JSON.stringify({ title, description, cards })
            );
        }
    }, [title, description, cards, isLoaded]);

    const updateCard = (id, field, value) =>
        setCards(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));

    const addCard = () =>
        setCards(prev => [...prev, { id: crypto.randomUUID(), term: '', definition: '' }]);

    const deleteCard = (id) => {
        if (cards.length <= 3) return;
        setCards(prev => prev.filter(c => c.id !== id));
    };

    const swapCard = (id) =>
        setCards(prev => prev.map(c => (c.id === id ? { ...c, term: c.definition, definition: c.term } : c)));

    const onSave = () => {
        handleSaveDeck({ title, description, cards });
        localStorage.removeItem('pow_flashcard_draft');
    };

    // ─── IMPROVED CARD VALIDATION ───────────────────────────────────────────────
    // Helper function to accurately check if a side is filled,
    // stripping Tiptap's empty <p></p> tags while still allowing images
    const hasContent = (htmlStr = '') => {
        return htmlStr.replace(/<[^>]*>/g, '').trim().length > 0 || htmlStr.includes('<img');
    };

    // a card "filled" if either the term OR definition has content
    const filledCardCount = cards.filter(c => hasContent(c.term) || hasContent(c.definition)).length;

    // The button is disabled if there's no title OR if there are fewer than 3 filled cards
    const isSaveDisabled = !title.trim() || filledCardCount < 3;

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center sm:p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--layer1)] w-full h-full sm:h-[88vh] sm:max-w-5xl sm:rounded-2xl shadow-2xl sm:border
                sm:border-[var(--layer3)] flex flex-col overflow-hidden"
            >
                <div
                    className="shrink-0 flex items-center justify-between gap-4 bg-[var(--layer1)] px-5 sm:px-7 py-4
                    border-b border-[var(--layer3)]"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--nice-blue)]/10
                            text-[var(--nice-blue)] shrink-0"
                        >
                            <Layers
                                size={18}
                                strokeWidth={2.5}
                            />
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <h1 className="text-[16px] sm:text-xl font-bold text-[var(--text)] truncate">
                                Create flashcards
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                    {filledCardCount} card{filledCardCount === 1 ? '' : 's'} filled
                                </p>
                                {filledCardCount < 3 && (
                                    <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                                        Min 3 required
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setShowResetMenu(!showResetMenu)}
                                className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg border
                                    border-[var(--layer3)] text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]
                                    hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                            >
                                <RotateCcw size={15} />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                            <AnimatePresence>
                                {showResetMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full mt-2 right-0 w-52 bg-[var(--layer2)] border
                                        border-[var(--layer3)] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-1"
                                    >
                                        <button
                                            onClick={() => {
                                                setCards(defaultCards);
                                                setShowResetMenu(false);
                                            }}
                                            className="px-4 py-2.5 text-left text-sm font-medium text-[var(--text)]
                                            hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        >
                                            Reset cards only
                                        </button>
                                        <button
                                            onClick={() => {
                                                setTitle('');
                                                setDescription('');
                                                setShowResetMenu(false);
                                            }}
                                            className="px-4 py-2.5 text-left text-sm font-medium text-[var(--text)]
                                            hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                                        >
                                            Reset title & description
                                        </button>
                                        <div className="h-px bg-[var(--layer3)] my-1 mx-1" />
                                        <button
                                            onClick={() => {
                                                setTitle('');
                                                setDescription('');
                                                setCards(defaultCards);
                                                setShowResetMenu(false);
                                            }}
                                            className="px-4 py-2.5 text-left text-sm font-bold text-red-400
                                            hover:bg-red-500/10 transition-colors cursor-pointer"
                                        >
                                            Reset everything
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={onSave}
                            disabled={isSaveDisabled}
                            title={isSaveDisabled ? "Enter a title and fill at least 3 cards to save" : "Save deck"}
                            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap
                                ${
                                isSaveDisabled
                                    ? 'bg-[var(--nice-blue)]/30 text-white/40 cursor-not-allowed'
                                    : 'bg-[var(--nice-blue)] text-white hover:scale-95 cursor-pointer'
                            }`}
                        >
                            <Check
                                size={16}
                                strokeWidth={3}
                            />
                            <span className="hidden sm:inline">Save & Create</span>
                            <span className="sm:hidden">Save</span>
                        </button>

                        <div className="w-px h-6 bg-[var(--layer3)] mx-0.5" />

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowCreateFlashcardModal(false);
                            }}
                            className="p-2 hover:bg-[var(--layer3)] rounded-lg text-[var(--text-muted)]
                            hover:text-[var(--text)] transition-colors cursor-pointer"
                        >
                            <X size={19} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text)] mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                placeholder='Enter a title, like "Biology 101"'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl px-4 py-3.5
                                text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2
                                focus:ring-[var(--nice-blue)] focus:border-transparent transition-all shadow-inner outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text)] mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Add a description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl px-4 py-3
                                text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2
                                focus:ring-[var(--nice-blue)] focus:border-transparent transition-all min-h-[100px]
                                resize-y shadow-inner outline-none"
                            />
                        </div>
                    </div>

                    <div
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--layer2)]
                        p-2 rounded-2xl border border-[var(--layer3)] shadow-sm max-w-3xl mx-auto w-full"
                    >
                        <div className="relative w-full sm:w-80">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search terms/definitions"
                                className="w-full bg-transparent border-none rounded-full pl-10 pr-4 py-2 text-sm
                                text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--nice-blue)]
                                transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <button
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold
                                text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                            >
                                <Sparkles size={16} /> POW bot Complete
                            </button>
                            <div className="w-px h-4 bg-[var(--layer3)]" />
                            <button
                                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold
                                text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                            >
                                <Download size={16} /> Import
                            </button>
                        </div>
                    </div>

                    <Reorder.Group
                        axis="y"
                        values={cards}
                        onReorder={setCards}
                        className="flex flex-col gap-6 max-w-3xl mx-auto w-full"
                    >
                        <AnimatePresence>
                            {cards.map((card, index) => (
                                <SortableFlashcardItem
                                    key={card.id}
                                    card={card}
                                    index={index}
                                    updateCard={updateCard}
                                    deleteCard={deleteCard}
                                    swapCard={swapCard}
                                    totalCards={cards.length}
                                />
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>

                    <div className="flex justify-center pt-4 pb-12 max-w-3xl mx-auto w-full">
                        <button
                            onClick={addCard}
                            className="flex items-center justify-center w-full py-5 rounded-2xl
                            border-2 border-dashed border-[var(--layer3)] text-[var(--text)] font-bold
                            hover:border-[var(--nice-blue)] hover:text-[var(--nice-blue)] hover:bg-[var(--nice-blue)]/5
                            hover:shadow-[0_0_20px_rgba(var(--blue-rgb),0.1)] transition-all group cursor-pointer"
                        >
                            <Plus className="mr-2 group-hover:scale-125 transition-transform" /> Add card
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}