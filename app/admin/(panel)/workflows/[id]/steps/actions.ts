'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RecordFormState } from '@/lib/actions'
import { adminFetch, ensureOk } from '@/lib/api'
import { rethrowRedirect } from '@/lib/upload'

const base = (wf: string) => `/api/admin/workflows/${wf}/steps`

function refresh(workflowId: string) {
  revalidatePath('/')
  revalidatePath(`/admin/workflows/${workflowId}/steps`)
}

function bodyOf(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? '') || null,
    step_order: Number(formData.get('step_order') || 0),
  }
}

export async function addStep(workflowId: string, _prev: RecordFormState, formData: FormData): Promise<RecordFormState> {
  try {
    await ensureOk(await adminFetch(base(workflowId), { method: 'POST', json: bodyOf(formData) }))
  } catch (e) {
    rethrowRedirect(e)
    return { error: e instanceof Error ? e.message : 'Không lưu được bước' }
  }
  refresh(workflowId)
  redirect(`/admin/workflows/${workflowId}/steps`)
}

export async function updateStep(
  workflowId: string,
  stepId: string,
  _prev: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  try {
    await ensureOk(
      await adminFetch(`${base(workflowId)}/${stepId}`, { method: 'PUT', json: bodyOf(formData) })
    )
  } catch (e) {
    rethrowRedirect(e)
    return { error: e instanceof Error ? e.message : 'Không lưu được bước' }
  }
  refresh(workflowId)
  redirect(`/admin/workflows/${workflowId}/steps`)
}

export async function deleteStep(workflowId: string, stepId: string) {
  await ensureOk(await adminFetch(`${base(workflowId)}/${stepId}`, { method: 'DELETE' }))
  refresh(workflowId)
}

export async function moveStep(workflowId: string, stepId: string, direction: 'up' | 'down') {
  await ensureOk(
    await adminFetch(`${base(workflowId)}/${stepId}/move?direction=${direction}`, { method: 'POST' })
  )
  refresh(workflowId)
}