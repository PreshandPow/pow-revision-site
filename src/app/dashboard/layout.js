'use client';

import { useEffect, useState } from "react";
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { createBrowserClient } from '@supabase/ssr';

function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function DashboardLayout({ children }) {
    // ─── 1. GLOBAL SETUP & UI STATES ──────────────────────────────────────────────
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    // Check if the user is currently on the full-screen Note Canvas
    const isNoteCanvas = pathname.startsWith('/dashboard/Notes/') && pathname !== '/dashboard/Notes';

    // Navigation and Search States
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    // ─── 2. AUTHENTICATION STATE ──────────────────────────────────────────────────
    const [session, setSession] = useState(undefined);
    const loggedIn = session !== undefined && session !== null;

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        fetchSession();

        // Listen for login/logout events to keep session state synced
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // ─── 3. THEME MANAGEMENT ──────────────────────────────────────────────────────
    const { theme, setTheme } = useTheme();

    // Apply Theme Changes
    useEffect(() => {
        if (!theme) return;
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeChange = (e) => {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    // ─── 4. RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className={theme}>
            {!isNoteCanvas && (
                <Navbar
                    isNavOpen={isNavOpen}
                    setIsNavOpen={setIsNavOpen}
                    theme={theme}
                    handleThemeChange={handleThemeChange}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    loggedIn={loggedIn}
                    router={router}
                />
            )}

            {!isNoteCanvas && (
                <Sidebar
                    isNavOpen={isNavOpen}
                    setIsNavOpen={setIsNavOpen}
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    theme={theme}
                    handleThemeChange={handleThemeChange}
                    router={router}
                />
            )}

            <main>
                {children}
            </main>

            {!isNoteCanvas && (
                <Footer />
            )}
        </div>
    );
}