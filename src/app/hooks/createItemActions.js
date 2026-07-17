import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export const createFolderAction = async (folderName, folderId = null, router) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: folder, error } = await supabase
        .from('folders')
        .insert({
            user_id: user.id,
            name: folderName || 'Untitled Folder',
            parent_folder_id: folderId
        })
        .select()
        .single();

    if (error) {
        toast.error('Could not create folder');
        return null;
    }

    return folder;
};

export const createNoteAction = async (folderId = null, router) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: note, error } = await supabase
        .from('notes')
        .insert({
            user_id: user.id,
            title: 'Untitled Note',
            content: '',
            folder_id: folderId
        })
        .select()
        .single();

    if (error) {
        toast.error('Could not create note');
        return null;
    }

    return note;
};

export const createFlashcardAction = async (folderId = null, router) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: flashcard, error } = await supabase
        .from('flashcards')
        .insert({
            user_id: user.id,
            name: 'Untitled Deck',
            description: 'No description yet...',
            folder_id: folderId,
        })
        .select()
        .single();

    if (error) {
        toast.error('Could not create flashcard');
        return null
    }
};