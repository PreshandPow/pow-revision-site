'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

// ─── 1. THE BOX ITSELF ─────────────────────────────────────────────────────
function ImagePlaceholderView({ editor, getPos }) {
    const handleClick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const pos = typeof getPos === 'function' ? getPos() : null;
                if (pos === null || pos === undefined) return;

                editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + 1 })
                    .insertContentAt(pos, {
                        type: 'image',
                        attrs: { src: readerEvent.target.result },
                    })
                    .run();
            };
            reader.readAsDataURL(file);
        };

        fileInput.click();
    };

    return (
        <NodeViewWrapper
            as="div"
            contentEditable={false}
            onClick={handleClick}
            className="pow-image-placeholder my-4 p-8 border-2 border-dashed border-[var(--layer3)]
            bg-[var(--layer1)] rounded-xl flex flex-col items-center justify-center cursor-pointer
            hover:bg-[var(--layer3)] transition-all select-none group"
        >
            <div className="pointer-events-none flex flex-col items-center">
                <svg
                    width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className="mb-2 text-[var(--text-muted)] group-hover:text-[var(--nice-blue)] transition-colors"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                    Add an image
                </span>
                <span className="text-xs text-[var(--text-muted)] opacity-70 mt-1">
                    Click to browse files
                </span>
            </div>
        </NodeViewWrapper>
    );
}

// ─── 2. THE NODE DEFINITION ─────────────────────────────────────────────────
export const ImagePlaceholder = Node.create({
    name: 'imagePlaceholder',
    group: 'block',
    atom: true,        // self-contained, no editable inner content
    selectable: true,
    draggable: false,

    parseHTML() {
        return [{ tag: 'div[data-type="image-placeholder"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-placeholder' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImagePlaceholderView);
    },

    addCommands() {
        return {
            insertImagePlaceholder:
                () =>
                    ({ chain }) => {
                        return chain().insertContent({ type: this.name }).run();
                    },
        };
    },
});

export default ImagePlaceholder;