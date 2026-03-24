'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react'; // Added these

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}

function getAge(birthDateString) {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserProfile(user.user_metadata);
            } else {
                router.replace('/');
            }
            setLoading(false);
        };
        getUser();
    }, [supabase, router]);

    const handleLogOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
        router.refresh();
    };

    if (loading) return <div className="p-10 text-[var(--text)]">Loading your information...</div>;

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
                Welcome back, {userProfile?.username || 'Learner'}!
            </h1>
            {userProfile?.dob && (
                <p className="text-[var(--text-muted)] mb-6">
                    You are {getAge(userProfile.dob)} years old.
                </p>
            )}

            <button
                type="button"
                className="cursor-pointer p-4 font-semibold border rounded-xl w-full text-[var(--text)] hover:bg-[var(--layer2)] transition-colors"
                onClick={handleLogOut}
            >
                Sign Out
            </button>
        </div>
    );
}