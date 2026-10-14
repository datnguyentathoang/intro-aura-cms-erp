'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { RESOURCES } from '@/lib/resources'
import { adminFetch, adminJson, ensureOk, publicPost } from '@/lib/api'

const FOLDERS = ['hero', 'features', 'workflows', 'screenshots']

async function uploadImage(file: File, table: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', FOLDERS.includes(table) ? table : 'misc')
  const res = await adminFetch('/api/admin/upload', { method: 'POST', form })
  await ensureOk(res)
  const data = (await res.json()) as { url: string }
  return data.url
}

// Thêm / sửa cho mọi bảng. id = null nghĩa là thêm mới.
export async function saveRecord(table: string, id: string | null, formData: FormData) {
  const res = RESOURCES[table]
  if (!res?.api) throw new Error('Bảng không hợp lệ')

  const payload: Record<string, unknown> = {}
  for (const f of res.fields) {
    if (f.type === 'image') {
      const file = formData.get(f.name)
      if (file instanceof File && file.size > 0) {
        payload[f.name] = await uploadImage(file, table)
      }
    } else if (f.type === 'checkbox') {
      payload[f.name] = formData.get(f.name) === 'on'
    } else if (f.type === 'number') {
      payload[f.name] = Number(formData.get(f.name) || 0)
    } else {
      const v = String(formData.get(f.name) ?? '')
      payload[f.name] = v === '' && !f.required ? null : v
    }
  }

  const base = `/api/admin/${res.api}`

  // API ghi đè toàn bộ bản ghi khi sửa, nên gộp với dữ liệu hiện tại
  // để không làm mất ảnh cũ hoặc các cột không nằm trong form.
  if (res.single) {
    const current = (await adminJson<Record<string, unknown>>(base)) ?? {}
    await ensureOk(await adminFetch(base, { method: 'PUT', json: { ...current, ...payload } }))
  } else if (id) {
    const current = await adminJson<Record<string, unknown>>(`${base}/${id}`)
    if (!current) throw new Error('Không tìm thấy mục cần sửa')
    await ensureOk(
      await adminFetch(`${base}/${id}`, { method: 'PUT', json: { ...current, ...payload } })
    )
  } else {
    await ensureOk(await adminFetch(base, { method: 'POST', json: payload }))
  }

  revalidatePath('/')
  revalidatePath(`/admin/${table}`)
  redirect(`/admin/${table}`)
}

export async function deleteRecord(table: string, id: string) {
  const res = RESOURCES[table]
  if (!res?.api) throw new Error('Bảng không hợp lệ')
  await ensureOk(await adminFetch(`/api/admin/${res.api}/${id}`, { method: 'DELETE' }))
  revalidatePath('/')
  revalidatePath(`/admin/${table}`)
}

// Đổi thứ tự (↑ ↓)
export async function moveRecord(table: string, id: string, direction: 'up' | 'down') {
  const res = RESOURCES[table]
  if (!res?.api || res.single) throw new Error('Bảng không hợp lệ')
  await ensureOk(
    await adminFetch(`/api/admin/${res.api}/${id}/move?direction=${direction}`, { method: 'POST' })
  )
  revalidatePath('/')
  revalidatePath(`/admin/${table}`)
}

export async function toggleHandled(id: string, value: boolean) {
  await ensureOk(await adminFetch(`/api/admin/messages/${id}/handled?value=${value}`, { method: 'PUT' }))
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
}

export async function deleteMessage(id: string) {
  await ensureOk(await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' }))
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
}

// Khách gửi form liên hệ (không cần đăng nhập)
export async function submitMessage(formData: FormData) {
  let ok = false
  try {
    const res = await publicPost('/api/public/messages', {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
    })
    ok = res.ok
  } catch {
    ok = false
  }
  redirect(ok ? '/?sent=1#contact' : '/?error=1#contact')
}