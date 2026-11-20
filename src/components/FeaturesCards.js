export default function FeatureCard({ title, bgColor, children }) {
    return (
        <div className={`card-animation min-w-[85vw] md:min-w-[650px] h-[550px] md:h-[600px] rounded-[3.5rem] ${bgColor} shadow-2xl flex flex-col overflow-hidden snap-center`}>
            {/* Header Area */}
            <div className="p-8 md:p-10 text-center shrink-0">
                <h3 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">
                    {title}
                </h3>
            </div>

            {/* Content Area (The part that changes) */}
            <div className="mx-4 md:mx-6 mb-6 flex-grow bg-white dark:bg-[var(--layer1)] rounded-[2.5rem] p-4 md:p-8 shadow-sm flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}