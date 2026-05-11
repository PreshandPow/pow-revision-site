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

                        if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
                            let node = selection.anchorNode;
                            let blockNode = node;
                            const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];

                            while (blockNode && blockNode !== editorRef.current) {
                                if (blockNode.nodeType === 1 && blockTags.includes(blockNode.tagName.toUpperCase())) {
                                    break;
                                }
                                blockNode = blockNode.parentNode;
                            }
                            if (!blockNode || blockNode === editorRef.current) {
                                blockNode = node;
                                while (blockNode && blockNode.parentNode !== editorRef.current && blockNode.parentNode) {
                                    blockNode = blockNode.parentNode;
                                }
                            }
                            if (blockNode && blockNode !== editorRef.current) {
                                const range = document.createRange();
                                range.selectNodeContents(blockNode);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }

                        document.execCommand('foreColor', false, 'inherit');
                        document.execCommand('hiliteColor', false, 'transparent');
                        document.execCommand('removeFormat', false, null);

                        onContentChange();

                        if (selection && selection.rangeCount > 0) {
                            selection.collapseToEnd();
                        }
                    }}
                >
                    <Type size={16} className="text-gray-400" />
                    <span>Clear formatting</span>
                </button>

                <button
                    className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                    text-sm cursor-pointer"
                    onPointerDown={(e) => {
                        e.preventDefault();

                        const selection = window.getSelection();

                        if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
                            let node = selection.anchorNode;
                            let blockNode = node;
                            const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];

                            while (blockNode && blockNode !== editorRef.current) {
                                if (blockNode.nodeType === 1 && blockTags.includes(blockNode.tagName.toUpperCase())) {
                                    break;
                                }
                                blockNode = blockNode.parentNode;
                            }
                            if (!blockNode || blockNode === editorRef.current) {
                                blockNode = node;
                                while (blockNode && blockNode.parentNode !== editorRef.current && blockNode.parentNode) {
                                    blockNode = blockNode.parentNode;
                                }
                            }
                            if (blockNode && blockNode !== editorRef.current) {
                                const range = document.createRange();
                                range.selectNodeContents(blockNode);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        }

                        document.execCommand('copy');

                        onContentChange();

                        if (selection && selection.rangeCount > 0) {
                            selection.collapseToEnd();
                        }
                    }}
                >
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