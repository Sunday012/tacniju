-- 048_category_group_flags.sql

ALTER TABLE public.dream_categories
ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.content_record_categories
ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false;

UPDATE public.dream_categories parent
SET is_group = true
WHERE parent.parent_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.dream_categories child
    WHERE child.parent_id = parent.id
  );

UPDATE public.content_record_categories parent
SET is_group = true
WHERE parent.parent_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.content_record_categories child
    WHERE child.parent_id = parent.id
  );

CREATE INDEX IF NOT EXISTS dream_categories_is_group_idx
ON public.dream_categories(is_group);

CREATE INDEX IF NOT EXISTS content_record_categories_is_group_idx
ON public.content_record_categories(record_type, is_group);
