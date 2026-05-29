import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Force www redirect
 *
 * Detects requests to the bare domain (agencycyberinsurance.com)
 * and issues a 301 permanent redirect to www.agencycyberinsurance.com,
 * preserving the full path and query string.
 *
 * This prevents Google Search Console indexing failures caused by
 * non-www URLs returning HTTP 200 instead of redirecting.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Only redirect the bare (non-www) production domain
  if (hostname === "agencycyberinsurance.com") {
    const url = request.nextUrl.clone();
    url.hostname = "www.agencycyberinsurance.com";
    url.port = ""; // Clear any port for clean URL
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

/**
 * Matcher: Run middleware on all routes EXCEPT static assets.
 * This avoids unnecessary middleware invocations for files that
 * are served directly by the CDN/edge.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (data fetching)
     * - images/ (public images)
     * - videos/ (public videos)
     * - audio/ (public audio)
     * - favicon.ico, icon-*, apple-touch-icon, *.svg, *.png at root
     * - sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|_next/data|images/|videos/|audio/|favicon\\.ico|icon-.*|apple-touch-icon\\.png|favicon-.*|.*\\.svg$|og-image\\.png|logo\\.png|logo-icon\\.png|sitemap\\.xml|robots\\.txt).*)" ,
  ],
};
