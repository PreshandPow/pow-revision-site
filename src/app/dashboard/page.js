'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}


export default function Dashboard () {

    const router = useRouter();
    const supabase = createClient()

    const handleLogOut = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        router.replace('/')
        router.refresh();

    };

    return (
        <button
            type="button"
            className="mt-4 cursor-pointer p-4 font-semibold border rounded-xl w-full text-[var(--text)]"
            onClick={handleLogOut}
        >
            Sign Out
        </button>
    );
};