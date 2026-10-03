'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')
  return supabase
}

function refresh(workflowId: string) {
  revalidatePath('/')
  revalidatePath(`/admin/workflows/${workflowId}/steps`)
}

async function getSteps(workflowId: string) {
  const supabase = await requireUser()
  const { data } = await supabase
    .from('workflow_steps')
    .select('id, step_order')
    .eq('workflow_id', workflowId)
    .order('step_order')
    .order('id')
  return { supabase, rows: (data ?? []) as { id: string; step_order: number }[] }
}

// Đánh lại số bước liên tục 1, 2, 3...
async function renumber(workflowId: string) {
  const { supabase, rows } = await getSteps(workflowId)
  await Promise.all(
    rows.map((r, i) =>
      r.step_order === i + 1
        ? null
        : supabase.from('workflow_steps').update({ step_order: i + 1 }).eq('id', r.id)
    )
  )
}

export async function addStep(workflowId: string, formData: FormData) {
  const supabase = await requireUser()
  const { error } = await supabase.from('workflow_steps').insert({
    workflow_id: workflowId,
    step_order: Number(formData.get('step_order') || 0),
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? '') || null,
  })
  if (error) throw new Error(error.message)
  refresh(workflowId)
  redirect(`/admin/workflows/${workflowId}/steps`)
}

export async function updateStep(workflowId: string, stepId: string, formData: FormData) {
  const supabase = await requireUser()
  const { error } = await supabase
    .from('workflow_steps')
    .update({
      step_order: Number(formData.get('step_order') || 0),
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? '') || null,
    })
    .eq('id', stepId)
  if (error) throw new Error(error.message)
  refresh(workflowId)
  redirect(`/admin/workflows/${workflowId}/steps`)
}

export async function deleteStep(workflowId: string, stepId: string) {
  const supabase = await requireUser()
  await supabase.from('workflow_steps').delete().eq('id', stepId)
  await renumber(workflowId)
  refresh(workflowId)
}

export async function moveStep(workflowId: string, stepId: string, direction: 'up' | 'down') {
  const { supabase, rows } = await getSteps(workflowId)
  const i = rows.findIndex((r) => r.id === stepId)
  const j = direction === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= rows.length) return

  ;[rows[i], rows[j]] = [rows[j], rows[i]]
  await Promise.all(
    rows.map((r, idx) =>
      supabase.from('workflow_steps').update({ step_order: idx + 1 }).eq('id', r.id)
    )
  )
  refresh(workflowId)
}