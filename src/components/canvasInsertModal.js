'use client';

import {
    Image,
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListTodo, Pilcrow
} from 'lucide-react';

// ─── 1. CONSTANTS ─────────────────────────────────────────────────────────────
const TEXT_TYPES = [
    { group: 'HIERARCHY', label: 'Paragraph', icon: Pilcrow,     value: 'p' },
    { group: 'HIERARCHY', label: 'Heading 1',  icon: Heading1,   value: 'h1' },
    { group: 'HIERARCHY', label: 'Heading 2',  icon: Heading2,   value: 'h2' },
    { group: 'HIERARCHY', label: 'Heading 3',  icon: Heading3,   value: 'h3' },
    { group: 'LISTS',     label: 'Bullet list',   icon: List,        value: 'bulletList' },
    { group: 'LISTS',     label: 'Numbered list', icon: ListOrdered, value: 'orderedList' },
    { group: 'LISTS',     label: 'Todo list',     icon: ListTodo,    value: 'taskList' },
];

export default function CanvasInsertModal({ editor, hoveredPos, handleInsertImagePlaceholder }) {

    // ─── 2. ACTION HANDLERS ───────────────────────────────────────────────────────
    const handleTextTypeSelect = (type) => {
        if (!editor) return;

        // If the sidebar was opened from a hovered block, put the cursor there
        // first so the format applies to that block rather than wherever the
        // user's selection happened to be last
        const chain = hoveredPos !== null
            ? editor.chain().focus().setTextSelection(hoveredPos + 1)
            : editor.chain().focus();

        switch (type.value) {
            case 'p': chain.setParagraph().run(); break;
            case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
            case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
            case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
            case 'bulletList': chain.toggleBulletList().run(); break;
            case 'orderedList': chain.toggleOrderedList().run(); break;
            case 'taskList': chain.toggleTaskList().run(); break;
        }
    };

    // ─── 3. RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className="w-56 bg-[var(--layer2)] border border-[var(--layer1)] rounded-lg shadow-2xl p-2">
            <div className="flex flex-col gap-1">

                {/* Format Section */}
                <div>
                    <h2 className="font-bold text-[var(--text)] text-sm p-2">
                        FORMAT
                    </h2>

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
                                        className="flex items-center gap-3 w-full p-2 hover:bg-[var(--layer3)]
                                        hover:text-[var(--nice-blue)] rounded-md transition-colors cursor-pointer text-sm"
                                    >
                                        <span className="text-xs opacity-50 w-5 font-mono flex items-center justify-center">
                                            <IconComponent size={14} />
                                        </span>
                                        <span>
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Insert Section */}
                <div>
                    <h2 className="font-bold text-[var(--text)] text-sm p-2">
                        INSERT
                    </h2>

                    <button
                        className="flex items-center gap-3 w-full p-2 hover:bg-[var(--layer3)] rounded-md
                        hover:text-[var(--nice-blue)] transition-colors cursor-pointer text-sm"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            handleInsertImagePlaceholder();
                        }}
                    >
                        <Image size={16} className="text-[var(--text-muted)]" />
                        <span>Image</span>
                    </button>
                </div>

            </div>
        </div>
    );
};