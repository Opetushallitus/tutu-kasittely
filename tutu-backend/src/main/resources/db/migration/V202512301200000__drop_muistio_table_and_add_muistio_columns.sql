ALTER TABlE tutkinto DROP CONSTRAINT fk_tutkinto_muistio;
DROP TABLE muistio;
DROP TYPE hakemuksen_osa;

ALTER TABLE hakemus ADD COLUMN esittelijan_huomioita TEXT;

ALTER TABLE asiakirja ADD COLUMN huomiot_muistioon TEXT;
ALTER TABLE asiakirja ADD COLUMN esittelijan_huomioita TEXT;

ALTER TABLE perustelu ADD COLUMN tarkempia_selvityksia TEXT;

ALTER TABLE tutkinto ADD COLUMN muu_tutkinto_muistio TEXT;
ALTER TABLE tutkinto DROP COLUMN muu_tutkinto_muistio_id;