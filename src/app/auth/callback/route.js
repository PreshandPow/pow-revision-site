import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http';

    const actualOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

    console.log('running route')

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (error) {
                            console.error('Cookie setting error:', error);
                        }
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.session) {
            const user = data.session.user;

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile) {
                await supabase.from('profiles').insert({
                    id: user.id,
                    username: null,
                    date_of_birth: null,
                    avatar_url: user.user_metadata.avatar_url
                });
            }
            return NextResponse.redirect(`${actualOrigin}${next}`);
        } else {
            console.error("Auth exchange error:", error);
        }
    }

    return NextResponse.redirect(`${actualOrigin}/`);
}