--Replace <OWN_USER_OID> with your own OID from /cas/me

-- Esittelija
insert into esittelija (esittelija_oid, luoja) values ('<OWN_USER_OID>', 'test');

-- Maakoodi
insert into maakoodi (koodi, nimi, esittelija_id, luoja) values ('maatjavaltiot2_752', 'Ruotsi', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), 'test');

-- Asiakirja
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');
insert into asiakirja (luoja) values ('testi');

-- Hakemus
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354802', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 0), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354803', null, (select id from asiakirja limit 1 offset 1), 1, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002353416', null, (select id from asiakirja limit 1 offset 2), 2, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354703', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 3), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354736', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 4), 1, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354835', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 5), 2, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354867', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 6), 3, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002354702', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 7), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.00000000000002355032', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 8), 0, 'test');
insert into hakemus (hakemus_oid, esittelija_id, asiakirja_id, hakemus_koskee, luoja) values ('1.2.246.562.11.99999999999999999999', (select id from esittelija where esittelija_oid = '<OWN_USER_OID>'), (select id from asiakirja limit 1 offset 9), 1, 'test');

insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354802'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354803'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002353416'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354703'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354736'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354835'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354867'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002354702'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.00000000000002355032'), '', '', 'testi');
insert into perustelu (hakemus_id, selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa, selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta, luoja)
    values ((select id from hakemus where hakemus_oid = '1.2.246.562.11.99999999999999999999'), '', '', 'testi');
