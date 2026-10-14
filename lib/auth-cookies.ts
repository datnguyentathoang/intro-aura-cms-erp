export const ACCESS_COOKIE = "aura_at";
export const REFRESH_COOKIE = "aura_rt";
export const EMAIL_COOKIE = "aura_email";

const base = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/admin",
};

// Cookie access hết hạn sớm 30 giây để proxy kịp làm mới token
export const accessCookieOptions = (expiresIn: number) => ({
  ...base,
  maxAge: Math.max(expiresIn - 30, 60),
});
export const refreshCookieOptions = { ...base, maxAge: 60 * 60 * 24 * 7 };
export const clearedCookieOptions = { ...base, maxAge: 0 };