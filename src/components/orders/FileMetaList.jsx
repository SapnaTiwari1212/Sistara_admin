import { FileText } from 'lucide-react'
import { formatFileSize } from '../../lib/utils'

const FileList = ({ files, title }) => {
  const list = Array.isArray(files) ? files.filter(Boolean) : []
  if (list.length === 0) return null
  return (
    <div>
      <p className="mb-2 font-display text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">
        {title}
      </p>
      <ul className="space-y-1.5">
        {list.map((file, i) => (
          <li
            key={`${file.name}-${i}`}
            className="flex items-center gap-2.5 rounded-2xl border border-lavender-200 bg-white/70 px-3 py-2 font-body text-xs font-semibold text-ink-soft"
          >
            <FileText className="h-4 w-4 shrink-0 text-grape-400" aria-hidden="true" />
            <span className="min-w-0 truncate">{file.name}</span>
            <span className="ml-auto shrink-0 text-[10px] font-bold uppercase text-ink-muted">
              {formatFileSize(file.size)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Requirements + references file metadata for the detail view. */
export const FileMetaList = ({ order }) => (
  <div className="space-y-4">
    <FileList files={order.requirements} title="Requirements" />
    <FileList files={order.references} title="References" />
  </div>
)