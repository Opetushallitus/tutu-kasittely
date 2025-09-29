ALTER TABLE perustelu
    ADD COLUMN IF NOT EXISTS muu_perustelu TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN perustelu.muu_perustelu IS 'Myy yleinen perustelu';