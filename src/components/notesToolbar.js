'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    ChevronDown, Form, Pilcrow, Heading1, Heading2, Heading3,
    List, ListOrdered, ListTodo, Highlighter, Palette
} from 'lucide-react';
import toast from "react-hot-toast";
import ColorPickerDropdown, { isValidColor } from '../components/coloringTools';

const TEXT_TYPES = [
    { group: 'HIERARCHY', label: 'Paragraph', icon: Pilcrow, command: 'formatBlock', value: 'p' },
    { group: 'HIERARCHY', label: 'Heading 1',  icon: Heading1, command: 'formatBlock', value: 'h1' },
    { group: 'HIERARCHY', label: 'Heading 2',  icon: Heading2, command: 'formatBlock', value: 'h2' },
    { group: 'HIERARCHY', label: 'Heading 3',  icon: Heading3, command: 'formatBlock', value: 'h3' },
    { group: 'LISTS',     label: 'Bullet list',   icon: List,  command: 'insertUnorderedList', value: null },
    { group: 'LISTS',     label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList',   value: null },
    { group: 'LISTS',     label: 'Todo list',     icon: ListTodo,  command: null,                  value: 'todo' },
];

const FONT_SIZES = [
    { label: 'Smaller',     value: '1' },
    { label: 'Small',       value: '2' },
    { label: 'Medium',      value: '3' },
    { label: 'Large',       value: '4' },
    { label: 'Extra Large', value: '5' },
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

const Divider = () => <div className="w-[2px] h-8 bg-[var(--layer3)]" />;

export default function NotesToolbar({
                                         editorRef,
                                         onContentChange,
                                         isTextBold,        setIsTextBold,
                                         isTextItalic,      setIsTextItalic,
                                         isTextUnderlined,  setIsTextUnderlined,
                                         isTextStrikethrough, setIsTextStrikethrough,
                                         selectedTextType,  setSelectedTextType,
                                         onInsertHeading,   selectedHighlighter,
                                         onInsertTodo,      setSelectedHighlighter,
                                         onSelectionChange, isUserFocused
                                     }) {
    // ── font size tool ─────────────────────────────────────────────────────────────
    const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
    const [selectedFontSize, setSelectedFontSize] = useState(() => {
        if (typeof window === 'undefined') return 'Medium';
        return localStorage.getItem('pow_selectedFontSize') || 'Medium';
    });
    const fontSizeDropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(e.target))
                setIsFontSizeDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // ── font style tool ────────────────────────────────────────────────────────────
    const [isFontStyleDropdownOpen, setIsFontStyleDropdownOpen] = useState(false);
    const [selectedFontStyle, setSelectedFontStyle] = useState(() => {
        if (typeof window === 'undefined') return 'Inter';
        return localStorage.getItem('pow_selectedFontStyle') || 'Inter';
    });
    const fontStyleDropdownRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (fontStyleDropdownRef.current && !fontStyleDropdownRef.current.contains(e.target))
                setIsFontStyleDropdownOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // ── text type tool ────────────────────────────────────────────────────
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
        if (type.value === 'todo') {
            onInsertTodo?.();
        } else if (['h1', 'h2', 'h3'].includes(type.value)) {
            onInsertHeading?.(type.value);
        } else if (type.value) {
            document.execCommand(type.command, false, type.value);
            onContentChange();
        } else {
            document.execCommand(type.command, false, null);
            onContentChange();
        }
        setSelectedTextType(type.label);
        setIsTextTypeDropdownOpen(false);
    };

    // ── highlighter tool ────────────────────────────────────────────────────
    const [isHighlighterDropdownOpen, setIsHighlighterDropdownOpen] = useState(false);
    const highlighterDropdownRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [sliderHue, setSliderHue] = useState(0);
    const [boxSat, setBoxSat] = useState(100);
    const [boxVal, setBoxVal] = useState(100);
    const [isDraggingBox, setIsDraggingBox] = useState(false);
    const [colourHistory, setColourHistory] = useState([]);

    const colorBoxRef = useRef(null);

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
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
            if (isValidColor(selectedHighlighter)) {
                document.execCommand('hiliteColor', false, selectedHighlighter);
                onContentChange();
                return;
            }
        }

        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }

        setIsHighlighterDropdownOpen(!isHighlighterDropdownOpen);
    };

    const handleHighlightText = (e) => {
        e.preventDefault();

        if (!isValidColor(selectedHighlighter)) {
            toast.error('Please select a valid color.');
            return;
        }

        editorRef.current?.focus();
        const selection = window.getSelection();
        if (savedRangeRef.current) {
            selection.removeAllRanges();
            selection.addRange(savedRangeRef.current);
        }

        document.execCommand('hiliteColor', false, selectedHighlighter);

        setIsHighlighterDropdownOpen(false);
        onContentChange();
    };

    const handleBoxDrag = (e) => {
        if (!colorBoxRef.current) return;

        const { left, top, width, height } = colorBoxRef.current.getBoundingClientRect();

        let x = Math.max(0, Math.min((e.clientX - left) / width, 1));
        let y = Math.max(0, Math.min((e.clientY - top) / height, 1));

        const newSat = Math.round(x * 100);
        const newVal = Math.round((1 - y) * 100);

        setBoxSat(newSat);
        setBoxVal(newVal);

        const newHex = hsvToHex(sliderHue, newSat, newVal);
        setSelectedHighlighter(newHex);
    };

    const addColourToHistory = (hexColour) => {
        setColourHistory((prevHistory) => {
            const filteredHistory = prevHistory.filter((colour) => colour !== hexColour);
            const newHistory = [hexColour, ...filteredHistory];
            return newHistory.slice(0, 5);
        });
    };

    // ── Drag and Hold Logic ──
    useEffect(() => {
        if (!isDraggingBox) return;

        const handleMouseMove = (e) => {
            handleBoxDrag(e);
        };

        const handleMouseUp = () => {
            setIsDraggingBox(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingBox, sliderHue]);

    // ── Colour Palette tool ────────────────────────────────────────────────────
    const [isColourPickerDropdownOpen, setIsColourPickerDropdownOpen] = useState(false);

    return (
        <ul className="sticky bg-[var(--layer2)] border-2 border-[var(--layer3)] rounded-xl px-1 md:px-2 py-1 flex flex-wrap items-center gap-1">

            {/* Text formats e.g., headings and bullets */}
            <li className="relative" ref={textTypeDropdownRef}>
                <button
                    onClick={() => setIsTextTypeDropdownOpen(!isTextTypeDropdownOpen)}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2
                        ${isTextTypeDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {(() => {
                        const activeType = TEXT_TYPES.find(t => t.label === selectedTextType);
                        const Icon = activeType?.icon;
                        if (!selectedTextType) return <Form size={18} />;
                        if (typeof Icon === 'string') return <span className="font-bold text-xs w-5 text-center">{Icon}</span>;
                        return Icon ? <Icon size={18} /> : <Form size={18} />;
                    })()}

                    <ChevronDown size={12} />
                </button>

                {isTextTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[200px]">
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
                                            ${selectedTextType === type.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                                                    >
                                                                        <span className="text-xs opacity-50 w-5 font-mono flex items-center justify-center">
                                            {typeof IconComponent === 'string' ? (
                                                IconComponent
                                            ) : (
                                                <IconComponent size={14} />
                                            )}
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
                    onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
                    className={`flex items-center justify-between gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2 min-w-[80px]
                        ${isFontSizeDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {selectedFontSize}
                    <ChevronDown size={12} />
                </button>

                {isFontSizeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[200px]">
                        {FONT_SIZES.map(size => (
                            <button
                                key={size.value}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    document.execCommand('fontSize', false, size.value);
                                    setSelectedFontSize(size.label);
                                    localStorage.setItem('pow_selectedFontSize', size.label);
                                    setIsFontSizeDropdownOpen(false);
                                    onContentChange();
                                }}
                                className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                    ${selectedFontSize === size.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
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
                    onClick={() => setIsFontStyleDropdownOpen(!isFontStyleDropdownOpen)}
                    className={`flex items-center justify-between gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2 min-w-[80px]
                        ${isFontStyleDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    {selectedFontStyle}
                    <ChevronDown size={12} />
                </button>

                {isFontStyleDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[200px]">
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
                                            editorRef.current?.focus();
                                            document.execCommand('fontName', false, font.value);
                                            setSelectedFontStyle(font.label);
                                            localStorage.setItem('pow_selectedFontStyle', font.label);
                                            setIsFontStyleDropdownOpen(false);
                                            onContentChange();
                                        }}
                                        className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                            ${selectedFontStyle === font.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
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

            {/* bold tool */}
            <li className="relative group">
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Bold</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">B</span>
                </div>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.execCommand('bold');
                        setIsTextBold(!isTextBold);
                    }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2
                        ${isTextBold ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Bold size={18} />
                </button>
            </li>

            {/* italic tool */}
            <li className="relative group">
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Italic</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">I</span>
                </div>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.execCommand('italic');
                        setIsTextItalic(!isTextItalic);
                    }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2
                        ${isTextItalic ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Italic size={18} />
                </button>
            </li>

            {/* underline tool */}
            <li className="relative group">
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Underline</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">U</span>
                </div>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.execCommand('underline');
                        setIsTextUnderlined(!isTextUnderlined);
                    }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2
                        ${isTextUnderlined ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Underline size={18} />
                </button>
            </li>

            {/* strikethrough tool */}
            <li className="relative group">
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Strikethrough</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Shift</span>
                    <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">S</span>
                </div>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        document.execCommand('strikeThrough');
                        setIsTextStrikethrough(!isTextStrikethrough);
                    }}
                    className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-2
                        ${isTextStrikethrough ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                >
                    <Strikethrough size={18} />
                </button>
            </li>

            {/* highlighter tool */}
            <li className={'relative group'} ref={highlighterDropdownRef}>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Highlighter</span>
                </div>
                <button
                    id={'highlighter-btn'}
                    onClick={(e) => {
                        e.preventDefault();
                        const selection = window.getSelection();

                        if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
                            if (isValidColor(selectedHighlighter)) {
                                document.execCommand('hiliteColor', false, selectedHighlighter);
                                onContentChange();
                                return;
                            }
                        }

                        if (selection && selection.rangeCount > 0) {
                            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
                        }
                        setIsHighlighterDropdownOpen(!isHighlighterDropdownOpen);
                    }}
                    className={`flex items-center justify-center flex-col gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1.5
                        ${isHighlighterDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}>
                    <Highlighter size={18} />
                    <div
                        className="w-full h-1 rounded-sm border border-[var(--layer3)]"
                        style={{ backgroundColor: selectedHighlighter || 'transparent' }}
                    />
                </button>

                {isHighlighterDropdownOpen && (
                    <ColorPickerDropdown
                        activeColor={selectedHighlighter}
                        setActiveColor={setSelectedHighlighter}
                        onApplyColor={() => {
                            editorRef.current?.focus();
                            const selection = window.getSelection();
                            if (savedRangeRef.current) {
                                selection.removeAllRanges();
                                selection.addRange(savedRangeRef.current);
                            }
                            document.execCommand('hiliteColor', false, selectedHighlighter);
                            setIsHighlighterDropdownOpen(false);
                            onContentChange();
                        }}
                    />
                )}
            </li>

            <li className={'relative group'}>
                <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                    <span className="text-xs font-bold text-[var(--text)]">Colour Palette</span>
                </div>
                <button
                    className={`flex items-center justify-center flex-col gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1.5
                        ${isColourPickerDropdownOpen ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}>
                    <Palette size={18} />
                </button>

                {}
            </li>

        </ul>
    );
}