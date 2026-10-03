'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { RESOURCES } from '@/lib/resources'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')
  return supabase
}

async function uploadImage(supabase: SupabaseClient, file: File, folder: string) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw new Error(error.message)
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
}

// Thêm / sửa cho mọi bảng. id = null nghĩa là thêm mới.
export async function saveRecord(table: string, id: string | null, formData: FormData) {
  const res = RESOURCES[table]
  if (!res) throw new Error('Bảng không hợp lệ')
  const supabase = await requireUser()

  const payload: Record<string, unknown> = {}
  for (const f of res.fields) {
    if (f.type === 'image') {
      const file = formData.get(f.name) as File | null
      if (file && file.size > 0) payload[f.name] = await uploadImage(supabase, file, table)
    } else if (f.type === 'checkbox') {
      payload[f.name] = formData.get(f.name) === 'on'
    } else if (f.type === 'number') {
      payload[f.name] = Number(formData.get(f.name) || 0)
    } else {
      const v = String(formData.get(f.name) ?? '')
      payload[f.name] = v === '' && !f.required ? null : v
    }
  }

  const { error } = res.single
    ? await supabase.from(table).upsert({ id: 1, ...payload })
    : id
      ? await supabase.from(table).update(payload).eq('id', id)
      : await supabase.from(table).insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath(`/admin/${table}`)
  redirect(`/admin/${table}`)
}

export async function deleteRecord(table: string, id: string) {
  if (!RESOURCES[table]) throw new Error('Bảng không hợp lệ')
  const supabase = await requireUser()
  await supabase.from(table).delete().eq('id', id)
  revalidatePath('/')
  revalidatePath(`/admin/${table}`)
}

export async function toggleHandled(id: string, value: boolean) {
  const supabase = await requireUser()
  await supabase.from('contact_messages').update({ is_handled: value }).eq('id', id)
  revalidatePath('/admin/messages')
}

export async function deleteMessage(id: string) {
  const supabase = await requireUser()
  await supabase.from('contact_messages').delete().eq('id', id)
  revalidatePath('/admin/messages')
}

// Khách gửi form liên hệ (không cần đăng nhập)
export async function submitMessage(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('contact_messages').insert({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })
  redirect('/?sent=1#contact')
}