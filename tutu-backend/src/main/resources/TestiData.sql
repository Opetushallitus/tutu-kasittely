--Replace <OWN_USER_OID> with your own OID from /cas/me

-- Esittelija
insert into esittelija (esittelija_oid, luoja) values ('<OWN_USER_OID>', 'test');

-- Maakoodi
insert into maakoodi (koodi, nimi, esittelija_id, luoja) values ('752', 'Ruotsi', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 'test');

-- Hakemus
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354802', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354803', null, 1, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002353416', null, 2, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354703', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354736', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 1, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354835', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 2, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354867', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 3, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354702', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002355032', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, hakemus_koskee, luoja) values ('1.2.246.562.11.99999999999999999999', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 1, 'test');

insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354802'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354803'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002353416'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354703'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354736'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354835'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354867'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354702'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002355032'), '', '', 'testi');
insert into perustelu_yleiset (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.99999999999999999999'), '', '', 'testi');
