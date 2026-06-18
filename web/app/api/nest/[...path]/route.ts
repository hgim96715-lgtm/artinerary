import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

const COOKIE_NAME =
  process.env.COOKIE_NAME ?? 'artinerary-auth-token';

const isProd = process.env.NODE_ENV === 'production';

const cookieBase = isProd
  ? 'Path=/; HttpOnly; Secure; SameSite=Lax'
  : 'Path=/; HttpOnly; SameSite=Lax';

const hopByHop = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

const rewriteSetCookies = (upstream: Response, resHeaders: Headers) => {
  const rawCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];

  const escapedName = COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const raw of rawCookies) {
    const cleared =
      /Max-Age=0/i.test(raw) ||
      /Expires=Thu, 01 Jan 1970/i.test(raw);

    if (cleared) {
      resHeaders.append(
        'Set-Cookie',
        `${COOKIE_NAME}=; ${cookieBase}; Max-Age=0`,
      );
      continue;
    }

    const match = raw.match(new RegExp(`${escapedName}=([^;]+)`));
    if (match?.[1]) {
      resHeaders.append(
        'Set-Cookie',
        `${COOKIE_NAME}=${match[1]}; ${cookieBase}; Max-Age=${7 * 24 * 60 * 60}`,
      );
    }
  }
};

const proxy = async (
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const targetPath = path.join('/');
  const url = `${UPSTREAM.replace(/\/$/, '')}/${targetPath}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (hopByHop.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(url, init);

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    resHeaders.set(key, value);
  });

  rewriteSetCookies(upstream, resHeaders);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
