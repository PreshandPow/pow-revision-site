import { useState } from 'react';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export function createNoteAction({ folderId }) {
    const supabase = createClient();
    const createNote = async() => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: note, error } = await supabase
            .from('notes')
            .insert({ user_id: user.id, title: 'Untitled', content: '', folder_id: folderId })
            .select()
            .single();

        if (error) { toast.error('Could not create note', toastStyle); return; }
    }
}