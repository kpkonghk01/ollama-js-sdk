CREATE TABLE IF NOT EXISTS public.vector_embedding (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  collection VARCHAR,
  external_id VARCHAR,
  document TEXT,
  metadata JSONB DEFAULT '{}',
  embeddings VECTOR(5120)
);

CREATE INDEX collection_external_id
  ON public.vector_embedding (collection, external_id);
