ALTER TABLE paatosteksti ADD COLUMN IF NOT EXISTS kieli kieli;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'paatosteksti_kieli_check'
    ) THEN
        ALTER TABLE paatosteksti
        ADD CONSTRAINT paatosteksti_kieli_check
        CHECK (kieli IN ('fi', 'sv'));
END IF;
END $$;