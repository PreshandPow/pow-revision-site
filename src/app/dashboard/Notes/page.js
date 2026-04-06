'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, FileText, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export default function NotesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [notes, setNotes] = useState([]);
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
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/'); return; }

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) toast.error(error.message, toastStyle);
        else setNotes(data || []);
        setLoading(false);
    };

    const handleCreateNote = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: note, error } = await supabase
            .from('notes')
            .insert({ user_id: user.id, title: 'Untitled', content: '' })
            .select()
            .single();

        if (error) { toast.error('Could not create note', toastStyle); return; }
        router.push(`/dashboard/Notes/${note.id}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) { toast.error('Could not delete note', toastStyle); return; }
        setNotes(prev => prev.filter(n => n.id !== id));
        toast.success('Note deleted', toastStyle);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--layer1)] backdrop-blur-xl p-6">
            <div className="w-16 h-16 mb-8 rounded-2xl bg-[var(--nice-blue)] animate-pulse shadow-[0_0_40px_rgba(var(--blue-rgb),0.3)]" />

            <h1 className="font-brand text-[var(--text)] text-2xl md:text-3xl font-bold tracking-tight text-center max-w-md leading-tight">
                <span className="text-[var(--nice-blue)]">POW Bot</span> is getting your notes for you
            </h1>
            <p className="mt-4 text-[var(--text-muted)] font-medium animate-bounce">
                Fetching your data...
            </p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--layer2)] p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">Notes</h1>
                        <p className="text-[var(--text-muted)] mt-1 text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={handleCreateNote}
                        className="flex items-center gap-2 bg-[var(--nice-blue)] text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-95 transition-transform cursor-pointer"
                    >
                        <Plus size={18} />
                        New note
                    </button>
                </div>

                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--layer1)] border border-[var(--layer3)] flex items-center justify-center">
                            <FileText size={28} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text)] font-bold text-lg">No notes yet</p>
                        <p className="text-[var(--text-muted)] text-sm">Create your first note to get started.</p>
                        <button
                            onClick={handleCreateNote}
                            className="flex items-center gap-2 border border-[var(--layer3)] text-[var(--text)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--layer1)] transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                            Create note
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => router.push(`/dashboard/Notes/${note.id}`)}
                                className="group bg-[var(--layer1)] border border-[var(--layer3)] rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--nice-blue)] transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-[var(--text)] truncate flex-1">{note.title || 'Untitled'}</p>
                                    <button
                                        onClick={(e) => handleDelete(e, note.id)}
                                        className="md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                                    >
                                        <Trash2 size={15} className="text-red-400" />
                                    </button>
                                </div>

                                <p className="text-sm text-[var(--text-muted)] line-clamp-2 flex-1">
                                    {note.content || 'No content yet...'}
                                </p>

                                {note.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {note.tags.map(tag => (
                                            <span key={tag} className="text-xs font-semibold bg-[var(--layer2)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--layer3)] pt-3 mt-auto">
                                    <Clock size={12} />
                                    {formatDate(note.updated_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}