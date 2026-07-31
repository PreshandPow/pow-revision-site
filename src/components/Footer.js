import Link from "next/link";
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {

    // ─── 1. RENDER ────────────────────────────────────────────────────────────────
    return (
        <footer className="bg-[var(--layer1)] border-t border-[var(--layer3)] pt-16 pb-8 px-8">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand & Socials */}
                    <div className="flex flex-col gap-4">
                        <Link
                            aria-label={'Go to home page'}
                            href="/"
                            className="font-brand font-black tracking-tighter z-20 text-5xl text-[var(--nice-blue)]"
                        >
                            POW
                        </Link>
                        <p className="text-[var(--text-muted)] text-sm max-w-[200px]">
                            Power up your learning with AI-driven study tools.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <Link
                                aria-label={'Visit our Facebook page'}
                                target={'_blank'}
                                rel={'noopener noreferrer'}
                                href="#"
                                className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)] hover:text-white transition-all"
                            >
                                <Facebook />
                            </Link>
                            <Link
                                aria-label={'Visit our Twitter page'}
                                target={'_blank'}
                                rel={'noopener noreferrer'}
                                href="#"
                                className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)] hover:text-white transition-all"
                            >
                                <Twitter />
                            </Link>
                            <Link
                                aria-label={'Visit our Instagram page'}
                                target={'_blank'}
                                rel={'noopener noreferrer'}
                                href="#"
                                className="p-2 bg-[var(--layer2)] rounded-full hover:bg-[var(--nice-blue)] hover:text-white transition-all"
                            >
                                <Instagram />
                            </Link>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Product</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li>
                                <Link
                                    aria-label={'Visit our Flashcards page'}
                                    href="#"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Flashcards
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Visit our Notes page'}
                                    href="/dashboard/Notes"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Note Maker
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Visit our AI page'}
                                    href="#"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    POWER bot AI
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Company</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li>
                                <Link
                                    aria-label={'Learn more about us'}
                                    href="#"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Look for careers with us'}
                                    href="#"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Learn about our privacy policy'}
                                    href="#"
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="flex flex-col gap-4">
                        <p className="font-bold text-[var(--text)] uppercase text-xs tracking-widest">Support</p>
                        <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
                            <li>
                                <Link
                                    aria-label={'Need some help?'}
                                    href="#"
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Visit our discord community'}
                                    href="#"
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Discord Community
                                </Link>
                            </li>
                            <li>
                                <Link
                                    aria-label={'Reach out to us'}
                                    href="#"
                                    target={'_blank'}
                                    rel={'noopener noreferrer'}
                                    className="hover:text-[var(--nice-blue)] transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright & Bottom Links */}
                <div
                    className="border-t border-[var(--layer3)] pt-8 flex flex-col md:flex-row justify-between
                    items-center gap-4 text-xs text-[var(--text-muted)]"
                >
                    <p>© 2026 POW Learning. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link
                            aria-label={'View our terms of service'}
                            href="#"
                            className="hover:underline"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            aria-label={'Read our cookies policy'}
                            href="#"
                            className="hover:underline"
                        >
                            Cookie Policy
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
