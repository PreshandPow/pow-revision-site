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

export const createFlashcardAction = async (deckData, folderId = null, router) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: deck, error: deckError } = await supabase
        .from('flashcard_decks')
        .insert({
            user_id: user.id,
            name: deckData.title || 'Untitled Deck',
            description: deckData.description || null,
            folder_id: folderId,
        })
        .select()
        .single();

    if (deckError) {
        toast.error('Could not create flashcard deck');
        return null;
    }

    const validCards = deckData.cards.filter(
        card => card.term.trim() !== '' || card.definition.trim() !== ''
    );

    if (validCards.length > 0) {
        const cardsToInsert = validCards.map((card, index) => ({
            deck_id: deck.id,
            term: card.term,
            definition: card.definition,
            order_index: index,
        }));

        const { error: cardsError } = await supabase
            .from('flashcards')
            .insert(cardsToInsert);

        if (cardsError) {
            toast.error('Deck created, but failed to save some cards.');
            console.error(cardsError);
        }
    }

    toast.success('Flashcard deck created!');

    if (router) {
        router.push(`/dashboard/Flashcards/${deck.id}`);
    }

    return deck;
};