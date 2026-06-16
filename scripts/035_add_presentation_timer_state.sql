ALTER TABLE public.presentation_state
ADD COLUMN IF NOT EXISTS timer_state JSONB NOT NULL DEFAULT '{
  "active": false,
  "mode": "timer",
  "fullscreen": false,
  "durationSeconds": 0,
  "startedAt": null,
  "pausedSeconds": 0,
  "corner": "top-right"
}'::jsonb;

UPDATE public.presentation_state
SET timer_state = '{
  "active": false,
  "mode": "timer",
  "fullscreen": false,
  "durationSeconds": 0,
  "startedAt": null,
  "pausedSeconds": 0,
  "corner": "top-right"
}'::jsonb
WHERE id = 1
  AND timer_state IS NULL;
