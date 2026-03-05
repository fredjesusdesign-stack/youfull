import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: playlist } = await supabase.from('playlists').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { video_id } = await req.json()

  // Get current max order
  const { data: items } = await supabase.from('playlist_items').select('order').eq('playlist_id', id).order('order', { ascending: false }).limit(1)
  const nextOrder = items && items.length > 0 ? items[0].order + 1 : 0

  const { data, error } = await supabase
    .from('playlist_items')
    .insert({ playlist_id: id, video_id, order: nextOrder })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { video_id } = await req.json()
  await supabase.from('playlist_items').delete().eq('playlist_id', id).eq('video_id', video_id)
  return NextResponse.json({ success: true })
}
