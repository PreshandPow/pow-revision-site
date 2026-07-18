'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
    X, Check, Globe, Plus, Search, Sparkles, Download,
    ArrowLeftRight, GripVertical, Trash2, Image as ImageIcon, Mic,
    RotateCcw
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

// ─── CUSTOM TIPTAP EXTENSION: FONT SIZE ─────────────────────────────────────
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() { return { types: ['textStyle'] }; },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                    renderHTML: attributes => {
                        if (!attributes.fontSize) return {};
                        return { style: `font-size: ${attributes.fontSize}` };
                    }
                }
            }
        }];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
            }
        };
    }
});

// ─── INDIVIDUAL FLASHCARD COMPONENT ──────────────────────────────────────────
function FlashcardRow({ index, card, updateCard, deleteCard, swapCard, totalCards, dragControls }) {
    const [activeEditorType, setActiveEditorType] = useState('term');
    const termFileInputRef = useRef(null);
    const defFileInputRef = useRef(null);

    // FIX: Added break-words to fix horizontal pushing, and prose-code overrides to kill the white box
    const editorClasses = 'prose prose-invert max-w-none min-h-[140px] w-full break-words whitespace-pre-wrap outline-none border-none ring-0 focus:outline-none focus:ring-0 [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:ring-0 prose-code:!bg-transparent prose-code:!border-none prose-code:!p-0 prose-code:!font-normal prose-code:before:!content-none prose-code:after:!content-none';

    const extensions = [
        StarterKit, TextStyle, Color, Image, FontFamily, FontSize,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: '"space" for AI, "/" for format' }),
    ];

    const termEditor = useEditor({
        extensions,
        content: card.term,
        onUpdate: ({ editor }) => updateCard(card.id, 'term', editor.getHTML()),
        onFocus: () => setActiveEditorType('term'),
        editorProps: { attributes: { class: editorClasses } }
    });

    const defEditor = useEditor({
        extensions,
        content: card.definition,
        onUpdate: ({ editor }) => updateCard(card.id, 'definition', editor.getHTML()),
        onFocus: () => setActiveEditorType('definition'),
        editorProps: { attributes: { class: editorClasses } }
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

    return (
        <div className="bg-[var(--layer2)] rounded-2xl border border-[var(--layer3)] transition-all duration-300 relative z-10
                        hover:z-50 hover:border-[var(--nice-blue)]
                        focus-within:z-50 focus-within:border-[var(--nice-blue)] focus-within:ring-2 focus-within:ring-[var(--nice-blue)] focus-within:scale-[1.02] focus-within:shadow-[0_10px_40px_rgba(var(--blue-rgb),0.15)]">

            <div className="flex items-center justify-between p-3 border-b border-[var(--layer3)] bg-[var(--layer1)]/50 rounded-t-2xl">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--layer2)] border border-[var(--layer3)] text-[var(--text)] font-bold text-sm shadow-sm">
                    {index + 1}
                </span>

                <div className="flex items-center gap-1">
                    <button className="group flex items-center gap-1.5 px-3 py-1.5 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors mr-2 cursor-pointer">
                        <Sparkles size={16} className="group-hover:animate-pulse" />
                        <span className="text-xs font-bold tracking-wide">POW bot</span>
                    </button>
                    <div className="w-px h-4 bg-[var(--layer3)] mx-1" />
                    <button onClick={handleSwap} title="Swap term and definition" className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-lg transition-colors cursor-pointer"><ArrowLeftRight size={16} /></button>
                    <button onClick={() => deleteCard(card.id)} disabled={totalCards <= 3} className={`p-2 rounded-lg transition-colors cursor-pointer ${totalCards <= 3 ? 'text-[var(--text-muted)]/30 cursor-not-allowed' : 'text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10'}`}><Trash2 size={16} /></button>
                    <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: "none" }} className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-lg transition-colors cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                    </div>
                </div>
            </div>

            <div className="border-b border-[var(--layer3)] bg-[var(--layer1)]/30 p-2 flex justify-center relative z-[60]">
                {activeEditor && <NotesToolbar editor={activeEditor} />}
            </div>

            <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="flex-1 flex gap-4">
                    <div className="flex flex-col gap-2 shrink-0">
                        <input type="file" ref={termFileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, termEditor)} />
                        <button onClick={() => termFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                            <ImageIcon size={14} /> Image
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                            <Mic size={14} /> Record
                        </button>
                    </div>
                    <div className="flex-1 relative cursor-text group" onClick={() => termEditor?.commands.focus()}>
                        <div className="w-full bg-transparent border-b-2 border-[var(--layer3)] pb-2 transition-colors min-h-[140px] outline-none ring-0 focus-within:border-[var(--nice-blue)] group-focus-within:border-[var(--nice-blue)]">
                            <EditorContent editor={termEditor} />
                        </div>
                        <span className={`absolute left-0 -bottom-6 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeEditorType === 'term' ? 'text-[var(--nice-blue)]' : 'text-[var(--text-muted)] group-focus-within:text-[var(--nice-blue)]'}`}>Term</span>
                    </div>
                </div>

                <div className="hidden md:block w-px bg-[var(--layer3)] self-stretch mx-2" />
                <div className="md:hidden h-px w-full bg-[var(--layer3)] my-4" />

                <div className="flex-1 flex gap-4">
                    <div className="flex flex-col gap-2 shrink-0">
                        <input type="file" ref={defFileInputRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, defEditor)} />
                        <button onClick={() => defFileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                            <ImageIcon size={14} /> Image
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--layer3)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                            <Mic size={14} /> Record
                        </button>
                    </div>
                    <div className="flex-1 relative cursor-text group" onClick={() => defEditor?.commands.focus()}>
                        <div className="w-full bg-transparent border-b-2 border-[var(--layer3)] pb-2 transition-colors min-h-[140px] outline-none ring-0 focus-within:border-[var(--nice-blue)] group-focus-within:border-[var(--nice-blue)]">
                            <EditorContent editor={defEditor} />
                        </div>
                        <span className={`absolute left-0 -bottom-6 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeEditorType === 'definition' ? 'text-[var(--nice-blue)]' : 'text-[var(--text-muted)] group-focus-within:text-[var(--nice-blue)]'}`}>Definition</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortableFlashcardItem({ card, index, updateCard, deleteCard, swapCard, totalCards }) {
    const controls = useDragControls();
    return (
        <Reorder.Item value={card} dragListener={false} dragControls={controls} className="relative z-10">
            <FlashcardRow index={index} card={card} updateCard={updateCard} deleteCard={deleteCard} swapCard={swapCard} totalCards={totalCards} dragControls={controls} />
        </Reorder.Item>
    );
}

