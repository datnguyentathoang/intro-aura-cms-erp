import type { AdminMenuItem } from "@/lib/admin-types";

export function parentOptions(items: AdminMenuItem[], exclude: Set<string> = new Set()) {
  const out: { id: string; label: string }[] = [];
  const walk = (parent: string | null, depth: number) => {
    if (depth > 1) return; // mục ở cấp 3 không được làm cha
    items
      .filter((m) => m.parent_id === parent)
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((m) => {
        if (exclude.has(m.id)) return;
        out.push({ id: m.id, label: `${"— ".repeat(depth)}${m.label}` });
        walk(m.id, depth + 1);
      });
  };
  walk(null, 0);
  return out;
}
