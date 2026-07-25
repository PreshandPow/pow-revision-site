import { useState } from 'react';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export function useRenameItem() {
    const supabase = createClient();
    const [isRenaming, setIsRenaming] = useState(false);
    const rename = async (itemType, itemId, newName) => {
        setIsRenaming(true);
        console.log("DEBUG RENAME:", { itemType, itemId, newName });
        try {
            let tableName = '';
            let tableRow = '';
            if (itemType === 'folder') {
                tableName = 'folders';
                tableRow = 'name';
            }
            else if (itemType === 'note') {
                tableName = 'notes';
                tableRow = 'title';
            }
            else if (itemType === 'flashcard') {
                tableName = 'flashcard_decks';
                tableRow = 'name';
            }
            const { error } = await supabase
                .from(tableName)
                .update({ [tableRow]: newName })
                .eq('id', itemId);

            if (error) throw error;

            toast.success(`${itemType} renamed successfully`);
            return true;
        } catch (error) {
            console.error('SUPABASE ERROR', error);
            toast.error(`Failed to rename your ${itemType}`);
            return false;
        } finally {
            setIsRenaming(false);
        }
    };
    return { rename, isRenaming };
}

export function useMoveItem() {
    const supabase = createClient();
    const [isMoving, setIsMoving] = useState(false);
    const moveItem = async(itemType, itemId, destinationId) => {
        setIsMoving(true);
        console.log("DEBUG MOVE ITEM:", { itemType, itemId, destinationId });

        try {
            let tableName = '';
            let tableRow = '';
            if (itemType === 'folder') {
                tableName = 'folders';
                tableRow = 'parent_folder_id';
            }
            if (itemType === 'note') {
                tableName = 'notes';
                tableRow = 'folder_id';
            }
            if (itemType === 'flashcard') {
                tableName = 'flashcard_decks';
                tableRow = 'folder_id';
            }
            if (destinationId === 'root') {
                const { error } = await supabase
                    .from(tableName)
                    .update({ [tableRow]: null })
                    .eq('id', itemId)

                if (error) throw error;
            }   else {
                const { error } = await supabase
                    .from(tableName)
                    .update({ [tableRow]: destinationId })
                    .eq('id', itemId)

                if (error) throw error;
            }
            toast.success(`${itemType} moved successfully`);
            return true;
        } catch (error) {
            console.error('SUPABASE ERROR', error);
            toast.error(`Failed to move your ${itemType}`);
            return false;
        }   finally {
            setIsMoving(false);
        }
    };
    return { moveItem, isMoving };
}

export function useDeleteItem () {
    const supabase = createClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteItem = async(itemType, itemId) => {
        setIsDeleting(true);
        console.log("DEBUG MOVE ITEM:", { itemType, itemId });
        try {
            let tableName = '';
            if (itemType === 'note') tableName= 'notes';
            if (itemType === 'folder') tableName= 'folders';
            if (itemType === 'flashcard') tableName= 'flashcard_decks';
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', itemId)

            if (error) throw error;
            toast.success(`${itemType} deleted successfully`);
            return true;
        } catch (error) {
            console.error('SUPABASE ERROR', error);
            toast.error(`Failed to delete your ${itemType}`);
            return false;
        }   finally {
            setIsDeleting(false);
        }
    };
    return { deleteItem, isDeleting };
}

export function useDuplicateItem () {
    const supabase = createClient();
    const [isDuplicating, setIsDuplicating] = useState(false);

    const duplicateItem = async (itemType, item) => {
        setIsDuplicating(true);
        let newItem = null;

        try {
            if (itemType === 'note') {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: newNote, error } = await supabase
                    .from('notes')
                    .insert({
                        title: `${item?.title} (copy)`,
                        user_id: user?.id,
                        folder_id: item?.folder_id,
                        content: item?.content,
                        tags: item?.tags
                    })
                    .select()
                    .single();
                if (error) throw error;
                newItem = newNote;
            }
            if (itemType === 'folder') {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: newFolder, error } = await supabase
                    .from('folders')
                    .insert({
                        name: `${item?.name} (copy)`,
                        user_id: user?.id,
                        parent_folder_id: item?.parent_folder_id,
                    })
                    .select()
                    .single();
                if (error) throw error;
                newItem = newFolder;
            }

            return newItem;
        } catch (error) {
            console.error('SUPABASE ERROR', error);
            toast.error(`Failed to duplicate your ${itemType}`);
            return null;
        } finally {
            setIsDuplicating(false);
        }
    };
    return { duplicateItem, isDuplicating }
}
