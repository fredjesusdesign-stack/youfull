'use client'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<void>
  id: string
  confirmMessage?: string
}

export default function DeleteButton({ action, id, confirmMessage = 'Are you sure?' }: DeleteButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault()
        }}
      >
        <Trash2 size={14} />
      </button>
    </form>
  )
}
