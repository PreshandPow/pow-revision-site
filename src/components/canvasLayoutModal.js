'use client';

import { useEffect } from 'react';
import { Type, Clipboard, Copy, Trash2 } from 'lucide-react';

const CanvasLayoutModal = ({ position }) => {

    return (
        <div
            className="fixed z-50 w-56 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-2 text-gray-200"
        >
            <div className="flex flex-col gap-1">

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm">
                    <Type size={16} className="text-gray-400" />
                    <span>Clear formatting</span>
                </button>

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm">
                    <Clipboard size={16} className="text-gray-400" />
                    <span>Copy to clipboard</span>
                </button>

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm">
                    <Copy size={16} className="text-gray-400" />
                    <span>Duplicate</span>
                </button>

                <div className="h-[1px] bg-[#333] my-1 mx-1" />

                <button className="flex items-center gap-3 w-full p-2 hover:bg-[#2a2a2a] rounded-md transition-colors text-sm text-[#f87171] hover:text-red-400">
                    <Trash2 size={16} />
                    <span>Delete</span>
                </button>

            </div>
        </div>
    );
};

export default CanvasLayoutModal;