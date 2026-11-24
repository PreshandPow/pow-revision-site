import { Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';

export const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return { types: ['textStyle'] };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

export const editorClasses = 'max-w w-full break-words whitespace-pre-wrap [&_img]:max-h-48 ' +
    'outline-none border-none ring-0 focus:outline-none focus:ring-0 [&_.ProseMirror]:outline-none ' +
    '[&_.ProseMirror:focus]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:ring-0 ' +
    '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 ' +
    '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 ' +
    '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-1 [&_h3]:mb-1 ' +
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 ' +
    '[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--layer3)] [&_blockquote]:pl-3 [&_blockquote]:italic ' +
    '[&_strong]:font-bold [&_em]:italic [&_s]:line-through ' +
    '[&_code]:bg-[var(--layer1)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono';

// For places that show saved card HTML outside the editor (study card, card list).
// Same image limit as the editor so images look the same everywhere.
export const cardImageClasses = '[&_img]:max-h-48 [&_img]:rounded-lg ';

export const extensions = [
    StarterKit,
    TextStyle,
    Color,
    Image,
    FontFamily,
    FontSize,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: '"space" for AI, "/" for format' }),
];