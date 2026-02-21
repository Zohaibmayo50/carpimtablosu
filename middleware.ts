import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tracking parameters that create duplicate URLs
const TRACKING_PARAMS = ['fbclid', 'gclid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'ref']

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Strip tracking/session query parameters to avoid duplicate URL crawling
  const hasTracking = TRACKING_PARAMS.some(p => searchParams.has(p))
  if (hasTracking) {
    // Preserve any non-tracking params (there usually aren't any on this site)
    const cleanUrl = new URL(pathname, request.url)
    return NextResponse.redirect(cleanUrl, { status: 301 })
  }

  // Block WordPress paths and PHP files
  if (pathname.startsWith('/wp-') || 
      pathname.includes('/wp-content/') ||
      pathname.includes('/wp-includes/') ||
      pathname.includes('/wp-admin/') ||
      pathname.includes('/wordpress/') ||
      pathname.endsWith('.php')) {
    return NextResponse.redirect(new URL('/', request.url), 301)
  }

  // Block malformed URLs with template variables
  if (pathname.includes('%7B') || 
      pathname.includes('%7D') ||
      pathname.includes('{search_term') ||
      pathname === '/)') {
    return NextResponse.redirect(new URL('/', request.url), 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|sitemap.xml|robots.txt|ads.txt).*)',
  ],
}
