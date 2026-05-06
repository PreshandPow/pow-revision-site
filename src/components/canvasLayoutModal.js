'use client';

export default function CanvasLayoutModal() {
    return (
        <div
            className="absolute top-full left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm overflow-hidden z-50 py-1 shadow-lg min-w-[180px]"
        >
            <ul>
                <li>
                    <button
                        className={`flex gap-2 w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-[var(--layer3)]`}
                    >

                    </button>
                </li>
            </ul>
        </div>
    );
};