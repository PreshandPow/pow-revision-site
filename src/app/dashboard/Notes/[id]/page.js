'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Tag, X, Plus, GripVertical } from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Image as ImageExt } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';

import NotesToolbar from '../../../../components/notesToolbar';
import CanvasLayoutModal from '../../../../components/canvasLayoutModal';
import CanvasInsertModal from '../../../../components/canvasInsertModal';
import { ImagePlaceholder } from '../../../../lib/tiptap/imagePlaceholder';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function NotePage() {
    // ─── 1. GLOBAL SETUP & MISC ───────────────────────────────────────────────────
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

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

    // ─── 2. NOTE DATA & SAVING STATES ─────────────────────────────────────────────
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [saveStatus, setSaveStatus] = useState('saved');
    const [hasChanged, setHasChanged] = useState(false);
    const [isAutosave, setIsAutosave] = useState(true);
    const [wordCount, setWordCount] = useState(0);

    const saveTimer = useRef(null);
    const lastSavedContent = useRef('');
    const isAutosaveRef = useRef(true); // avoids stale closures inside onUpdate

    // ─── 3. SIDEBAR (floating block-insert menu) STATE ────────────────────────────
    // NOTE: previously tracked a raw DOM node (`hoveredBlock`). Tiptap works on
    // document positions instead, so we track an integer position in the doc.
    const [hoveredPos, setHoveredPos] = useState(null);
    const [sidebarTop, setSidebarTop] = useState(-9999);
    const sidebarRef = useRef(null);
    const editorWrapperRef = useRef(null);

    const [isCanvasLayoutModalOpen, setIsCanvasLayoutModalOpen] = useState(false);
    const [isCanvasInsertModalOpen, setIsCanvasInsertModalOpen] = useState(false);
    const layoutModalRef = useRef(null);
    const insertModalRef = useRef(null);

    // ─── 4. SAVE LOGIC ─────────────────────────────────────────────────────────────
    const save = useCallback(async (newTitle, newContent, newTags) => {
        setSaveStatus('saving');
        const { error } = await supabase
            .from('notes')
            .update({ title: newTitle, content: newContent, tags: newTags })
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
        if (!changed) { setSaveStatus('saved'); return; }
        setSaveStatus('unsaved');

        if (!isAutosaveRef.current) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(newTitle, newContent, newTags), 1500);
    }, [save]);

    // ─── 5. TIPTAP EDITOR ──────────────────────────────────────────────────────────
    const editor = useEditor({
        // Prevents the SSR/client markup mismatch
        immediatelyRender: false,
        // Recommended by Tiptap v3 docs so components reading editor state
        // (like our toolbar's useEditorState) stay in sync with every transaction.
        shouldRerenderOnTransaction: true,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            TextStyleKit,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            ImageExt.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg border border-[var(--layer3)]' } }),
            ImagePlaceholder,
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') return `Heading ${node.attrs.level}`;
                    return "Start writing...";
                },
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'pow-editor w-full min-h-[70vh] bg-transparent text-[var(--text)] outline-none border-none leading-relaxed font-medium',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setWordCount(editor.storage.characterCount?.words?.() ?? editor.getText().trim().split(/\s+/).filter(Boolean).length);
            debouncedSave(title, html, tags);
        },
    });

    // ─── 6. DATA FETCHING & EFFECTS ───────────────────────────────────────────────

    // Fetch autosave state from localstorage
    useEffect(() => {
        const savedAutosaveState = localStorage.getItem('pow_autosave');
        const val = savedAutosaveState === 'true';
        setIsAutosave(val);
        isAutosaveRef.current = val;
    }, []);

    // Fetch Note Data, then load it into the editor once ready
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
            lastSavedContent.current = note.content || '';
            setLoading(false);
        };
        fetchNote();
    }, [id]);

    // Populate editor once both the note data and the editor instance are ready
    useEffect(() => {
        if (!loading && editor && !editor.isDestroyed) {
            editor.commands.setContent(lastSavedContent.current || '');
        }
    }, [loading, editor]);

    // Body Overflow Lock while Loading
    useEffect(() => {
        document.body.style.overflow = loading ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [loading]);

    // Click Outside Listeners for Sidebar Modals
    useEffect(() => {
        const handleClickOutsideLayout = (e) => {
            if (isCanvasLayoutModalOpen && layoutModalRef.current && !layoutModalRef.current.contains(e.target)) {
                setIsCanvasLayoutModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideLayout);
        return () => document.removeEventListener('mousedown', handleClickOutsideLayout);
    }, [isCanvasLayoutModalOpen]);

    useEffect(() => {
        const handleClickOutsideInsert = (e) => {
            if (isCanvasInsertModalOpen && insertModalRef.current && !insertModalRef.current.contains(e.target)) {
                setIsCanvasInsertModalOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideInsert);
        return () => document.removeEventListener('mousedown', handleClickOutsideInsert);
    }, [isCanvasInsertModalOpen]);

    // Cleanup editor on unmount
    useEffect(() => {
        return () => { editor?.destroy(); };
    }, [editor]);

    // ─── 7. TITLE / TAG HANDLERS ───────────────────────────────────────────────────
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedSave(newTitle, editor?.getHTML() ?? lastSavedContent.current, tags);
    };

    const handleAddTag = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(',', '');
            if (!tags.includes(newTag)) {
                const newTags = [...tags, newTag];
                setTags(newTags);
                debouncedSave(title, editor?.getHTML(), newTags);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        const newTags = tags.filter(t => t !== tag);
        setTags(newTags);
        debouncedSave(title, editor?.getHTML(), newTags);
    };

    const handleAutosaveToggle = () => {
        const newValue = !isAutosave;
        setIsAutosave(newValue);
        isAutosaveRef.current = newValue;
        localStorage.setItem('pow_autosave', JSON.stringify(newValue));
    };

    // ─── 8. INSERT HELPERS ──────────────────────────────────────────────────────────
    // Internals now use Tiptap's chain API instead of raw DOM manipulation
    const handleInsertHeading = (tag) => {
        if (!editor) return;
        const level = Number(tag.replace('h', ''));
        editor.chain().focus().toggleHeading({ level }).run();
    };

    const handleInsertTodo = () => {
        if (!editor) return;
        editor.chain().focus().toggleTaskList().run();
    };

    const handleInsertImagePlaceholder = () => {
        if (!editor) return;
        editor.chain().focus().insertImagePlaceholder().run();
    };

    // ─── 9. KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────
    // this only needs to cover the shortcuts that aren't built into tiptap.
    const handleWrapperKeyDown = (e) => {
        const isMod = e.ctrlKey || e.metaKey;

        if (isMod && e.key.toLowerCase() === 's' && !e.shiftKey) {
            e.preventDefault();
            save(title, editor?.getHTML(), tags);
            toast.success('Note saved!', toastStyle);
        }
        if (isMod && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            handleAutosaveToggle();
        }
        if (isMod && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            const highlighterBtn = document.getElementById('highlighter-btn');
            if (highlighterBtn) highlighterBtn.click();
        }
    };

    // ─── 10. FLOATING SIDEBAR HOVER TRACKING ────────────────────────────────────────
    const handleEditorMouseMove = (e) => {
        if (!editor || isCanvasLayoutModalOpen || isCanvasInsertModalOpen) return;
        if (sidebarRef.current && sidebarRef.current.contains(e.target)) return;

        const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (!coords) return;

        const $pos = editor.state.doc.resolve(coords.pos);
        const blockStart = $pos.before(1);

        const blockCoords = editor.view.coordsAtPos(blockStart);
        const wrapperRect = editorWrapperRef.current?.getBoundingClientRect();
        if (!wrapperRect) return;

        setHoveredPos(blockStart);
        setSidebarTop(blockCoords.top - wrapperRect.top);
    };

    const handleEditorMouseLeave = (e) => {
        const x = e.clientX;
        const wrapperRect = editorWrapperRef.current?.getBoundingClientRect();
        if (!wrapperRect) return;
        if (x >= wrapperRect.left - 90 && x <= wrapperRect.left) return;

        setHoveredPos(null);
        setSidebarTop(-9999);
    };

    // ─── 11. RENDER ────────────────────────────────────────────────────────────────
    if (loading || !editor) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg className="animate-spin" width="40" height="40" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <path d="M16 4 A12 12 0 0 1 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                Getting the <span className="text-[var(--nice-blue)]">Note</span> ready for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">Fetching your data...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--layer2)] flex flex-col" onKeyDown={handleWrapperKeyDown}>

            {/* Top Navbar */}
            <ul className="sticky top-0 z-10 bg-[var(--layer1)] border-b border-[var(--layer3)] px-4 md:px-10 py-1.5 flex items-center justify-between gap-4">
                <li>
                    <button onClick={() => router.push('/dashboard/Notes')}
                            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer font-semibold text-sm">
                        <ArrowLeft size={16} /> Notes
                    </button>
                </li>
                <li>
                    <Link href="/" className="font-brand font-black tracking-tighter z-20 text-2xl text-[var(--nice-blue)]">POW</Link>
                </li>
                <li className="md:relative group">
                    <div className="absolute top-8 bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                        <span className="text-xs font-bold text-[var(--text)]">Toggle Autosave</span>
                        <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                        <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Shift</span>
                        <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">A</span>
                    </div>
                    <button className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer whitespace-nowrap"
                            onClick={handleAutosaveToggle}>
                        {isAutosave ? 'Autosave On' : 'Autosave Off'}
                    </button>
                </li>
                {!isAutosave && hasChanged && (
                    <div className="md:relative group">
                        <div className="absolute top-8 bottom-full mb-2 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-[var(--layer1)] border border-[var(--layer3)] rounded-lg shadow-lg whitespace-nowrap z-50">
                            <span className="text-xs font-bold text-[var(--text)]">Save</span>
                            <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">Ctrl</span>
                            <span className="text-[10px] bg-[var(--layer2)] px-1.5 py-0.5 rounded border border-[var(--layer3)] text-[var(--text-muted)] font-mono">S</span>
                        </div>
                        <button onClick={() => save(title, editor.getHTML(), tags)}
                                className="text-sm font-bold bg-[var(--nice-blue)] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:scale-95 transition-transform">
                            Save
                        </button>
                    </div>
                )}
                <li>
                    <span className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                        saveStatus === 'saving'  ? 'text-[var(--nice-blue)]' :
                            saveStatus === 'unsaved' ? 'text-yellow-500' :
                                'text-[var(--text-muted)]'}`}>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Unsaved changes' : 'Saved'}
                    </span>
                </li>
            </ul>

            <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-0 py-10 flex flex-col gap-6">

                {/* Title Input */}
                <input type="text" value={title} onChange={handleTitleChange} placeholder="Untitled"
                       className="w-full bg-transparent text-3xl md:text-4xl font-main text-[var(--text)] placeholder:text-[var(--layer3)] outline-none border-none resize-none"/>

                {/* Toolbar */}
                <div className="sticky top-[60px] z-[60] pb-2">
                    <NotesToolbar editor={editor} onInsertImage={handleInsertImagePlaceholder} />
                </div>

                {/* Tags */}
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
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                           placeholder="Add tag..." className="bg-transparent text-xs font-semibold text-[var(--text-muted)] placeholder:text-[var(--nice-blue)] outline-none border-none w-24" />
                </div>

                <div className="h-[1px] bg-[var(--nice-blue)]" />

                {/* Relative Editor Wrapper */}
                <div
                    ref={editorWrapperRef}
                    className="relative w-full group/editor"
                    onMouseMove={handleEditorMouseMove}
                    onMouseLeave={handleEditorMouseLeave}
                >
                    {/* Floating Sidebar */}
                    <ul
                        ref={sidebarRef}
                        className={`absolute z-50 md:flex items-center gap-1.5 hidden
                        md:opacity-0 md:pointer-events-none
                        md:transition-all md:duration-150
                        ${hoveredPos !== null ? 'md:!opacity-100 md:!pointer-events-auto' : ''}`}
                        style={{
                            top: sidebarTop !== -9999 ? `${sidebarTop}px` : '0px',
                            left: '-72px',
                            transform: 'translateY(-20%)',
                        }}
                    >
                        {/* Insert Modal Toggle */}
                        <li className="relative">
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    setIsCanvasInsertModalOpen(!isCanvasInsertModalOpen);
                                }}
                                className="text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--nice-blue)] rounded cursor-pointer transition-all p-1.5"
                            >
                                <Plus size={16} strokeWidth={2.5}/>
                            </button>

                            {isCanvasInsertModalOpen && (
                                <div ref={insertModalRef} onMouseLeave={() => setIsCanvasInsertModalOpen(false)} className="absolute top-0 left-8 z-50">
                                    <CanvasInsertModal
                                        editor={editor}
                                        hoveredPos={hoveredPos}
                                        handleInsertImagePlaceholder={handleInsertImagePlaceholder}
                                        onInsertTodo={handleInsertTodo}
                                        onInsertHeading={handleInsertHeading}
                                    />
                                </div>
                            )}
                        </li>

                        {/* Layout Modal Toggle */}
                        <li className="relative">
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    setIsCanvasLayoutModalOpen(!isCanvasLayoutModalOpen);
                                }}
                                className="text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--nice-blue)] rounded cursor-pointer transition-all p-1.5"
                            >
                                <GripVertical size={16} strokeWidth={2.5}/>
                            </button>

                            {isCanvasLayoutModalOpen && (
                                <div ref={layoutModalRef} onMouseLeave={() => setIsCanvasLayoutModalOpen(false)} className="absolute top-0 left-8 z-50">
                                    <CanvasLayoutModal
                                        editor={editor}
                                        hoveredPos={hoveredPos}
                                        toast={toast}
                                        toastStyle={toastStyle}
                                    />
                                </div>
                            )}
                        </li>
                    </ul>

                    {/* Editor Canvas */}
                    <EditorContent editor={editor} />
                </div>

                {/* Footer Word Count Stats */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] opacity-50 mt-4 pb-10">
                    <span>{wordCount} words</span>
                    <span>·</span>
                    <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                    <span>·</span>
                    <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>
        </main>
    );
}