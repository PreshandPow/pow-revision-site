'use client';

import { Clipboard, Copy, Trash2, Type } from 'lucide-react';

export default function CanvasLayoutModal({ editor, hoveredPos, toast, toastStyle }) {

    // ─── 1. NODE LOOKUP HELPER ──────────────────────────────────────────────────
    // hoveredPos is the document position immediately before the hovered
    // top-level block (set in the parent's mousemove handler via
    // editor.view.posAtCoords + $pos.before(1)). nodeAt() gives us the actual
    // block node living at that position, and node.nodeSize tells us where it
    // ends — no more caretRangeFromPoint pixel-guessing.
    const getHoveredNode = () => {
        if (!editor || hoveredPos === null) return null;
        const node = editor.state.doc.nodeAt(hoveredPos);
        if (!node) return null;
        return { node, from: hoveredPos, to: hoveredPos + node.nodeSize };
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
                        const hovered = getHoveredNode();
                        if (!hovered) return;

                        editor.chain()
                            .focus()
                            .setTextSelection({ from: hovered.from, to: hovered.to })
                            .unsetAllMarks()
                            .unsetHighlight()
                            .run();
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
                        const hovered = getHoveredNode();
                        if (!hovered) return;

                        navigator.clipboard.writeText(hovered.node.textContent)
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
                        const hovered = getHoveredNode();
                        if (!hovered) return;

                        editor.chain()
                            .focus()
                            .insertContentAt(hovered.to, hovered.node.toJSON())
                            .run();
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
                        const hovered = getHoveredNode();
                        if (!hovered) return;

                        editor.chain()
                            .focus()
                            .deleteRange({ from: hovered.from, to: hovered.to })
                            .run();
                    }}
                >
                    <Trash2 size={16} />
                    <span>Delete</span>
                </button>

            </div>
        </div>
    );
}