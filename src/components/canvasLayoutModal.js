'use client';

import { useEffect } from 'react';
import { Type, Clipboard, Copy, Trash2 } from 'lucide-react';

export default function CanvasLayoutModal ({ editorRef })  {

    return (
        <div
            className="w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-2 text-gray-200"
        >
            <div className="flex flex-col gap-1">

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                     cursor-pointer text-sm"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        const selection = window.getSelection();
                        let node = selection.anchorNode;
                        if (node.nodeType === 3) node = node.parentNode;

                        let blockElement = node.closest('p, h1, h2, h3, li, .pow-todo-item') || node;

                        if (editorRef.current && editorRef.current.contains(blockElement)) {

                            const range = document.createRange();
                            range.selectNodeContents(blockElement);
                            selection.removeAllRanges();
                            selection.addRange(range);

                            document.execCommand('removeFormat', false, null);
                            document.execCommand('foreColor', false, 'inherit');
                            document.execCommand('hiliteColor', false, 'transparent');

                            selection.collapseToEnd();
                        } else {
                            document.execCommand('removeFormat', false, null);
                            document.execCommand('foreColor', false, 'inherit');
                            document.execCommand('hiliteColor', false, 'transparent');
                        }

                        setSelectedHighlighter(null);
                        setSelectedTextColor(null);
                        setIsTextBold(false);
                        setIsTextItalic(false);
                        setIsTextUnderlined(false);
                        setIsTextStrikethrough(false);

                        onContentChange();
                    }}
                >
                    <Type size={16} className="text-gray-400" />
                    <span>Clear formatting</span>
                </button>

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                text-sm cursor-pointer">
                    <Clipboard size={16} className="text-gray-400" />
                    <span>Copy to clipboard</span>
                </button>

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                text-sm cursor-pointer">
                    <Copy size={16} className="text-gray-400" />
                    <span>Duplicate</span>
                </button>

                <div className="h-[1px] bg-[#333] my-1 mx-1" />

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                text-sm text-[#f87171] hover:text-red-400  cursor-pointer">
                    <Trash2 size={16} />
                    <span>Delete</span>
                </button>

            </div>
        </div>
    );
};