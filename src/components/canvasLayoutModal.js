'use client';

import { Clipboard, Copy, Trash2, Type } from 'lucide-react';

export default function CanvasLayoutModal({ editorRef, hoveredBlock, onContentChange, toast, toastStyle }) {

    const getLineRange = () => {
        if (!hoveredBlock || !editorRef.current?.contains(hoveredBlock)) return null;

        const blockRect = hoveredBlock.getBoundingClientRect();
        const midY = blockRect.top + blockRect.height / 2;

        const startRange = document.caretRangeFromPoint(blockRect.left, midY);
        const endRange = document.caretRangeFromPoint(blockRect.right, midY);

        if (!startRange || !endRange) return null;

        const lineRange = document.createRange();
        lineRange.setStart(startRange.startContainer, startRange.startOffset);
        lineRange.setEnd(endRange.startContainer, endRange.startOffset);

        return lineRange;
    };

    const applyToLine = (callback) => {
        const range = getLineRange();
        if (!range) return;

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        callback(range);

        selection.removeAllRanges();
        onContentChange?.();
    };

    return (
        <div className="w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-2 text-gray-200">
            <div className="flex flex-col gap-1">

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors cursor-pointer text-sm"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        applyToLine(() => {
                            document.execCommand('removeFormat', false, null);
                        });
                    }}
                >
                    <Type size={16} className="text-gray-400" />
                    <span>Clear formatting</span>
                </button>

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm cursor-pointer"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        const range = getLineRange();
                        if (!range) return;

                        const text = range.toString();
                        navigator.clipboard.writeText(text)
                            .then(() => toast.success('Copied to clipboard!', toastStyle))
                            .catch(err => console.error('Failed to copy:', err));
                    }}
                >
                    <Clipboard size={16} className="text-gray-400" />
                    <span>Copy to clipboard</span>
                </button>

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm cursor-pointer"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        if (!hoveredBlock || !editorRef.current?.contains(hoveredBlock)) return;

                        const cloned = hoveredBlock.cloneNode(true);
                        hoveredBlock.parentNode.insertBefore(cloned, hoveredBlock.nextSibling);
                        onContentChange?.();
                    }}
                >
                    <Copy size={16} className="text-gray-400" />
                    <span>Duplicate</span>
                </button>

                <div className="h-[1px] bg-[#333] my-1 mx-1" />

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm text-[#f87171] hover:text-red-400 cursor-pointer"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        if (!hoveredBlock || !editorRef.current?.contains(hoveredBlock)) return;

                        hoveredBlock.remove();
                        onContentChange?.();
                    }}
                >
                    <Trash2 size={16} />
                    <span>Delete</span>
                </button>

            </div>
        </div>
    );
}