const BOT_USER_AGENT =
  /facebookexternalhit|facebot|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|applebot|bingbot|googlebot/i;

export const config = {
  matcher: ["/link", "/link/", "/item/:path*"],
};

function rewriteToApiLink(request: Request): Response {
  const url = new URL(request.url);
  const rewriteUrl = new URL("/api/link", url.origin);
  rewriteUrl.search = url.search;

  const itemMatch = url.pathname.match(/^\/item\/([^/]+)\/?$/i);
  if (itemMatch?.[1]) {
    try {
      rewriteUrl.searchParams.set("listingId", decodeURIComponent(itemMatch[1]));
    } catch {
      rewriteUrl.searchParams.set("listingId", itemMatch[1]);
    }
    rewriteUrl.searchParams.set("skipSplash", "1");
  }

  return new Response(null, {
    headers: {
      "x-middleware-rewrite": rewriteUrl.toString(),
    },
  });
}

export default function middleware(request: Request): Response {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_USER_AGENT.test(userAgent)) {
    return new Response(null, {
      headers: {
        "x-middleware-next": "1",
      },
    });
  }
  return rewriteToApiLink(request);
}
