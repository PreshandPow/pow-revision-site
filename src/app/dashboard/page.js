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
    const [completedProfile, setCompletedProfile] = useState(true);

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

                if ( !age || !avatarUrl ) setCompletedProfile(false);

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

    const needsDate = !userProfile?.date_of_birth;
    const needsAvatar = !userProfile?.avatar_url;

    const handleSaveDetails = async () => {
        const profileUpdates = {};

        if (needsDate) {
            if (!day || !month || !year) {
                toast.error('Please fill in your date of birth', toastStyle);
                return;
            }

            const calculatedAge = calculateAge(day, month, year);
            if (calculatedAge < 13) {
                toast.error("You must be at least 13 years old to use POW.", toastStyle);
                return;
            }

            const dobString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            profileUpdates.date_of_birth = dobString;
        }

        if (needsAvatar && avatarUrl) {
            profileUpdates.avatar_url = avatarUrl;
        }

        if (Object.keys(profileUpdates).length === 0) {
            toast.error('Nothing to update', toastStyle);
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', userProfile.id);

        if (error) {
            console.error("Supabase update error:", error.message);
            toast.error('Error updating profile.', toastStyle);
        } else {
            if (needsDate) setAge(calculateAge(day, month, year));
            if (needsAvatar) setAvatarUrl(avatarUrl);
            toast.success('Profile completed!', toastStyle);
            setCompletedProfile(true);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)]" />

            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                Setting up your <span className="text-[var(--nice-blue)]">POW Dashboard</span>
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>
    );

    return (
        <main className=" flex bg-[var(--layer2)] min-h-screen transition-colors duration-300">
            <header>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
                    Hey {username}!
                </h1>
            </header>
            {!userProfile?.date_of_birth || !userProfile?.avatar_url && (
                <DetailsModal
                    day={day}
                    setDay={setDay}
                    month={month}
                    setMonth={setMonth}
                    year={year}
                    setYear={setYear}
                    onSubmit={handleSaveDetails}
                    avatarUrl={avatarUrl}
                    setAvatarUrl={setAvatarUrl}
                    needsAvatar={!userProfile?.avatar_url}
                    needsDate={!userProfile?.date_of_birth}
                />
            )}
        </main>
    );
}