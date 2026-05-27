-- Adds a head_id column to families so admins can designate a Family Head.
-- head_id references profiles.id; SET NULL on delete so the family survives if the head's profile is removed.

ALTER TABLE families
  ADD COLUMN IF NOT EXISTS head_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS families_head_id_idx ON families(head_id);
