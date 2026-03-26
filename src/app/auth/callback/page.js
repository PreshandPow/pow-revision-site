'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    useEffect(() => {
        const handleCallback = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('session:', session);
            console.log('error:', error);

            if (session) {
                const user = session.user;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, date_of_birth')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!profile) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        username: user.user_metadata.full_name,
                        date_of_birth: null,
                        avatar_url: user.user_metadata.avatar_url
                    });
                }

                router.replace('/dashboard');
            }
        };

        handleCallback();
    }, []);

    return <div>Signing you in...</div>;
}