'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';
import DetailsModal from '../../components/DetailsModal';

export function createClient() {

    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
}

function calculateAge(day, month, year) {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null);
    const [age, setAge] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [day, setDay] = useState(null);
    const [month, setMonth] = useState(null);
    const [year, setYear] = useState(null);

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
                    .maybeSingle();

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
    }, [supabase, router]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.refresh();
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
        router.refresh();
    };

    const handleSaveDob = async () => {
        if (!day || !month || !year) {
            toast.error('Please fill in all fields', toastStyle);
            return;
        }
        const calculatedAge = calculateAge(day, month, year);
        if (calculatedAge < 13) {
            toast.error("You must be at least 13 years old to use POW.", toastStyle);
            return;
        }
        const dobString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const { error } = await supabase
            .from('profiles')
            .update({ date_of_birth: dobString })
            .eq('id', userProfile.id);
        if (error) {
            console.error("Supabase update error:", error.message);
            toast.error('Error updating profile.', toastStyle);
        } else {
            setAge(calculatedAge);
            toast.success('Profile completed!', toastStyle);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-md p-0 md:p-6">
            <h1 className="font-brand text-[var(--nice-blue)] text-2xl md:text-4xl font-semibold">
                Hold on. POW Bot is setting up your dashboard...
            </h1>
        </div>
    );

    return (
        <main className=" flex bg-[var(--layer2)] min-h-screen transition-colors duration-300">
            <header>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
                    Hey {username}!
                </h1>
            </header>
            {!age || !username && (
                <DetailsModal
                    day={day}
                    setDay={setDay}
                    month={month}
                    setMonth={setMonth}
                    year={year}
                    setYear={setYear}
                    onSubmit={handleSaveDob}
                />
            )}
        </main>
    );
}