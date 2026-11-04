"use server";
import { callApi } from "@/lib/admin-call";
import { rethrowRedirect } from "@/lib/upload";

export type AssistantTestResult = {
  reply?: string;
  sources?: { title: string; url: string | null }[];
  suggest_lead?: boolean;
  error?: string;
};

export async function testAssistant(message: string): Promise<AssistantTestResult> {
  try {
    const r = await callApi<AssistantTestResult>("/api/admin/ai/test", { method: "POST", json: { message } });
    return r.ok && r.data ? r.data : { error: r.error ?? "Không hỏi thử được" };
  } catch (e) {
    rethrowRedirect(e);
    return { error: e instanceof Error ? e.message : "Không hỏi thử được" };
  }
}