// ─── MAIN MODAL COMPONENT ───────────────────────────────────────────────────
export default function CreateFlashcardModal({ onClose, handleSaveDeck }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showResetMenu, setShowResetMenu] = useState(false);

    const defaultCards = [
        { id: crypto.randomUUID(), term: 'SSD', definition: 'Solid State Drive uses flash memory to persistently save files and data.' },
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
            localStorage.setItem('pow_flashcard_draft', JSON.stringify({ title, description, cards }));
        }
    }, [title, description, cards, isLoaded]);

    const updateCard = (id, field, value) => setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    const addCard = () => setCards(prev => [...prev, { id: crypto.randomUUID(), term: '', definition: '' }]);
    const deleteCard = (id) => {
        if (cards.length <= 3) return;
        setCards(prev => prev.filter(c => c.id !== id));
    };
    const swapCard = (id) => setCards(prev => prev.map(c => c.id === id ? { ...c, term: c.definition, definition: c.term } : c));

    const onSave = () => {
        handleSaveDeck({ title, description, cards });
        localStorage.removeItem('pow_flashcard_draft');
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex justify-center items-start pt-10 pb-10 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--layer1)] rounded-2xl w-full max-w-5xl shadow-2xl border border-[var(--layer3)] flex flex-col mx-4 overflow-visible relative"
            >
                {/* FIX: Changed header to completely opaque background (bg-[var(--layer1)]) so scrolling items don't bleed through */}
                <div className="sticky top-0 z-[100] flex items-center justify-between bg-[var(--layer1)] px-6 py-4 rounded-t-2xl border-b border-[var(--layer3)] shadow-md">
                    <h1 className="text-xl font-bold text-[var(--text)]">Create flashcards</h1>

                    <div className="flex items-center gap-3 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowResetMenu(!showResetMenu)}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--layer3)] text-sm font-medium text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer"
                            >
                                <RotateCcw size={16} /> Reset
                            </button>

                            <AnimatePresence>
                                {showResetMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 right-0 w-48 bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
                                    >
                                        <button onClick={() => { setCards(defaultCards); setShowResetMenu(false); }} className="px-4 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--layer3)] transition-colors border-b border-[var(--layer3)] cursor-pointer">
                                            Reset Cards Only
                                        </button>
                                        <button onClick={() => { setTitle(''); setDescription(''); setShowResetMenu(false); }} className="px-4 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--layer3)] transition-colors border-b border-[var(--layer3)] cursor-pointer">
                                            Reset Title & Desc
                                        </button>
                                        <button onClick={() => { setTitle(''); setDescription(''); setCards(defaultCards); setShowResetMenu(false); }} className="px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
                                            Reset Everything
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={onSave}
                            disabled={!title.trim()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm
                                ${!title.trim() ? 'bg-teal-500/50 text-white/50 cursor-not-allowed' : 'bg-teal-500 text-black hover:bg-teal-400 hover:scale-105 cursor-pointer'}`}
                        >
                            <Check size={18} /> Save & Create
                        </button>
                        <div className="w-px h-6 bg-[var(--layer3)] mx-1" />
                        <button onClick={onClose} className="p-2 hover:bg-[var(--layer3)] hover:rotate-90 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-8">

                    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text)] mb-2">Title</label>
                            <input
                                type="text"
                                placeholder='Enter a title, like "Biology 101"'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl px-4 py-3.5 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--nice-blue)] focus:border-transparent transition-all shadow-inner outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--text)] mb-2">Description</label>
                            <textarea
                                placeholder="Add a description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl px-4 py-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--nice-blue)] focus:border-transparent transition-all min-h-[100px] resize-y shadow-inner outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--layer2)] p-2 rounded-2xl border border-[var(--layer3)] shadow-sm max-w-3xl mx-auto w-full">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input type="text" placeholder="Search terms/definitions" className="w-full bg-transparent border-none rounded-full pl-10 pr-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--nice-blue)] transition-all outline-none" />
                        </div>
                        <div className="flex items-center gap-2 pr-2">
                            <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer">
                                <Sparkles size={16} /> POW bot Complete
                            </button>
                            <div className="w-px h-4 bg-[var(--layer3)]" />
                            <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold text-[var(--text)] hover:bg-[var(--layer3)] transition-colors cursor-pointer">
                                <Download size={16} /> Import
                            </button>
                        </div>
                    </div>

                    {/* FIX: Safely calls the SortableFlashcardItem instead of generating hooks here */}
                    <Reorder.Group axis="y" values={cards} onReorder={setCards} className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                        <AnimatePresence>
                            {cards.map((card, index) => (
                                <SortableFlashcardItem key={card.id} card={card} index={index} updateCard={updateCard} deleteCard={deleteCard} swapCard={swapCard} totalCards={cards.length} />
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>

                    <div className="flex justify-center pt-4 pb-12 max-w-3xl mx-auto w-full">
                        <button onClick={addCard} className="flex items-center justify-center w-full py-5 rounded-2xl border-2 border-dashed border-[var(--layer3)] text-[var(--text)] font-bold hover:border-[var(--nice-blue)] hover:text-[var(--nice-blue)] hover:bg-[var(--nice-blue)]/5 hover:shadow-[0_0_20px_rgba(var(--blue-rgb),0.1)] transition-all group cursor-pointer">
                            <Plus className="mr-2 group-hover:scale-125 transition-transform" /> Add card
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}