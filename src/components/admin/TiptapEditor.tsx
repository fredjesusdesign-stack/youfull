'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'

interface Props {
  initialContent?: Record<string, unknown> | null
  onChange: (json: Record<string, unknown>) => void
}

export default function TiptapEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
    ],
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Record<string, unknown>),
    editorProps: {
      attributes: {
        class: 'min-h-64 px-4 py-3 focus:outline-none prose prose-sm max-w-none prose-headings:text-text prose-p:text-text-muted',
      },
    },
  })

  if (!editor) return null

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-primary text-white' : 'text-text-muted hover:text-text hover:bg-surface'}`

  function addLink() {
    const url = prompt('URL do link:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  function addImage() {
    const url = prompt('URL da imagem:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading2 size={14} /></button>
        <div className="w-px bg-border mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={14} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={14} /></button>
        <div className="w-px bg-border mx-1" />
        <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))}><LinkIcon size={14} /></button>
        <button type="button" onClick={addImage} className={btnClass(false)}><ImageIcon size={14} /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
