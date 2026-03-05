'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { reorderCollections, deleteCollection } from '@/app/admin/colecoes/actions'
import Link from 'next/link'

interface Collection {
  id: string
  title: string
  is_premium: boolean
}

function SortableItem({ collection }: { collection: Collection }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: collection.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 bg-background border border-border rounded-xl mb-2 ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <button {...attributes} {...listeners} type="button" className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text">
        <GripVertical size={16} />
      </button>
      <span className="flex-1 text-sm font-medium text-text">{collection.title}</span>
      {collection.is_premium && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Premium</span>
      )}
      <Link href={`/admin/colecoes/${collection.id}`} className="p-1.5 text-text-muted hover:text-text transition-colors">
        <Pencil size={14} />
      </Link>
      <form action={deleteCollection}>
        <input type="hidden" name="id" value={collection.id} />
        <button type="submit" className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  )
}

export default function CollectionOrderer({ collections: initial }: { collections: Collection[] }) {
  const [collections, setCollections] = useState(initial)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: { active: { id: string | number }; over: { id: string | number } | null }) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = collections.findIndex(c => c.id === active.id)
    const newIndex = collections.findIndex(c => c.id === over.id)
    const reordered = arrayMove(collections, oldIndex, newIndex)
    setCollections(reordered)
    await reorderCollections(reordered.map(c => c.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={collections.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {collections.map(c => <SortableItem key={c.id} collection={c} />)}
      </SortableContext>
    </DndContext>
  )
}
