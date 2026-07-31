'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough,
    ChevronDown, Form, Pilcrow, Heading1, Heading2, Heading3,
    List, ListOrdered, ListTodo, Highlighter, Palette, Eraser,
    AlignCenter, AlignRight, AlignLeft, AlignJustify, Image,
    Undo, Redo
} from 'lucide-react';
import ColorPickerDropdown, { isValidColor } from '../components/coloringTools';

const TEXT_TYPES = [
    { group: 'HIERARCHY', label: 'Paragraph', icon: Pilcrow, value: 'p' },
    { group: 'HIERARCHY', label: 'Heading 1',  icon: Heading1, value: 'h1' },
    { group: 'HIERARCHY', label: 'Heading 2',  icon: Heading2, value: 'h2' },
    { group: 'HIERARCHY', label: 'Heading 3',  icon: Heading3, value: 'h3' },
    { group: 'LISTS',     label: 'Bullet list',   icon: List,      value: 'bulletList' },
    { group: 'LISTS',     label: 'Numbered list', icon: ListOrdered, value: 'orderedList' },
    { group: 'LISTS',     label: 'Todo list',     icon: ListTodo,  value: 'taskList' },
];

const FONT_SIZES = [
    { label: 'Smaller',     value: '12px' },
    { label: 'Small',       value: '14px' },
    { label: 'Medium',      value: '16px' },
    { label: 'Large',       value: '20px' },
    { label: 'Extra Large', value: '28px' },
];

const FONT_STYLES = [
    { group: 'SANS SERIF', label: 'Arial',           value: 'Arial' },
    { group: 'SANS SERIF', label: 'Inter',           value: 'Inter, system-ui, sans-serif' },
    { group: 'SANS SERIF', label: 'Verdana',         value: 'Verdana, sans-serif' },
    { group: 'SERIF',      label: 'Georgia',         value: 'Georgia' },
    { group: 'SERIF',      label: 'Garamond',        value: 'Garamond, serif' },
    { group: 'SERIF',      label: 'Times New Roman', value: 'Times New Roman, serif' },
    { group: 'MONOSPACE',  label: 'Courier New',     value: 'Courier New' },
    { group: 'MONOSPACE',  label: 'Monaco',          value: 'Monaco, monospace' },
];

const TEXT_ALIGNMENTS = [
    { label: 'left',    icon: AlignLeft,    value: 'left' },
    { label: 'center',  icon: AlignCenter,  value: 'center' },
    { label: 'right',   icon: AlignRight,   value: 'right' },
    { label: 'Justify', icon: AlignJustify, value: 'justify' },
];

const Divider = () => <div className="w-[2px] h-8 bg-[var(--layer3)]" />;

function getActiveTextTypeLabel(editor) {
    for (const type of TEXT_TYPES) {
        if (type.value === 'p' && editor.isActive('paragraph') && !editor.isActive('bulletList')
            && !editor.isActive('orderedList') && !editor.isActive('taskList')) return type.label;
        if (['h1', 'h2', 'h3'].includes(type.value) && editor.isActive('heading', { level: Number(type.value[1]) })) return type.label;
        if (type.value === 'bulletList' && editor.isActive('bulletList')) return type.label;
        if (type.value === 'orderedList' && editor.isActive('orderedList')) return type.label;
        if (type.value === 'taskList' && editor.isActive('taskList')) return type.label;
    }
    return 'Paragraph';
}

