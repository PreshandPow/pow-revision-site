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
    const [isMovingItem, setIsMovingItem] = useState(false);

    const moveItem = async(itemType, itemId, destinationId) => {
        setIsMovingItem(true);
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
            setIsMovingItem(false);
        }
    };
    return { moveItem, isMovingItem  }
}