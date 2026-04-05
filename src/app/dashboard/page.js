'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';
import DetailsModal from '../../components/DetailsModal';
import CreateModal from "../../components/CreateModal";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

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
    const [openCreateModal , setOpenCreateModal] = useState(false);
    const [activeTaskModal, setActiveTaskModal] = useState(null);

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

    const handleCreateNote = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: note, error } = await supabase
            .from('notes')
            .insert({ user_id: user.id, title: 'Untitled', content: '' })
            .select()
            .single();

        if (error) { toast.error('Could not create note', toastStyle); return; }
        router.push(`/dashboard/notes/${note.id}`);
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
        <main className="flex flex-col bg-[var(--layer2)] min-h-screen transition-colors duration-300 p-6 md:p-10 w-full">
            {(!userProfile?.date_of_birth || !userProfile?.avatar_url) && (
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

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text)]">Hey, {username}!</h1>
                <p className="text-[var(--text-muted)] mt-1">Here's what's happening on your POW dashboard.</p>
            </div>

            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Quick actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--nice-blue)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 3v9m0-9-3 3m3-3 3 3M4 14h12v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1z" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <p className="font-bold text-[var(--text)]">Upload a file</p>
                    <p className="text-sm text-[var(--text-muted)] flex-1">Turn a PDF or doc into notes or flashcards instantly.</p>
                    <button className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)] w-fit"
                           >
                        Upload
                    </button>
                </div>

                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--nice-blue)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="4" y="3" width="12" height="14" rx="2" stroke="#0F6E56" strokeWidth="1.5"/>
                            <path d="M7 7h6M7 10h6M7 13h4" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <p className="font-bold text-[var(--text)]">Notes</p>
                    <p className="text-sm text-[var(--text-muted)] flex-1">Access practice tests or start a 1:1 voice tutor.</p>
                    <button
                        className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)] w-fit"
                        onClick={() => {
                            setOpenCreateModal(true);
                            setActiveTaskModal('notes');
                        }}>
                        Create
                    </button>
                </div>

                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--nice-blue)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="5" width="14" height="10" rx="2" stroke="#534AB7" strokeWidth="1.5"/>
                            <path d="M7 10h6M10 7v6" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <p className="font-bold text-[var(--text)]">Flashcards</p>
                    <p className="text-sm text-[var(--text-muted)] flex-1">Learn mode, spaced repetition, or voice quiz.</p>
                    <button
                        className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)] w-fit"
                        onClick={() => {
                            setOpenCreateModal(true);
                            setActiveTaskModal('flashcards');
                        }}>
                        Create
                    </button>
                </div>

                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--nice-blue)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="8" r="3" stroke="#BA7517" strokeWidth="1.5"/>
                            <path d="M5 8a5 5 0 0010 0M10 13v4" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <p className="font-bold text-[var(--text)]">Live record class</p>
                    <p className="text-sm text-[var(--text-muted)] flex-1">Record your lecture and let POW Bot turn it into notes.</p>
                    <button className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)] w-fit">
                        Record
                    </button>
                </div>
            </div>

            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">POW bot</p>
            <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 mb-10 hover:border-[var(--nice-blue)] transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="10" stroke="#185FA5" strokeWidth="1.5"/>
                        <circle cx="10" cy="13" r="1.5" fill="#185FA5"/>
                        <circle cx="18" cy="13" r="1.5" fill="#185FA5"/>
                        <path d="M10 18c1.2 1.5 6.8 1.5 8 0" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M14 4v2M14 22v2M4 14H2M26 14h-2" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-[var(--text)]">Chat with POW Bot</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Ask anything about your notes, get summaries, generate practice questions, or start a voice tutoring session.</p>
                    <span className="inline-block mt-2 text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">AI tutor</span>
                </div>
                <button className="cursor-pointer text-sm font-bold bg-[var(--nice-blue)] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform whitespace-nowrap">
                    Ask POW →
                </button>
            </div>

            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Recent activity</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        <span className="text-xs font-bold text-[var(--text-muted)]">Most recent note</span>
                    </div>
                    <p className="font-bold text-[var(--text)] mb-1">No notes yet</p>
                    <p className="text-sm text-[var(--text-muted)]">Upload a file or create a note set to get started.</p>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--layer3)]">
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                        <button className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)]">
                            Create note →
                        </button>
                    </div>
                </div>

                <div className="bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-bold text-[var(--text-muted)]">Most recent flashcard set</span>
                    </div>
                    <p className="font-bold text-[var(--text)] mb-1">No flashcard sets yet</p>
                    <p className="text-sm text-[var(--text-muted)]">Create a flashcard set from scratch or generate one from your notes.</p>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--layer3)]">
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                        <button className="cursor-pointer text-sm font-bold border border-[var(--layer3)] rounded-xl px-4 py-2 hover:bg-[var(--layer2)] transition-colors text-[var(--text)]">
                            Create set →
                        </button>
                    </div>
                </div>
            </div>
            {openCreateModal && (
                <CreateModal
                    setOpenCreateModal={setOpenCreateModal}
                    activeTaskModal={activeTaskModal}
                    setActiveTaskModal={setActiveTaskModal}
                    handleCreateNote={handleCreateNote}
                />
            )}
        </main>
    );
}