interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export const Pagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center items-center gap-3 pt-6">
      <button className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="muted text-xs font-medium">
        Page {page} of {totalPages}
      </span>
      <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  )
}
