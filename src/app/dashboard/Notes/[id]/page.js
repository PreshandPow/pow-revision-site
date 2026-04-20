'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Bold, Italic, Underline, Strikethrough, Code,
    Link as LinkIcon, Image, Minus, Undo, Redo, Printer,
    Highlighter, List, ListOrdered, Quote,
    ArrowLeft, Menu, Tag, X, ChevronDown
} from 'lucide-react';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

const FONT_SIZES = [
    { label: 'Smaller', value: '1' },
    { label: 'Small', value: '2' },
    { label: 'Medium', value: '3' },
    { label: 'Large', value: '4' },
    { label: 'Extra Large', value: '5' },
];

const FONT_STYLES = [
    { group: 'SANS SERIF', label: 'Arial', value: 'Arial' },
    { group: 'SANS SERIF', label: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { group: 'SANS SERIF', label: 'Verdana', value: 'Verdana, sans-serif' },
    { group: 'SERIF', label: 'Georgia', value: 'Georgia' },
    { group: 'SERIF', label: 'Garamond', value: 'Garamond, serif' },
    { group: 'SERIF', label: 'Times New Roman', value: 'Times New Roman, serif' },
    { group: 'MONOSPACE', label: 'Courier New', value: 'Courier New' },
    { group: 'MONOSPACE', label: 'Monaco', value: 'Monaco, monospace' },
];

const Divider = () => <div className="w-[2px] h-8 bg-[var(--layer3)]" />;

const ToolbarButton = ({ onClick, children, title }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="p-1.5 rounded-lg hover:bg-[var(--layer1)] cursor-pointer transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
    >
        {children}
    </button>
);


export default function NotePage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [saveStatus, setSaveStatus] = useState('saved');
    const [loading, setLoading] = useState(true);
    const saveTimer = useRef(null);
    const [isAutosave, setIsAutosave] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('pow_autosave');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [hasChanged, setHasChanged] = useState(false);

    const lastSavedContent = useRef('');

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

    const [savedSelection, setSavedSelection] = useState(null);

    const handleSelectionChange = () => {
        setIsTextBold(document.queryCommandState('bold'));

        const selection = window.getSelection();

        if (selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
            setSavedSelection(selection.getRangeAt(0).cloneRange())
        }   else {
            setSavedSelection(null);
        }
    };

    /toolbar states/
    const [isTextBold, setIsTextBold] = useState(false);
    const [isTextItalic, setIsTextItalic] = useState(false);
    const [isTextUnderlined, setIsTextUnderlined] = useState(false);
    const [isTextStrikethrough, setIsTextStrikethrough] = useState(false);

    const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
    const [selectedFontSize, setSelectedFontSize] = useState(() => {
        if (typeof window === 'undefined') return 'Medium';
        return localStorage.getItem('pow_selectedFontSize') || 'Medium';
    });

    const [isFontStyleDropdownOpen, setIsFontStyleDropdownOpen] = useState(false);
    const [selectedFontStyle, setSelectedFontStyle] = useState(() => {
        if (typeof window === 'undefined') return 'Inter';
        return localStorage.getItem('pow_selectedFontStyle') || 'Inter';
    });

    const handleAutosaveToggle = () => {
        const newValue = !isAutosave;
        setIsAutosave(newValue);
        localStorage.setItem('pow_autosave', JSON.stringify(newValue));
    };

    const handleFontSizeChange = () => {
        localStorage.setItem('pow_selectedFontSize', JSON.stringify(selectedFontSize));
    };

    const fontSizeDropdownRef = useRef(null);
    const fontStyleDropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (fontSizeDropdownRef.current && !fontSizeDropdownRef.current.contains(e.target)) {
                setIsFontSizeDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (fontStyleDropdownRef.current && !fontStyleDropdownRef.current.contains(e.target)) {
                setIsFontStyleDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const editorRef = useRef(null);

    useEffect(() => {
        const fetchNote = async () => {
            const { data: note, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                toast.error('Could not load note', toastStyle);
                router.replace('/dashboard/Notes');
                return;
            }

            setTitle(note.title || '');
            setTags(note.tags || []);

            setContent(note.content || '');
            lastSavedContent.current = note.content || '';


            setLoading(false);
        };

        fetchNote();
    }, [id]);

    useEffect(() => {
        if (!loading && editorRef.current) {
            if (editorRef.current.innerHTML === '') {
                editorRef.current.innerHTML = lastSavedContent.current;
            }
        }
    }, [loading]);

    const save = useCallback(async (newTitle, newContent, newTags) => {
        setSaveStatus('saving');
        const { error } = await supabase
            .from('notes')
            .update({
                title: newTitle,
                content: newContent,
                tags: newTags,
            })
            .eq('id', id);

        if (error) {
            toast.error('Could not save note', toastStyle);
            setSaveStatus('unsaved');
        } else {
            setSaveStatus('saved');
            setHasChanged(false);
            lastSavedContent.current = newContent;
        }
    }, [id]);

    const debouncedSave = useCallback((newTitle, newContent, newTags) => {
        const changed = newContent !== lastSavedContent.current;

        setHasChanged(changed);
        if (!changed) {
            setSaveStatus('saved');
            return;
        }

        setSaveStatus('unsaved');
        if (!isAutosave) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            save(newTitle, newContent, newTags);
        }, 1500);
    }, [save, isAutosave]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        debouncedSave(e.target.value, content, tags);
    };

    const handleContentChange = () => {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        debouncedSave(title, newContent, tags);
    };

    const handleAddTag = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(',', '');
            if (!tags.includes(newTag)) {
                const newTags = [...tags, newTag];
                setTags(newTags);
                debouncedSave(title, content, newTags);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        const newTags = tags.filter(t => t !== tag);
        setTags(newTags);
        debouncedSave(title, content, newTags);
    };

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg
                    className="animate-spin"
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                >
                    <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                    />
                    <path
                        d="M16 4 A12 12 0 0 1 28 16"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                Getting the <span className="text-[var(--nice-blue)]">Note</span> ready for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--layer2)] flex flex-col">
            <ul className={'sticky top-0 z-10 bg-[var(--layer1)] border-b border-[var(--layer3)] px-4 md:px-10 py-3 flex items-center justify-between gap-4'}>
                <li>
                    <button
                        onClick={() => router.push('/dashboard/Notes')}
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer font-semibold text-sm"
                    >
                        <ArrowLeft size={16} />
                        Notes
                    </button>
                </li>

                <li>
                    <Link href="/" className="font-brand font-black tracking-tighter z-20 text-2xl text-[var(--nice-blue)]">
                        POW
                    </Link>
                </li>

                <li>
                    <button
                        className={'text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer'}
                        onClick={handleAutosaveToggle}>
                        {isAutosave ? 'Autosave On' : 'Autosave Off'}
                    </button>
                </li>

                {!isAutosave && hasChanged && (
                    <button
                        onClick={() => save(title, content, tags)}
                        className="text-sm font-bold bg-[var(--nice-blue)] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:scale-95 transition-transform"
                    >
                        Save
                    </button>
                )}

                <li>
                    <span className={`text-sm font-semibold transition-colors ${
                        saveStatus === 'saving' ? 'text-[var(--nice-blue)]' :
                            saveStatus === 'unsaved' ? 'text-yellow-500' :
                                'text-[var(--text-muted)]'
                    }`}>
                {saveStatus === 'saving' ? 'Saving...' :
                    saveStatus === 'unsaved' ? 'Unsaved changes' :
                        'Saved'}
                </span>
                </li>
            </ul>

            <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-0 py-10 flex flex-col gap-6">

                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled"
                    className="w-full bg-transparent text-3xl md:text-4xl font-bold text-[var(--text)] placeholder:text-[var(--layer3)] outline-none border-none resize-none"
                />

                <ul className="sticky bg-[var(--layer2)] border-2 border-[var(--layer3)] rounded-xl px-1 md:px-2 py-1 flex flex-wrap items-center gap-1">
                    <li className={'relative'} ref={fontSizeDropdownRef}>
                        <button
                            onClick={() => setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen)}
                            className="flex items-center justify-between gap-1 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1 min-w-[80px]">
                            {selectedFontSize}
                            <ChevronDown size={12}/>
                        </button>
                        {isFontSizeDropdownOpen && (
                            <div className={'absolute top-full left-0 mt-1 w-36 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[200px]'}>
                                {FONT_SIZES.map(size => (
                                    <button
                                        key={size.value}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.execCommand('fontSize', false, size.value);
                                            setSelectedFontSize(size.label);
                                            localStorage.setItem('pow_selectedFontSize', size.label);
                                            setIsFontSizeDropdownOpen(false);
                                            handleContentChange();
                                        }}
                                        className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]
                                        ${selectedFontSize === size.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}
                                        ${size.value}`}>
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </li>

                    <li className="relative" ref={fontStyleDropdownRef}>
                        <button
                            onClick={() => setIsFontStyleDropdownOpen(!isFontStyleDropdownOpen)}
                            className="flex items-center justify-between gap-1 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1 min-w-[80px]"
                        >
                            {selectedFontStyle}
                            <ChevronDown size={12} />
                        </button>
                        {isFontStyleDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[200px]">
                                {Object.groupBy ? (
                                    ['SANS SERIF', 'SERIF', 'MONOSPACE'].map(group => (
                                        <div key={group}>
                                            <p className="px-4 py-1 text-xs font-bold text-[var(--text-muted)] opacity-50 tracking-widest">
                                                {group}
                                            </p>
                                            {FONT_STYLES.filter(f => f.group === group).map(font => (
                                                <button
                                                    key={font.label}
                                                    type="button"
                                                    style={{ fontFamily: font.value }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        editorRef.current.focus();
                                                        document.execCommand('fontName', false, font.value);
                                                        setSelectedFontStyle(font.label);
                                                        localStorage.setItem('pow_selectedFontStyle', font.label);
                                                        setIsFontStyleDropdownOpen(false);
                                                        handleContentChange();
                                                    }}
                                                    className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)] ${font.value}
                                    ${selectedFontStyle === font.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                                >
                                                    {font.label}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    FONT_STYLES.map(font => (
                                        <button
                                            key={font.label}
                                            type="button"
                                            onClick={() => {
                                                setSelectedFontStyle(font.label);
                                                localStorage.setItem('pow_selectedFontStyle', font.label);
                                                setIsFontStyleDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)] ${font.value}
                                        ${selectedFontStyle === font.label ? 'text-[var(--nice-blue)] font-semibold' : 'text-[var(--text-muted)]'}`}
                                        >
                                            {font.label}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </li>

                    <Divider />

                    <li className={'relative group'}>
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
                            className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1
                                ${isTextBold ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                            >
                            <Bold size={18} />
                        </button>
                    </li>

                    <li className={'relative group'}>
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
                            className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1
                                ${isTextItalic ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                        >
                            <Italic size={18} />
                        </button>
                    </li>

                    <li className={'relative group'}>
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
                            className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1
                                ${isTextUnderlined ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                        >
                            <Underline size={18} />
                        </button>
                    </li>

                    <li className={'relative group'}>
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                            <span className="text-xs font-bold text-[var(--text)]">Strikethrough</span>
                            <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                            <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono"></span>
                            <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono"></span>
                        </div>
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                document.execCommand('strikeThrough');
                                setIsTextStrikethrough(!isTextStrikethrough);
                            }}
                            className={`flex items-center justify-center gap-1 text-sm font-semibold hover:text-[var(--text)] hover:bg-[var(--layer3)] rounded-sm cursor-pointer transition-colors px-2 py-1
                                ${isTextStrikethrough ? 'bg-[var(--layer3)] text-[var(--text)]' : 'bg-transparent text-[var(--text-muted)]'}`}
                        >
                            <Strikethrough size={18} />
                        </button>
                    </li>

                </ul>

                <div className="flex flex-wrap items-center gap-2">
                    <Tag size={14} className="text-[var(--text-muted)]" />
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs font-semibold bg-[var(--layer1)] border border-[var(--layer3)] text-[var(--text-muted)] px-2 py-1 rounded-lg">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="cursor-pointer hover:text-red-400 transition-colors">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag..."
                        className="bg-transparent text-xs font-semibold text-[var(--text-muted)] placeholder:text-[var(--nice-blue)] outline-none border-none w-24"
                    />
                </div>

                <div className="h-[1px] bg-[var(--nice-blue)]" />

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleContentChange}
                    onKeyUp={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onSelect={handleSelectionChange}
                    data-placeholder="Start writing..."
                    className={`w-full flex-1 min-h-[60vh] bg-transparent text-[var(--text)] outline-none border-none leading-relaxed font-medium`}
                />
            </div>
        </main>
    );
}