import { redirect } from "next/navigation";
import { setSession, type LoginResult } from "@/lib/session";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const base = process.env.API_BASE_URL?.replace(/\/$/, "");

  let res: Response | null = null;
  try {
    res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    res = null;
  }

  if (!res) redirect("/admin/login?error=api");
  if (res.status === 429) redirect("/admin/login?error=rate");
  if (!res.ok) redirect("/admin/login?error=1");

  const data = (await res.json()) as LoginResult;
  await setSession(data, email.trim().toLowerCase());
  redirect("/admin");
}

const MESSAGES: Record<string, string> = {
  "1": "Sai email hoặc mật khẩu.",
  rate: "Thử quá nhiều lần, vui lòng đợi một phút.",
  api: "Không kết nối được máy chủ. Vui lòng thử lại sau.",
};

const input =
  "w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 via-brand-950 to-accent-950 px-4 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-blob [animation-delay:3s]" />

      <form
        action={login}
        className="animate-fade-up relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-600/30">
            A
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Đăng nhập quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nội dung website giới thiệu</p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">
            {MESSAGES[error] ?? MESSAGES["1"]}
          </p>
        )}

        <input name="email" type="email" placeholder="Email" required className={input} />
        <input name="password" type="password" placeholder="Mật khẩu" required className={input} />

        <button className="w-full bg-brand-600 text-white rounded-lg py-3 font-medium hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 transition-all">
          Đăng nhập
        </button>
      </form>
    </main>
  );
}