import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

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
    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    if (user && pathname === '/') {
        console.log('sending to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!user && pathname.startsWith('/dashboard')) {
        console.log('sending to home')
        return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('no condition reahced', pathname, !!user)
    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}