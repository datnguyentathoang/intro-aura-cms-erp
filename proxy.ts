import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  EMAIL_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  clearedCookieOptions,
} from "@/lib/auth-cookies";

type Tokens = { access_token: string; refresh_token: string; expires_in: number };
type Outcome = { tokens: Tokens } | { error: "invalid" | "network" };

const GRACE_MS = 15_000;
const inflight = new Map<string, Promise<Outcome>>();
const recent = new Map<string, { at: number; outcome: Outcome }>();

async function callRefresh(rt: string): Promise<Outcome> {
  const base = process.env.API_BASE_URL;
  if (!base) return { error: "network" };
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
      cache: "no-store",
    });
    if (res.ok) return { tokens: (await res.json()) as Tokens };
    if (res.status >= 500 || res.status === 429) return { error: "network" };
    return { error: "invalid" };
  } catch {
    return { error: "network" };
  }
}

// Gộp các request cùng lúc dùng chung một refresh token thành MỘT lần gọi API,
// tránh bị coi là "dùng lại token" và bị hủy phiên.
function refreshOnce(rt: string): Promise<Outcome> {
  const cached = recent.get(rt);
  if (cached && Date.now() - cached.at < GRACE_MS) return Promise.resolve(cached.outcome);

  const running = inflight.get(rt);
  if (running) return running;

  const p = callRefresh(rt)
    .then((outcome) => {
      if ("tokens" in outcome || outcome.error === "invalid") {
        recent.set(rt, { at: Date.now(), outcome });
        setTimeout(() => recent.delete(rt), GRACE_MS);
      }
      return outcome;
    })
    .finally(() => inflight.delete(rt));
  inflight.set(rt, p);
  return p;
}

function toLogin(request: NextRequest, opts: { error?: string; clear?: boolean } = {}) {
  const url = new URL("/admin/login", request.url);
  if (opts.error) url.searchParams.set("error", opts.error);
  const res = NextResponse.redirect(url);
  if (opts.clear) {
    for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, EMAIL_COOKIE]) {
      res.cookies.set(name, "", clearedCookieOptions);
    }
  }
  return res;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  // Còn access token (cookie hết hạn trước token 30 giây)
  if (request.cookies.get(ACCESS_COOKIE)?.value) return NextResponse.next();

  const rt = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!rt) return toLogin(request);

  const outcome = await refreshOnce(rt);
  if (!("tokens" in outcome)) {
    return outcome.error === "network"
      ? toLogin(request, { error: "api" })
      : toLogin(request, { clear: true });
  }

  const t = outcome.tokens;
  // Để Server Components trong cùng request đọc được token mới
  request.cookies.set(ACCESS_COOKIE, t.access_token);
  request.cookies.set(REFRESH_COOKIE, t.refresh_token);
  const response = NextResponse.next({ request });
  response.cookies.set(ACCESS_COOKIE, t.access_token, accessCookieOptions(t.expires_in));
  response.cookies.set(REFRESH_COOKIE, t.refresh_token, refreshCookieOptions);
  return response;
}

export const config = { matcher: ["/admin/:path*"] };