'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [age, setAge] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
            zIndex: '9999',
        },
        iconTheme: {
            primary: 'var(--nice-blue)',
            secondary: '#FFFAEE',
        },
    };

    useEffect(() => {
        const getUser = async () => {

            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const {data: profile, error} = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setUsername(profile?.username)
                setAge(profile?.date_of_birth)
                setAvatarUrl(profile?.avatar_url)

                if (error) {
                    console.error(error);
                    toast.error(error.message, toastStyle);
                }
                setUserProfile(profile);
            }   else {
                router.replace('/');
            }
            setLoading(false);
        }
        getUser();
    }, [supabase, router])

    const handleLogOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
        router.refresh();
    };

    if (loading) return <div className="p-10 text-[var(--text)]">Loading your information...</div>;

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
                Hey {username}!
            </h1>
            <Image
                src={avatarUrl}
                alt="avatar"
                width={96}
                height={96}
                className="rounded-full hover:scale-110 cursor-pointer"
            />
            <button
                type="button"
                className="cursor-pointer p-4 font-semibold border rounded-xl w-full text-[var(--text)] hover:bg-[var(--layer2)] transition-colors"
                onClick={handleLogOut}
            >
                Sign Out
            </button>
            {!age && (
                <motion.div>
                    <h1>THEIR IS NO DOB</h1>
                </motion.div>
            )}
        </div>
    );
}