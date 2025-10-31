ALTER TABLE paatos ADD COLUMN IF NOT EXISTS lahetyspaiva TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN paatos.lahetyspaiva IS 'Päätöksen lähetyspäivä';