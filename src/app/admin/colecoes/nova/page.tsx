import { createCollection } from '../actions'
import CollectionForm from '@/components/admin/CollectionForm'

export default function NovaColecaoPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-text mb-6">Nova coleção</h1>
      <CollectionForm action={createCollection} />
    </div>
  )
}
