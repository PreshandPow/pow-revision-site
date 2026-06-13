'use client';

import { Clipboard, Copy, Trash2, Type } from 'lucide-react';

export default function CanvasLayoutModal({ editorRef, hoveredBlock, onContentChange, toast, toastStyle }) {

    // ─── 1. DOM SELECTION HELPERS ────────────────────────────────────────────────
    const getLineRange = () => {
        if (!hoveredBlock || !editorRef.current?.contains(hoveredBlock)) return null;

        const blockRect = hoveredBlock.getBoundingClientRect();
        const midY = blockRect.top + blockRect.height / 2;

        let startRange, endRange;
        if (document.caretRangeFromPoint) {
            startRange = document.caretRangeFromPoint(blockRect.left, midY);
        }   else if (document.caretPositionFromPoint) {
            startRange = document.caretPositionFromPoint(blockRect.left, midY);
        }

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

    // ─── 2. RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="w-56 bg-[var(--layer2)] border border-[var(--layer1)] rounded-lg shadow-2xl p-2">
            <div className="flex flex-col gap-1">

                {/* Clear Formatting */}
                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[var(--layer3)] hover:text-[var(--nice-blue)] rounded-md transition-colors cursor-pointer text-sm"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        applyToLine(() => {
                            document.execCommand('removeFormat', false, null);
                        });
                    }}
                >
                    <Type size={16} className="text-[var(--text-muted)]" />
                    <span>Clear formatting</span>
                </button>

                {/* Copy to Clipboard */}
                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[var(--layer3)] hover:text-[var(--nice-blue)] rounded-md transition-colors text-sm cursor-pointer"
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
                    <Clipboard size={16} className="text-[var(--text-muted)]" />
                    <span>Copy to clipboard</span>
                </button>

                {/* Duplicate Block */}
                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[var(--layer3)] hover:text-[var(--nice-blue)] rounded-md transition-colors text-sm cursor-pointer"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        if (!hoveredBlock || !editorRef.current?.contains(hoveredBlock)) return;

                        const cloned = hoveredBlock.cloneNode(true);
                        hoveredBlock.parentNode.insertBefore(cloned, hoveredBlock.nextSibling);
                        onContentChange?.();
                    }}
                >
                    <Copy size={16} className="text-[var(--text-muted)]" />
                    <span>Duplicate</span>
                </button>

                {/* Divider */}
                <div className="h-[1px] bg-[var(--text-muted)] my-1 mx-1" />

                {/* Delete Block */}
                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-md transition-colors text-sm cursor-pointer"
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