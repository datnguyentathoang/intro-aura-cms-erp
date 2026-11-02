"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hệ thống đang khởi động</h1>
        <p className="mt-3 text-gray-600">
          Máy chủ có thể đang thức dậy sau một thời gian không hoạt động. Vui lòng thử lại sau ít giây.
        </p>
        <button onClick={reset} className="mt-6 rounded-lg bg-brand-700 px-6 py-3 font-medium text-white hover:bg-brand-800">
          Thử lại
        </button>
      </div>
    </main>
  );
}