export default function NotesToolbar({ editor, onInsertImage }) {
    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            isBold: ctx.editor.isActive('bold'),
            isItalic: ctx.editor.isActive('italic'),
            isUnderline: ctx.editor.isActive('underline'),
            isStrike: ctx.editor.isActive('strike'),
            highlightColor: ctx.editor.getAttributes('highlight').color || null,
            textColor: ctx.editor.getAttributes('textStyle').color || null,
            fontSize: ctx.editor.getAttributes('textStyle').fontSize || null,
            fontFamily: ctx.editor.getAttributes('textStyle').fontFamily || null,
            textType: getActiveTextTypeLabel(ctx.editor),
            alignment: TEXT_ALIGNMENTS.find(a => ctx.editor.isActive({ textAlign: a.value }))?.label || 'left',
        }),
    });

    const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
    const fontSizeDropdownRef = useRef(null);
    const selectedFontSizeLabel = FONT_SIZES.find(f => f.value === editorState.fontSize)?.label || 'Medium';

    useEffect(() => {
        const h = (e) => {
            if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(e.target))
                setIsFontSizeDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const [isFontStyleDropdownOpen, setIsFontStyleDropdownOpen] = useState(false);
    const fontStyleDropdownRef = useRef(null);
    const selectedFontStyleLabel = FONT_STYLES.find(f => f.value === editorState.fontFamily)?.label || 'Inter';

    useEffect(() => {
        const h = (e) => {
            if (fontStyleDropdownRef.current && !fontStyleDropdownRef.current.contains(e.target))
                setIsFontStyleDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const [isTextTypeDropdownOpen, setIsTextTypeDropdownOpen] = useState(false);
    const textTypeDropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (textTypeDropdownRef.current && !textTypeDropdownRef.current.contains(e.target))
                setIsTextTypeDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleTextTypeSelect = (type) => {
        const chain = editor.chain().focus();
        switch (type.value) {
            case 'p': chain.setParagraph().run(); break;
            case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
            case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
            case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
            case 'bulletList': chain.toggleBulletList().run(); break;
            case 'orderedList': chain.toggleOrderedList().run(); break;
            case 'taskList': chain.toggleTaskList().run(); break;
        }
        setIsTextTypeDropdownOpen(false);
    };

    const [isHighlighterDropdownOpen, setIsHighlighterDropdownOpen] = useState(false);
    const highlighterDropdownRef = useRef(null);
    const [pendingHighlightColor, setPendingHighlightColor] = useState(null);

    useEffect(() => {
        const h = (e) => {
            if (highlighterDropdownRef.current && !highlighterDropdownRef.current.contains(e.target))
                setIsHighlighterDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleHighlighterButtonClick = (e) => {
        e.preventDefault();
        const hasSelection = !editor.state.selection.empty;

        if (hasSelection && isValidColor(pendingHighlightColor)) {
            editor.chain().focus().toggleHighlight({ color: pendingHighlightColor }).run();
            return;
        }

        setIsHighlighterDropdownOpen(!isHighlighterDropdownOpen);
    };

    const [isColourPickerDropdownOpen, setIsColourPickerDropdownOpen] = useState(false);
    const [pendingTextColor, setPendingTextColor] = useState(null);
    const textColorDropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (textColorDropdownRef.current && !textColorDropdownRef.current.contains(e.target))
                setIsColourPickerDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const [isAlignmentsDropdownOpen, setIsAlignmentsDropdownOpen] = useState(false);
    const alignmentsDropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (alignmentsDropdownRef.current && !alignmentsDropdownRef.current.contains(e.target))
                setIsAlignmentsDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        document.body.style.overflow = (isHighlighterDropdownOpen || isColourPickerDropdownOpen) ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isHighlighterDropdownOpen, isColourPickerDropdownOpen]);

    if (!editor) return null;

    return (
        <ul className="bg-[var(--layer1)] border-2 border-[var(--layer3)] rounded-xl px-1 md:px-2 py-1
            flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible items-center gap-1 [&::-webkit-scrollbar]:hidden
             [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Text formats e.g., headings and bullets */}
            <li className="relative" ref={textTypeDropdownRef}>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsTextTypeDropdownOpen(!isTextTypeDropdownOpen)}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2
                        ${isTextTypeDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {(() => {
                        const activeType = TEXT_TYPES.find(t => t.label === editorState.textType);
                        const Icon = activeType?.icon || Form;
                        return <Icon size={18} />;
                    })()}
                    <ChevronDown size={12} />
                </button>

                {isTextTypeDropdownOpen && (
                    <div className="fixed bottom-0 left-0 w-full pb-8 md:pb-1 md:absolute md:bottom-auto md:top-full
                            md:left-0 md:w-auto mt-1 bg-[var(--layer2)] border-t md:border border-[var(--layer3)]
                            rounded-t-2xl md:rounded-sm overflow-hidden z-[100] py-4 md:py-1
                            shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-lg min-w-[240px]"
                    >
                        {['HIERARCHY', 'LISTS'].map(group => (
                            <div key={group}>
                                <p className="px-4 py-1 text-xs font-bold text-[var(--text-muted)] opacity-50 tracking-widest">
                                    {group}
                                </p>
                                {TEXT_TYPES.filter(t => t.group === group).map(type => {
                                    const IconComponent = type.icon;
                                    return (
                                        <button
                                            key={type.label}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleTextTypeSelect(type);
                                            }}
                                            className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)] flex items-center gap-3
                                            ${editorState.textType === type.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                        >
                                            <span className="text-xs opacity-50 w-5 font-mono flex items-center justify-center">
                                                <IconComponent size={14} />
                                            </span>
                                            <span className={
                                                type.value === 'h1' ? 'text-2xl font-bold' :
                                                    type.value === 'h2' ? 'text-xl font-bold' :
                                                        type.value === 'h3' ? 'text-lg font-bold' :
                                                            'text-sm'
                                            }>
                                                {type.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </li>

            {/* font size */}
            <li className="relative" ref={fontSizeDropdownRef}>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
                    className={`flex items-center justify-between gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2 min-w-[80px]
                        ${isFontSizeDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {selectedFontSizeLabel}
                    <ChevronDown size={12} />
                </button>

                {isFontSizeDropdownOpen && (
                    <div className="fixed bottom-0 left-0 w-full pb-8 md:pb-1 md:absolute md:bottom-auto md:top-full
                            md:left-0 md:w-auto mt-1 bg-[var(--layer2)] border-t md:border border-[var(--layer3)]
                            rounded-t-2xl md:rounded-sm overflow-hidden z-[100] py-4 md:py-1
                            shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-lg min-w-[180px]"
                    >
                        {FONT_SIZES.map(size => (
                            <button
                                key={size.value}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    editor.chain().focus().setFontSize(size.value).run();
                                    setIsFontSizeDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                    ${selectedFontSizeLabel === size.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                            >
                                {size.label}
                            </button>
                        ))}
                    </div>
                )}
            </li>

            {/* font style */}
            <li className="relative" ref={fontStyleDropdownRef}>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsFontStyleDropdownOpen(!isFontStyleDropdownOpen)}
                    className={`flex items-center justify-between gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2 min-w-[80px]
                        ${isFontStyleDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {selectedFontStyleLabel}
                    <ChevronDown size={12} />
                </button>

                {isFontStyleDropdownOpen && (
                    <div className="fixed bottom-0 left-0 w-full pb-8 md:pb-1 md:absolute md:bottom-auto md:top-full
                            md:left-0 md:w-auto mt-1 bg-[var(--layer2)] border-t md:border border-[var(--layer3)]
                            rounded-t-2xl md:rounded-sm overflow-hidden z-[100] py-4 md:py-1
                            shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-lg min-w-[180px]"
                    >
                        {['SANS SERIF', 'SERIF', 'MONOSPACE'].map(group => (
                            <div key={group}>
                                <p className="px-4 py-1 text-xs font-bold text-[var(--text-muted)] opacity-50 tracking-widest">
                                    {group}
                                </p>
                                {FONT_STYLES.filter(f => f.group === group).map(font => (
                                    <button
                                        key={font.label}
                                        type="button"
                                        style={{ fontFamily: font.value }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor.chain().focus().setFontFamily(font.value).run();
                                            setIsFontStyleDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                            ${selectedFontStyleLabel === font.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </li>

            <Divider />

            {/* alignments */}
            <li className="md:relative group" ref={alignmentsDropdownRef}>
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Alignments</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.preventDefault();
                        setIsAlignmentsDropdownOpen(!isAlignmentsDropdownOpen);
                    }}
                    className={`flex items-center justify-between gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2 min-w-[80px]
                        ${isAlignmentsDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {(() => {
                        const activeType = TEXT_ALIGNMENTS.find(t => t.label === editorState.alignment);
                        const Icon = activeType?.icon || AlignLeft;
                        return <Icon size={18} />;
                    })()}
                    <span>{editorState.alignment}</span>
                    <ChevronDown size={12} />
                </button>

                {isAlignmentsDropdownOpen && (
                    <div className="fixed bottom-0 left-0 w-full pb-8 md:pb-1 md:absolute md:bottom-auto md:top-full
                            md:left-0 md:w-auto mt-1 bg-[var(--layer2)] border-t md:border border-[var(--layer3)]
                            rounded-t-2xl md:rounded-sm overflow-hidden z-[100] py-4 md:py-1
                            shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-lg min-w-[180px]"
                    >
                        {TEXT_ALIGNMENTS.map(alignment => {
                            const Icon = alignment.icon;
                            return (
                                <button
                                    key={alignment.label}
                                    type="button"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        editor.chain().focus().setTextAlign(alignment.value).run();
                                        setIsAlignmentsDropdownOpen(false);
                                    }}
                                    className={`flex gap-2 w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                    ${editorState.alignment === alignment.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                >
                                    <span className="font-bold text-xs w-5 text-center"><Icon size={18}/></span>
                                    <span className="text-sm">{alignment.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </li>

            {/* bold tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Bold</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">B</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold 
                        md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 
                        rounded-sm cursor-pointer transition-all px-2 py-2
                        ${editorState.isBold ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Bold size={18} />
                </button>
            </li>

            {/* italic tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Italic</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">I</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2 
                        ${editorState.isItalic ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Italic size={18} />
                </button>
            </li>

            {/* underline tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Underline</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">U</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                           active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2
                        ${editorState.isUnderline ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Underline size={18} />
                </button>
            </li>

            {/* strikethrough tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Strikethrough</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Shift</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">S</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2
                        ${editorState.isStrike ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Strikethrough size={18} />
                </button>
            </li>

            {/* highlighter tool */}
            <li className={'relative group'} ref={highlighterDropdownRef}>
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Highlighter</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">H</span>
                </div>
                <button
                    id={'highlighter-btn'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleHighlighterButtonClick}
                    className={`flex items-center justify-center flex-col gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-1.5
                        ${editorState.highlightColor || isHighlighterDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}>
                    <Highlighter size={16} />
                    <div
                        className="w-full h-1 rounded-sm border border-[var(--layer3)]"
                        style={{ backgroundColor: editorState.highlightColor || pendingHighlightColor || 'transparent' }}
                    />
                </button>

                {isHighlighterDropdownOpen && (
                    <ColorPickerDropdown
                        activeColor={pendingHighlightColor}
                        setActiveColor={setPendingHighlightColor}
                        onApplyColor={() => {
                            editor.chain().focus().toggleHighlight({ color: pendingHighlightColor }).run();
                            setIsHighlighterDropdownOpen(false);
                        }}
                    />
                )}
            </li>

            {/* Colour palette tool */}
            <li className={'relative group'} ref={textColorDropdownRef}>
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Colour Palette</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.preventDefault();
                        const hasSelection = !editor.state.selection.empty;
                        if (hasSelection && isValidColor(pendingTextColor)) {
                            editor.chain().focus().setColor(pendingTextColor).run();
                            return;
                        }
                        setIsColourPickerDropdownOpen(!isColourPickerDropdownOpen);
                    }}
                    className={`flex items-center justify-center flex-col gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-1.5
                        ${editorState.textColor || isColourPickerDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}>
                    <Palette size={16} />
                    <div
                        className="w-full h-1 rounded-sm border border-[var(--layer3)]"
                        style={{ backgroundColor: editorState.textColor || pendingTextColor || 'transparent' }}
                    />
                </button>

                {isColourPickerDropdownOpen && (
                    <ColorPickerDropdown
                        activeColor={pendingTextColor}
                        setActiveColor={setPendingTextColor}
                        onApplyColor={() => {
                            editor.chain().focus().setColor(pendingTextColor).run();
                            setIsColourPickerDropdownOpen(false);
                        }}
                    />
                )}
            </li>

            {/* Eraser / Clear Formatting tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Clear Formatting</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().unsetAllMarks().unsetHighlight().clearNodes().run();
                        setPendingHighlightColor(null);
                        setPendingTextColor(null);
                    }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
            active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2 bg-transparent text-[var(--text-muted)]`}
                >
                    <Eraser size={18} />
                </button>
            </li>

            {/* image tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Add Image</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); onInsertImage?.(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2`}
                >
                    <span><Image size={18} /></span>
                </button>
            </li>

            {/* undo tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Undo</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2`}
                >
                    <Undo size={18} />
                </button>
            </li>

            {/* redo tool */}
            <li className="md:relative group">
                <div
                    className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5
                    bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50"
                >
                    <span className="text-xs font-bold text-[var(--text)]">Redo</span>
                </div>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold md:hover:text-[var(--text)] md:hover:bg-[var(--layer3)] 
                        active:bg-[var(--layer3)] active:scale-95 rounded-sm cursor-pointer transition-all px-2 py-2`}
                >
                    <Redo size={18} />
                </button>
            </li>

        </ul>
    );
}