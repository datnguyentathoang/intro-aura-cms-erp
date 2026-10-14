'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminFetch, ensureOk } from '@/lib/api'

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

export async function addStep(workflowId: string, formData: FormData) {
  await ensureOk(await adminFetch(base(workflowId), { method: 'POST', json: bodyOf(formData) }))
  refresh(workflowId)
  redirect(`/admin/workflows/${workflowId}/steps`)
}

export async function updateStep(workflowId: string, stepId: string, formData: FormData) {
  await ensureOk(
    await adminFetch(`${base(workflowId)}/${stepId}`, { method: 'PUT', json: bodyOf(formData) })
  )
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