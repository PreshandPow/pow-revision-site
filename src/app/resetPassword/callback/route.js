import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from "../../../lib/supabase-server";

export async function GET(request) {
    // ─── 1. URL PARSING ─────────────────────────────────────────────────────────
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    console.log('Extracted code:', code);

    // Handle proxies
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'http';
    const actualOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

    console.log('running route');

    if (code) {
        // ─── 2. SUPABASE CLIENT INITIALIZATION ──────────────────────────────────
        const supabase = await createClient();

        // ─── 3. AUTH EXCHANGE ───────────────────────────────────────────────────
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // ─── 4. SUCCESSFUL REDIRECT ───────────────────────────────────────────
            return NextResponse.redirect(`${actualOrigin}/resetPassword`)
        } else {
            console.error("Auth exchange error:", error)
        }
    }

    // ─── 5. FALLBACK REDIRECT ───────────────────────────────────────────────────
    return NextResponse.redirect(`${actualOrigin}/`)
}