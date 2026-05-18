'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Tag, X, Plus, GripVertical } from 'lucide-react';
import NotesToolbar from '../../../../components/notesToolbar';
import CanvasLayoutModal from '../../../../components/canvasLayoutModal';
import CanvasInsertModal from '../../../../components/canvasInsertModal';
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function NotePage() {
    const router = useRouter();
    const { id } = useParams();
    const supabase = createClient();

    // ── core state ────────────────────────────────────────────────────────────
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [saveStatus, setSaveStatus] = useState('saved');
    const [loading, setLoading] = useState(true);
    const [hasChanged, setHasChanged] = useState(false);
    const [isAutosave, setIsAutosave] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('pow_autosave');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const saveTimer = useRef(null);
    const lastSavedContent = useRef('');
    const editorRef = useRef(null);

    // ── sidebar logic state ────────────────────────────────────────────────────
    const [hoveredBlock, setHoveredBlock] = useState(null);
    const [sidebarTop, setSidebarTop] = useState(-9999);
    const sidebarRef = useRef(null);

    // ── toolbar formatting state ──────────────────────────────────────────────
    const [isUserFocused, setIsUserFocused] = useState(false);
    const [isTextBold,          setIsTextBold]          = useState(false);
    const [isTextItalic,        setIsTextItalic]        = useState(false);
    const [isTextUnderlined,    setIsTextUnderlined]    = useState(false);
    const [isTextStrikethrough, setIsTextStrikethrough] = useState(false);
    const [selectedTextType,    setSelectedTextType]    = useState('Paragraph');
    const [selectedHighlighter, setSelectedHighlighter] = useState(null);

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

    // ── selection tracking ────────────────────────────────────────────────────
    const handleSelectionChange = () => {
        setIsTextBold(document.queryCommandState('bold'));
        setIsTextItalic(document.queryCommandState('italic'));
        setIsTextUnderlined(document.queryCommandState('underline'));
        setIsTextStrikethrough(document.queryCommandState('strikeThrough'));

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const node = selection.anchorNode;
            const block = node?.nodeType === 3 ? node.parentElement : node;
            const tag = block?.closest('h1,h2,h3,p,li')?.tagName?.toLowerCase();
            const labelMap = { h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', p: 'Paragraph', li: 'Bullet list' };
            if (tag && labelMap[tag]) setSelectedTextType(labelMap[tag]);
        }

        setIsUserFocused(document.activeElement!=null);
    };

    // ── keyboard shortcuts ────────────────────────────────────────────────────
    const handleKeyDown = (e) => {
        const isMod = e.ctrlKey || e.metaKey;

        if (isMod && e.key.toLowerCase() === 's' && !e.shiftKey) {
            e.preventDefault();
            save(title, content, tags);
            toast.success('Note saved!', toastStyle);
        }
        if (isMod && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            document.execCommand('strikeThrough');
            handleContentChange();
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

    // ── block insertion utility ───────────────────────────────────────────────
    const insertBlock = (newElement) => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let currentNode = range.endContainer;

            while (
                currentNode &&
                currentNode !== editorRef.current &&
                (currentNode.nodeType === 3 || window.getComputedStyle(currentNode).display.includes('inline'))
                ) {
                currentNode = currentNode.parentNode;
            }

            if (currentNode && currentNode !== editorRef.current) {
                currentNode.parentNode.insertBefore(newElement, currentNode.nextSibling);
            } else {
                editorRef.current.appendChild(newElement);
            }
        } else {
            editorRef.current.appendChild(newElement);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(newElement);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    };

    // ── heading insertion ─────────────────────
    const handleInsertHeading = (tag) => {
        const el = document.createElement(tag);
        const level = tag.replace('h', '');
        el.textContent = `Heading ${level}`;
        el.className = `pow-heading-placeholder outline-none`;

        insertBlock(el);
        handleContentChange();
    };

    // ── insertion ────────────────────────────────────────────────────────
    const handleInsertTodo = () => {
        const container = document.createElement('div');
        container.className = 'pow-todo-item flex items-start gap-3 my-2';

        const checkboxWrapper = document.createElement('span');
        checkboxWrapper.contentEditable = "false";
        checkboxWrapper.className = 'mt-1 flex items-center justify-center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'w-4 h-4 cursor-pointer accent-[var(--nice-blue)]';

        checkboxWrapper.appendChild(checkbox);

        const textSpan = document.createElement('div');
        textSpan.className = 'pow-todo-text flex-1 outline-none min-w-[50px]';
        textSpan.textContent = '\u200B';

        container.appendChild(checkboxWrapper);
        container.appendChild(textSpan);

        insertBlock(container);

        setTimeout(() => {
            const selection = window.getSelection();
            const newRange = document.createRange();
            newRange.selectNodeContents(textSpan);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }, 0);

        handleContentChange();
    };

    // ── Placeholder clear & focus utility ─────────────────────────────────────
    const clearPlaceholderAndFocus = (node) => {
        if (!node || !node.classList || !node.classList.contains('pow-heading-placeholder')) return;

        node.textContent = '\u200B';
        node.classList.remove('pow-heading-placeholder');

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        handleContentChange();
    };

    // ── Event Delegation for Editor ───────────────────────────────────────────
    const handleEditorClick = (e) => {
        // 1. Existing Todo logic...
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            const container = e.target.closest('.pow-todo-item');
            const textNode = container?.querySelector('.pow-todo-text');
            if (e.target.checked) {
                e.target.setAttribute('checked', 'checked');
                if (textNode) textNode.classList.add('line-through', 'opacity-50');
            } else {
                e.target.removeAttribute('checked');
                if (textNode) textNode.classList.remove('line-through', 'opacity-50');
            }
            handleContentChange();
        }

        const imageBox = e.target.closest('.pow-image-placeholder');
        if (imageBox) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';

            fileInput.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.contentEditable = "false";
                    imgWrapper.className = "my-4 relative";

                    const img = document.createElement('img');
                    img.src = readerEvent.target.result;
                    img.className = "max-w-full rounded-lg border border-[var(--layer3)]";

                    imgWrapper.appendChild(img);

                    if (imageBox.parentNode) {
                        imageBox.parentNode.replaceChild(imgWrapper, imageBox);
                        handleContentChange();
                    }
                };
                reader.readAsDataURL(file);
            };

            fileInput.click();
            return;
        }

        let node = e.target;
        if (node && node.nodeType === 3) node = node.parentElement;
        clearPlaceholderAndFocus(node);
    };

    const handleEditorKeyDown = (e) => {
        handleKeyDown(e);

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            if (node && node.nodeType === 3) node = node.parentElement;

            if (node && node.classList && node.classList.contains('pow-heading-placeholder')) {
                if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
                clearPlaceholderAndFocus(node);
            }
        }
    };

    // ── Hover Tracking & Sidebar UI Logic ─────────────────────────────────────
    const handleEditorMouseMove = (e) => {

        if (isCanvasLayoutModalOpen || isCanvasInsertModalOpen) return;

        if (!editorRef.current) return;

        if (sidebarRef.current && sidebarRef.current.contains(e.target)) return;

        let targetNode = e.target;
        if (targetNode === editorRef.current) {
            const mouseY = e.clientY;
            const children = Array.from(editorRef.current.children);
            const foundChild = children.find(child => {
                const rect = child.getBoundingClientRect();
                return mouseY >= rect.top && mouseY <= rect.bottom;
            });
            if (foundChild) {
                setHoveredBlock(foundChild);
                setSidebarTop(foundChild.offsetTop);
            } else {
                setHoveredBlock(null);
                setSidebarTop(-9999);
            }
            return;
        }
        let node = targetNode;
        while (node && node !== document.body) {
            if (node.parentElement === editorRef.current) {
                setHoveredBlock(node);
                setSidebarTop(node.offsetTop);
                return;
            }
            node = node.parentElement;
        }
        setHoveredBlock(null);
        setSidebarTop(-9999);
    };

    const handleEditorMouseLeave = () => {
        setHoveredBlock(null);
        setSidebarTop(-9999);
    };


    // ── autosave ──────────────────────────────────────────────────────────────
    const handleAutosaveToggle = () => {
        const newValue = !isAutosave;
        setIsAutosave(newValue);
        localStorage.setItem('pow_autosave', JSON.stringify(newValue));
    };

    // ── data fetching ─────────────────────────────────────────────────────────
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
        if (!loading && editorRef.current && editorRef.current.innerHTML === '') {
            editorRef.current.innerHTML = lastSavedContent.current;
        }
    }, [loading]);

    // ── save ──────────────────────────────────────────────────────────────────
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
        if (!isAutosave) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(newTitle, newContent, newTags), 1500);
    }, [save, isAutosave]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        debouncedSave(e.target.value, content, tags);
    };

    const handleContentChange = () => {
        if (!editorRef.current) return;
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

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = '';
        }
    }, [loading]);

    // ── floating buttons ────────────────────────────────────
    const [isCanvasLayoutModalOpen, setIsCanvasLayoutModalOpen] = useState(false);
    const [isCanvasInsertModalOpen, setIsCanvasInsertModalOpen] = useState(false);


    const layoutModalRef = useRef(null);
    const insertModalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isCanvasLayoutModalOpen && layoutModalRef.current && !layoutModalRef.current.contains(e.target)) {
                setIsCanvasLayoutModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCanvasLayoutModalOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isCanvasInsertModalOpen && insertModalRef.current && !insertModalRef.current.contains(e.target)) {
                setIsCanvasInsertModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCanvasInsertModalOpen]);

    // ── Image Block Insertion ────────────────────────────────────────────────
    const handleInsertImagePlaceholder = () => {
        if (!editorRef.current) return;

        const container = document.createElement('div');
        container.contentEditable = "false";
        container.className = 'pow-image-placeholder my-4 p-8 border-2 border-dashed border-[var(--layer3)] bg-[var(--layer1)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--layer3)] transition-all select-none group';

        container.innerHTML = `
            <div class="pointer-events-none flex flex-col items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mb-2 text-[var(--text-muted)] group-hover:text-[var(--nice-blue)] transition-colors"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span class="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Add an image</span>
                <span class="text-xs text-[var(--text-muted)] opacity-70 mt-1">Click to browse files</span>
            </div>
        `;

        if (hoveredBlock && hoveredBlock.parentNode === editorRef.current) {
            hoveredBlock.parentNode.insertBefore(container, hoveredBlock.nextSibling);
        } else {
            editorRef.current.appendChild(container);
        }

        const p = document.createElement('p');
        p.innerHTML = '<br>';
        container.parentNode.insertBefore(p, container.nextSibling);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loading) return (
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
        <main className="min-h-screen bg-[var(--layer2)] flex flex-col">

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
                    <button className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
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
                        <button onClick={() => save(title, content, tags)}
                                className="text-sm font-bold bg-[var(--nice-blue)] text-white px-3 py-1.5 rounded-lg cursor-pointer hover:scale-95 transition-transform">
                            Save
                        </button>
                    </div>
                )}
                <li>
                    <span className={`text-sm font-semibold transition-colors ${
                        saveStatus === 'saving'  ? 'text-[var(--nice-blue)]' :
                            saveStatus === 'unsaved' ? 'text-yellow-500' :
                                'text-[var(--text-muted)]'}`}>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Unsaved changes' : 'Saved'}
                    </span>
                </li>
            </ul>

            <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-0 py-10 flex flex-col gap-6">

                <input type="text" value={title} onChange={handleTitleChange} placeholder="Untitled"
                       className="w-full bg-transparent text-3xl md:text-4xl font-main text-[var(--text)] placeholder:text-[var(--layer3)] outline-none border-none resize-none"/>

                {/* ── toolbar ── */}
                <div className={'relative z-[40]'}>
                    <NotesToolbar
                        editorRef={editorRef}
                        onContentChange={handleContentChange}
                        isTextBold={isTextBold}               setIsTextBold={setIsTextBold}
                        isTextItalic={isTextItalic}           setIsTextItalic={setIsTextItalic}
                        isTextUnderlined={isTextUnderlined}   setIsTextUnderlined={setIsTextUnderlined}
                        isTextStrikethrough={isTextStrikethrough} setIsTextStrikethrough={setIsTextStrikethrough}
                        selectedTextType={selectedTextType}   setSelectedTextType={setSelectedTextType}
                        onInsertHeading={handleInsertHeading} selectedHighlighter={selectedHighlighter}
                        onInsertTodo={handleInsertTodo}       setSelectedHighlighter={setSelectedHighlighter}
                        onSelectionChange={handleSelectionChange} isUserFocused={isUserFocused}
                        hoveredBlock={hoveredBlock}           handleInsertImagePlaceholder={handleInsertImagePlaceholder}
                    />
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

                {/* ── Relative Editor Wrapper ── */}
                <div
                    className="relative w-full group/editor"
                    onMouseMove={handleEditorMouseMove}
                    onMouseLeave={handleEditorMouseLeave}
                >
                    {/* Floating Sidebar Buttons */}
                    <ul
                        ref={sidebarRef}
                        className={`absolute z-50 md:flex items-center gap-1.5 transition-all duration-150
                            md:opacity-0 md:pointer-events-none hidden
                            md:top-[var(--dynamic-top)] md:left-2
                            ${hoveredBlock ? 'md:!opacity-100 md:!pointer-events-auto' : ''}
                        `}
                        style={{
                            '--dynamic-top': sidebarTop !== -9999 ? `${sidebarTop}px` : '0px',
                        }}
                    >
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
                                <div
                                    ref={insertModalRef}
                                    onMouseLeave={() => setIsCanvasInsertModalOpen(false)}
                                    className="absolute top-0 left-8 z-50"
                                >
                                    <CanvasInsertModal
                                        editorRef={editorRef}
                                        hoveredBlock={hoveredBlock}
                                        handleInsertImagePlaceholder={handleInsertImagePlaceholder}
                                        onInsertTodo={handleInsertTodo}
                                        onInsertHeading={handleInsertHeading}
                                        onContentChange={handleContentChange}
                                    />
                                </div>
                            )}
                        </li>

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
                                <div
                                    ref={layoutModalRef}
                                    onMouseLeave={() => setIsCanvasLayoutModalOpen(false)}
                                    className="absolute top-0 left-8 z-50"
                                >
                                    <CanvasLayoutModal
                                        editorRef={editorRef}
                                        hoveredBlock={hoveredBlock}
                                    />
                                </div>
                            )}
                        </li>

                    </ul>

                    {/* Editor Canvas */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder="Start writing..."
                        onKeyDown={handleEditorKeyDown}
                        onClick={handleEditorClick}
                        onInput={handleContentChange}
                        onKeyUp={handleSelectionChange}
                        onMouseUp={handleSelectionChange}
                        onSelect={handleSelectionChange}
                        className="pow-editor w-full pl-14 pr-4 ml-6 min-h-[60vh] min-w-[40vw] bg-transparent text-[var(--text)] outline-none border-none leading-relaxed font-medium"
                    />
                </div>
            </div>
        </main>
    );
}