
CREATE TABLE public.baits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.baits TO anon, authenticated;
GRANT ALL ON public.baits TO service_role;

ALTER TABLE public.baits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Baits are viewable by everyone"
  ON public.baits FOR SELECT
  USING (true);
