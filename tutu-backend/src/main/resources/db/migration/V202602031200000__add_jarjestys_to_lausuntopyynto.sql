ALTER TABLE lausuntopyynto ADD COLUMN IF NOT EXISTS jarjestys INTEGER;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY perustelu_id ORDER BY COALESCE(luotu, NOW())) AS rn
  FROM lausuntopyynto
)
UPDATE lausuntopyynto lp
SET jarjestys = n.rn
FROM numbered n
WHERE lp.id = n.id AND lp.jarjestys IS NULL;

ALTER TABLE lausuntopyynto ALTER COLUMN jarjestys SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_perustelu_id_jarjestys
    ON lausuntopyynto (perustelu_id, jarjestys);

COMMENT ON COLUMN lausuntopyynto.jarjestys IS 'Lausuntopyynnön järjestys per perustelu';
