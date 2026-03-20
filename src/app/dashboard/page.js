'use client';
import {supabase} from "../../lib/supabase-client";
import { useRouter } from 'next/navigation';

export default function Dashboard () {

    const router = useRouter();

    const handleLogOut = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        router.replace('/')

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