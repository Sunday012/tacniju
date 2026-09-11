-- 051_allow_memo_content_records.sql
-- Allow Records to store rehearsal and administrative memos alongside lyrics, teachings, and prophecies.

ALTER TABLE public.content_record_categories
  DROP CONSTRAINT IF EXISTS content_record_categories_record_type_check;

ALTER TABLE public.content_record_categories
  ADD CONSTRAINT content_record_categories_record_type_check
  CHECK (record_type IN ('lyrics', 'teachings', 'prophecies', 'memos'));

ALTER TABLE public.content_records
  DROP CONSTRAINT IF EXISTS content_records_record_type_check;

ALTER TABLE public.content_records
  ADD CONSTRAINT content_records_record_type_check
  CHECK (record_type IN ('lyrics', 'teachings', 'prophecies', 'memos'));
