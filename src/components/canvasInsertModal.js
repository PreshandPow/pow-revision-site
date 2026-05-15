'use client';

import { useEffect } from 'react';
import {
    Type, Clipboard, Copy, Trash2, Image,
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListTodo, Pilcrow
} from 'lucide-react';

const TEXT_TYPES = [
    { group: 'HIERARCHY', label: 'Paragraph', icon: Pilcrow, command: 'formatBlock', value: 'p' },
    { group: 'HIERARCHY', label: 'Heading 1',  icon: Heading1, command: 'formatBlock', value: 'h1' },
    { group: 'HIERARCHY', label: 'Heading 2',  icon: Heading2, command: 'formatBlock', value: 'h2' },
    { group: 'HIERARCHY', label: 'Heading 3',  icon: Heading3, command: 'formatBlock', value: 'h3' },
    { group: 'LISTS',     label: 'Bullet list',   icon: List,  command: 'insertUnorderedList', value: null },
    { group: 'LISTS',     label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList',   value: null },
    { group: 'LISTS',     label: 'Todo list',     icon: ListTodo,  command: null,                  value: 'todo' },
];

export default function CanvasInsertModal ({ handleInsertImagePlaceholder, onInsertTodo, onInsertHeading, onContentChange })  {

    const handleTextTypeSelect = (type) => {
        if (type.value === 'todo') {
            onInsertTodo?.();
        } else if (['h1', 'h2', 'h3'].includes(type.value)) {
            onInsertHeading?.(type.value);
        } else if (type.value) {
            document.execCommand(type.command, false, type.value);
            onContentChange?.();
        } else {
            document.execCommand(type.command, false, null);
            onContentChange?.();
        }
    };

    return (
        <div
            className="w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-2 text-gray-200"
        >
            <div className="flex flex-col gap-1">

                <div>
                    <h2 className="font-bold text-[var(--nice-blue)] text-sm p-2">
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
                                        className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                                                   cursor-pointer text-sm"
                                    >
                                                                        <span className="text-xs opacity-50 w-5 font-mono flex items-center justify-center">
                                            {typeof IconComponent === 'string' ? (
                                                IconComponent
                                            ) : (
                                                <IconComponent size={14} />
                                            )}
                                        </span>
                                        <span
                                        >
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}

                </div>

                <div>
                    <h2 className="font-bold text-[var(--nice-blue)] text-sm p-2">
                        INSERT
                    </h2>

                    <button
                        className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                     cursor-pointer text-sm"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            handleInsertImagePlaceholder();
                            onContentChange?.();
                        }}
                    >
                        <Image size={16} className="text-gray-400" />
                        <span>Image</span>
                    </button>
                </div>

            </div>
        </div>
    );
};