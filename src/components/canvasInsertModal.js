'use client';

import { useEffect } from 'react';
import {
    Type, Clipboard, Copy, Trash2, Image,
    Heading1, Heading2, Heading3
} from 'lucide-react';

export default function CanvasInsertModal ({ handleInsertImagePlaceholder  })  {

    return (
        <div
            className="w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-2 text-gray-200"
        >
            <div className="flex flex-col gap-1">

                <div>
                    <h2 className="font-bold text-[var(--nice-blue)] text-sm p-2">
                        FORMAT
                    </h2>

                    <button
                        className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                     cursor-pointer text-sm"
                        onPointerDown={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Heading1 size={16} className="text-gray-400" />
                        <span>Heading 1</span>
                    </button>

                    <button
                        className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                     cursor-pointer text-sm"
                        onPointerDown={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Heading2 size={16} className="text-gray-400" />
                        <span>Heading 2</span>
                    </button>

                    <button
                        className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors
                     cursor-pointer text-sm"
                        onPointerDown={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <Heading3 size={16} className="text-gray-400" />
                        <span>Heading 3</span>
                    </button>
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