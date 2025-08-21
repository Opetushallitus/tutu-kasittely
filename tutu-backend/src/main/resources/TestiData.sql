--Replace <OWN_USER_OID> with your own OID from /cas/me

-- Esittelija
insert into esittelija (esittelija_oid, luoja, maakoodi) values ('<OWN_USER_OID>', 'test', 752);

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