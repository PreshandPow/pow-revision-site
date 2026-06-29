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
            if (itemType === 'folder') tableName = 'folders';
            else if (itemType === 'note') tableName= 'notes';

            const { error } = await supabase
                .from(tableName)
                .update({ name: newName })
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