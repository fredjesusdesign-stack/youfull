create or replace function search_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (content_type text, content_id uuid, similarity float)
language sql stable as $$
  select content_type, content_id,
    1 - (embedding <=> query_embedding) as similarity
  from public.content_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
