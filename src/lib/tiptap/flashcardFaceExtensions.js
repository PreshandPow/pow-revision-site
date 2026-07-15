// lib/tiptap/flashcardFaceExtensions.js
//
// A flashcard face isn't a document — no headings, no lists, no blockquotes.
// It's closer to a rich "textarea": multi-line text with bold/italic/underline
// and the occasional image. This trims StarterKit down to just that, and
// reuses your ImagePlaceholder node so the "click box to upload" UX matches
// the notes editor.

import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image as ImageExt } from '@tiptap/extension-image';
import { ImagePlaceholder } from './imagePlaceholder';

export function getFlashcardFaceExtensions(placeholderText) {
    return [
        StarterKit.configure({
            heading: false,
            blockquote: false,
            codeBlock: false,
            bulletList: false,
            orderedList: false,
            listItem: false,
            horizontalRule: false,
            link: false,
        }),
        ImageExt.configure({
            HTMLAttributes: { class: 'max-w-full rounded-lg border border-[var(--layer3)] my-1' },
        }),
        ImagePlaceholder,
        Placeholder.configure({
            placeholder: placeholderText,
        }),
    ];
}