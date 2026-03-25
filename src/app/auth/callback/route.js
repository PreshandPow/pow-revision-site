import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();  // await this

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: (cookiesToSet) =>
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        ),
                },
            }
        );

        await supabase.auth.exchangeCodeForSession(code);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, date_of_birth')
                .eq('id', user.id)
                .maybeSingle();

            console.log('profile:', profile);
            console.log('profile error:', profileError);

            if (!profile) {
                console.log(JSON.stringify(user.user_metadata, null, 2));
                console.log('user avatar url ' + user.user_metadata.avatar_url)
                await supabase.from('profiles').insert({
                    id: user.id,
                    username: user.user_metadata.full_name,
                    date_of_birth: null,
                    avatar_url: user.user_metadata.avatar_url
                });
                const { error: insertError } = await supabase.from('profiles').insert({
                    id: user.id,
                    username: user.user_metadata.full_name,
                    date_of_birth: null,
                    avatar_url: user.user_metadata.avatar_url
                });
                console.log('insert error:', insertError);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } else if (!profile.date_of_birth) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
}