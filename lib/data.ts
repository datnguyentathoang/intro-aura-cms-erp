import { createClient } from '@/lib/supabase/server'
import type { Resource } from '@/lib/resources'

// Lấy danh sách lựa chọn cho các trường dạng "relation"
export async function loadRelations(res: Resource) {
  const supabase = await createClient()
  const out: Record<string, { id: string; label: string }[]> = {}
  for (const f of res.fields) {
    if (f.type === 'relation' && f.relation) {
      const { labelField, table } = f.relation
      const { data } = await supabase.from(table).select(`id, ${labelField}`)
      const rows = (data ?? []) as unknown as Record<string, string>[]
      out[f.name] = rows.map((r) => ({ id: r.id, label: r[labelField] }))
    }
  }
  return out
}