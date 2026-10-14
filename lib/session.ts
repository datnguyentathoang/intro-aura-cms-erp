import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  EMAIL_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  clearedCookieOptions,
} from "@/lib/auth-cookies";

export type LoginResult = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  email?: string;
};

export async function setSession(t: LoginResult, fallbackEmail = "") {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, t.access_token, accessCookieOptions(t.expires_in));
  jar.set(REFRESH_COOKIE, t.refresh_token, refreshCookieOptions);
  jar.set(EMAIL_COOKIE, t.email ?? fallbackEmail, refreshCookieOptions);
}

export async function getEmail() {
  const jar = await cookies();
  return jar.get(EMAIL_COOKIE)?.value ?? "";
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  const base = process.env.API_BASE_URL;
  if (token && base) {
    try {
      await fetch(`${base.replace(/\/$/, "")}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // API không phản hồi vẫn xóa cookie ở trình duyệt
    }
  }
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, EMAIL_COOKIE]) {
    jar.set(name, "", clearedCookieOptions);
  }
}