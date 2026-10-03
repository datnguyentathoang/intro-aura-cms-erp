export type Row = Record<string, unknown>

export type Feature = {
  id: string
  title: string
  description: string | null
  image_url: string | null
}
export type Step = { id: string; step_order: number; title: string; description: string | null }
export type Workflow = Feature & { workflow_steps: Step[] }
export type Screenshot = { id: string; caption: string | null; image_url: string }
export type Faq = { id: string; question: string; answer: string }
export type Hero = {
  title: string; subtitle: string | null; image_url: string | null
  cta_text: string | null; cta_link: string | null
}
export type Contact = {
  email: string | null; phone: string | null; address: string | null
  facebook: string | null; zalo: string | null
}