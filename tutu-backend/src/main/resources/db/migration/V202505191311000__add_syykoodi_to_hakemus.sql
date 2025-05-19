ALTER TABLE hakemus ADD COLUMN syykoodi INTEGER NOT NULL default 9;
COMMENT ON COLUMN hakemus.syykoodi IS 'Hakemuksen syykoodi';