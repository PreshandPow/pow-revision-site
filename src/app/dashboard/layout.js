'use client';

import {useEffect, useState} from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {supabase} from "../../lib/supabase-client";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {

    const router = useRouter();
    const [loggedIn, setLoggedIn] = useState(true);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const [searchInput, setSearchInput] = useState("");
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [session, setSession] = useState(null);

    const fetchSession = async () => {
        const {data: {session}} = await supabase.auth.getSession();
        setSession(session);
    }
    useEffect(() => {
        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
        return () => {
            authListener.subscription.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(saved || system);
    }, []);
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

    return (
        <div className={theme}>
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
            <Sidebar
                isNavOpen={isNavOpen}
                setIsNavOpen={setIsNavOpen}
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                theme={theme}
                handleThemeChange={handleThemeChange}
            />
            <main>{children}</main>
        </div>
    );
}