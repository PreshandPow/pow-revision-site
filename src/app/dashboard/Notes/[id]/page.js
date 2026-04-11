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
    ArrowLeft, Menu, Tag, X
} from 'lucide-react';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

const Divider = () => <div className="w-[1px] h-5 bg-[var(--layer1)]" />;

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

    const handleAutosaveToggle = () => {
        const newValue = !isAutosave;
        setIsAutosave(newValue);
        localStorage.setItem('pow_autosave', JSON.stringify(newValue));
    };

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
            setContent(note.content || '');
            lastSavedContent.current = note.content || '';
            setTags(note.tags || []);
            setLoading(false);
        };

        fetchNote();
    }, [id]);

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

    const handleContentChange = (e) => {
        setContent(e.target.value);
        debouncedSave(title, e.target.value, tags);
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

                <ul className="sticky bg-[var(--layer3)] border-2 border-[var(--layer1)] rounded-xl px-4 md:px-6 py-2 flex flex-wrap items-center gap-1">
                    <li>

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

                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start writing..."
                    className="w-full flex-1 min-h-[60vh] bg-transparent text-[var(--text)] placeholder:text-[var(--nice-blue)] outline-none border-none resize-none text-base leading-relaxed font-medium"
                />
            </div>
        </main>
    );
}