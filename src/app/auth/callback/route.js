import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
    // ─── 1. URL & ORIGIN PARSING ────────────────────────────────────────────────
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    // Handle proxies
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http';
    const actualOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

    console.log('running route');

    if (code) {
        // ─── 2. SUPABASE CLIENT INITIALIZATION ──────────────────────────────────
        const supabase = await createClient();

        // ─── 3. AUTH EXCHANGE & PROFILE CREATION ────────────────────────────────
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

            // ─── 4. SUCCESSFUL REDIRECT ───────────────────────────────────────────
            return NextResponse.redirect(`${actualOrigin}${next}`);
        } else {
            console.error("Auth exchange error:", error);
        }
    }

    // ─── 5. FALLBACK REDIRECT ───────────────────────────────────────────────────
    return NextResponse.redirect(`${actualOrigin}/`);
}