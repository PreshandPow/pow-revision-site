'use client';

import {useEffect, useRef, useState} from 'react';
import {Folder, FileText, MoreVertical, Plus, ChevronRight, Trash2, Clock} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import CreateFolderModal from '../../../components/createFolderModal';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function FolderContentPage() {

    const router = useRouter();
    const supabase = createClient();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    const toastStyle = {
        style: {
            border: '1px solid var(--nice-blue)',
            padding: '16px',
            color: 'var(--text)',
            background: 'var(--layer2)',
        },
        iconTheme: {
            primary: 'var(--nice-blue)',
            secondary: '#FFFAEE',
        },
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        const {  data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/'); return; }

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) toast.error(error.message, toastStyle);
        else setFolders(data || []);
        setLoading(false);
    };

    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [folderName, setFolderName] = useState('Untitled Folder');
    const createFolderModalRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (createFolderModalRef.current && !createFolderModalRef.current.contains(e.target))
                setShowCreateFolderModal(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleCreateFolder = async () => {
        const {  data: {  user}  } = await supabase.auth.getUser();

        const {  data: folder, error } = await supabase
            .from('folders')
            .insert({ name: folderName, user_id: user.id, parent_folder_id: null })
            .select()
            .single();

        if (error) { toast.error('Could not create folder', toastStyle); return; }
        router.push(`/dashboard/Folders/${folder.id}`);
        setShowCreateFolderModal(false);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const { error } = await supabase.from('folders').delete().eq('id', id);
        if (error) { toast.error('Could not delete folder', toastStyle); return; }
        setFolders(prev => prev.filter(n => n.id !== id));
        toast.success('folder deleted', toastStyle);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)] flex items-center justify-center">
                <svg
                    className="animate-spin"
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                >
                    <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                    />
                    <path
                        d="M16 4 A12 12 0 0 1 28 16"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your Folders ready for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--layer1)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header and Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                        <h1 className="text-2xl md:text-4xl text-[var(--text)] font-brand">Folders</h1>
                    </div>

                    <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="flex items-center justify-center gap-2 bg-[var(--nice-blue)] text-white px-4
                    py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-sm w-fit cursor-pointer">
                        <Plus size={18} />
                        New Item
                    </button>
                </div>

                {/* Folders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {folders.map(folder => (
                        <motion.div
                            key={folder.id}
                            whileHover={{ y: -4 }}
                            onClick={() => router.push(`/dashboard/Folders/${folder.id}`)}
                            className="group relative cursor-pointer"
                        >
                            <div className="absolute -top-2 left-0 w-16 h-4 bg-[var(--layer3)] rounded-t-lg group-hover:bg-[var(--nice-blue)] transition-colors duration-300" />

                            <div className="relative bg-[var(--layer2)] border border-[var(--layer3)] rounded-xl rounded-tl-none p-5 flex flex-col min-h-[140px] shadow-sm group-hover:border-[var(--nice-blue)] group-hover:shadow-md transition-all duration-300">

                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-[var(--nice-blue)]/10 rounded-lg text-[var(--nice-blue)]">
                                        <Folder size={20} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, folder.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mt-auto">
                                    <h3 className="font-bold text-[var(--text)] text-base truncate mb-1">
                                        {folder.name || 'Untitled Folder'}
                                    </h3>

                                    <div className="flex items-center justify-between border-t border-[var(--layer3)] pt-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            <Clock size={12} />
                                            {formatDate(folder.updated_at)}
                                        </div>
                                        {/* Placeholder for item count for when i add it later */}
                                        <span className="text-[10px] bg-[var(--layer3)] px-2 py-0.5 rounded-full text-[var(--text-muted)]">
                            Folder
                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {showCreateFolderModal && (
                    <CreateFolderModal
                        createFolderModalRef={createFolderModalRef}
                        setShowCreateFolderModal={setShowCreateFolderModal}
                        setFolderName={setFolderName}
                        handleCreateFolder={handleCreateFolder}
                    />
                )}
            </div>
        </div>
    );
}