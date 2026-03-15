export default function Footer() {
    return (
        <footer className="bg-[var(--layer1)] border-t border-[var(--layer3)] pt-16 pb-8 px-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="flex flex-col gap-4">
                        <p className="text-3xl font-bold text-[var(--nice-blue)]"><a href="#">POW</a></p>
                        <p className="text-[var(--text-muted)] text-sm max-w-[200px]">
                            Power up your learning with AI-driven study tools.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)] hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24
                                    12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="#" className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)] hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953
                                    4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                            </a>
                            <a href="#" className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)]
                                 hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.012-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Product</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Flashcards</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Note Maker</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">POWER bot AI</a></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Company</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Support</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Discord Community</a></li>
                            <li><a href="#" className="hover:text-[var(--nice-blue)] transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-[var(--layer3)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
                    <p>© 2026 POW Learning. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:underline">Terms of Service</a>
                        <a href="#" className="hover:underline">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}