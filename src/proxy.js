import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { isAuthRetryableFetchError } from '@supabase/supabase-js'

const AUTH_TIMEOUT_MS = 3000
const TIMED_OUT = 'TIMED_OUT'

async function getUserWithTimeout(supabase) {
    let timer

    const timeout = new Promise(resolve => {
        timer = setTimeout(() => resolve(TIMED_OUT), AUTH_TIMEOUT_MS)
    })

    try {
        return await Promise.race([supabase.auth.getUser(), timeout])
    } finally {
        clearTimeout(timer)
    }
}

export async function proxy(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )
    const result = await getUserWithTimeout(supabase)
    const timedOut = result === TIMED_OUT

    const user = timedOut ? null : result.data.user
    const error = timedOut ? null : result.error

    const { pathname } = request.nextUrl

    // user being 'null' proves nothing, so it shouldn't be treated as a logout
    const authUnavailable = timedOut || isAuthRetryableFetchError(error)

    if (authUnavailable) {
        console.warn('AUTH UNAVAILABLE:', pathname, timedOut ? 'timed out' : error?.name)
    }

    if (user && pathname === '/') {
        console.log('sending to dashboard')
        const returnResponse =  NextResponse.redirect(new URL('/dashboard', request.url))
        response.cookies.getAll().forEach(cookie => returnResponse.cookies.set(cookie))
        return returnResponse
    }

    if (!user && !authUnavailable && pathname.startsWith('/dashboard')) {
        console.log('sending to home')
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml|woff|woff2)$).*)',
    ],
}