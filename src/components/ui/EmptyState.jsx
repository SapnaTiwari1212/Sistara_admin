import { Sparkles } from 'lucide-react'

/** Friendly empty / error state for tables and panels. */
export const EmptyState = ({ icon: Icon = Sparkles, title, description, action }) => (
  <div className="grid place-items-center rounded-4xl border-2 border-dashed border-lavender-200 bg-white/60 px-6 py-16 text-center">
    <div className="flex max-w-sm flex-col items-center gap-3">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-lavender-100 text-grape-500">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
      {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action}
    </div>
  </div>
)