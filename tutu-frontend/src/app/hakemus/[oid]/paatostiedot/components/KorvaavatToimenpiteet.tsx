import { Theme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { match, P } from 'ts-pattern';

import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { KorvaavaToimenpideDto, Paatos } from '@/src/lib/types/paatos';

const toimenpiteetSuoritettuOptions = (t: TFunction) => [
  {
    value: 'true',
    label: t('hakemus.paatos.korvaavatToimenpiteet.suoritettu'),
  },
  { value: 'false', label: t('yleiset.ei') },
];

const lopullinenPaatosOptions = (t: TFunction) => [
  {
    value: 'true',
    label: t('hakemus.paatos.korvaavatToimenpiteet.kielteinen'),
  },
  {
    value: 'false',
    label: t('hakemus.paatos.korvaavatToimenpiteet.peruutettu'),
  },
];

export const KorvaavatToimenpiteet = ({
  t,
  theme,
  paatos,
  updatePaatos,
}: {
  t: TFunction;
  theme: Theme;
  paatos?: Paatos;
  updatePaatos: (toimenpideDto: KorvaavaToimenpideDto) => void;
}) => {
  const [suoritettu, setSuoritettu] = React.useState('');
  const [kielteinenPaatos, setKielteinenPaatos] = React.useState('');

  // Tämän kautta voidaan asettaa "suoritettu = ei" radiobutton erikseen valituksi.
  // Ko. painikkeen tilaa ei voi päätellä jos päätöstieto on tyhjä.
  const [naytaEiSuoritettuErikseen, setNaytaEiSuoritettuErikseen] =
    React.useState(false);

  useEffect(() => {
    const ratkaisutyyppi = paatos?.ratkaisutyyppi || null;
    const paatostieto = paatos?.paatosTiedot?.[0];
    const myonteinenPaatos = paatostieto?.myonteinenPaatos ?? null;
    match([ratkaisutyyppi, myonteinenPaatos, naytaEiSuoritettuErikseen])
      .with(['Paatos', true, P._], () => {
        setSuoritettu(true.toString());
        setKielteinenPaatos('');
      })
      .with(['Paatos', false, P._], () => {
        setSuoritettu(false.toString());
        setKielteinenPaatos(true.toString());
      })
      .with(['PeruutusTaiRaukeaminen', P._, P._], () => {
        setSuoritettu(false.toString());
        setKielteinenPaatos(false.toString());
      })
      .with([P.nullish, P._, true], () => {
        setSuoritettu(false.toString());
        setKielteinenPaatos('');
      })
      .otherwise(() => {
        setSuoritettu('');
        setKielteinenPaatos('');
      });
  }, [naytaEiSuoritettuErikseen, paatos]);

  return (
    <Stack direction="column" gap={theme.spacing(3)}>
      <OphTypography variant={'h2'} data-testid="korvaavatToimenpiteet-otsikko">
        {t('hakemus.paatos.korvaavatToimenpiteet.otsikko')}
      </OphTypography>
      <Stack>
        <OphRadioGroupWithClear
          labelId={'paatos-korvaavatToimenpiteet-suoritettu-radio-group-label'}
          label={t('hakemus.paatos.korvaavatToimenpiteet.suoritettuOtsikko')}
          data-testid={'paatos-korvaavatToimenpiteet-suoritettu-radio-group'}
          options={toimenpiteetSuoritettuOptions(t)}
          row={true}
          value={suoritettu || ''}
          onChange={(e) => {
            if (e.target.value === 'true') {
              updatePaatos({ suoritusTila: 'myonteinen' });
            } else {
              // Valinnan seurauksena kaikkien kenttien tulee olla näkyvissä,
              // ainoastaan "suoritettu = ei" valittuna.
              // Tätä ei pysty päättelemään päätöksen tiedoista -> asetetaan erikseen
              setNaytaEiSuoritettuErikseen(true);
              updatePaatos({ suoritusTila: 'nollattu' });
            }
          }}
          onClear={() => {
            setNaytaEiSuoritettuErikseen(false);
            updatePaatos({ suoritusTila: 'nollattu' });
          }}
        />
      </Stack>
      {suoritettu === 'false' && (
        <>
          <Stack>
            <OphRadioGroupWithClear
              labelId={
                'paatos-korvaavatToimenpiteet-lopullinenPaatos-radio-group-label'
              }
              label={t(
                'hakemus.paatos.korvaavatToimenpiteet.lopullinenPaatosOtsikko',
              )}
              data-testid={
                'paatos-korvaavatToimenpiteet-lopullinenPaatos-radio-group'
              }
              options={lopullinenPaatosOptions(t)}
              row={true}
              value={kielteinenPaatos || ''}
              onChange={(e) => {
                if (e.target.value === 'true') {
                  updatePaatos({ suoritusTila: 'kielteinen' });
                } else {
                  updatePaatos({ suoritusTila: 'peruttu' });
                }
              }}
              onClear={() => {
                // Clearin seurauksena kaikkien kenttien tulee olla edelleen näkyvissä,
                // ainoastaan "suoritettu = ei" valittuna.
                // Tätä ei pysty päättelemään päätöksen tiedoista -> asetetaan erikseen
                setNaytaEiSuoritettuErikseen(true);
                updatePaatos({ suoritusTila: 'nollattu' });
              }}
            />
          </Stack>
          <OphInputFormField
            label={t(`hakemus.paatos.korvaavatToimenpiteet.esittelijanHuomiot`)}
            multiline={true}
            minRows={4}
            value={
              paatos?.paatosTiedot?.[0]
                ? paatos.paatosTiedot[0].esittelijanHuomioitaToimenpiteista ||
                  ''
                : ''
            }
            onChange={(e) =>
              updatePaatos({ esittelijanHuomioita: e.target.value })
            }
            data-testid={`korvaavatToimenpiteet-esittelijanHuomiot-input`}
          />
        </>
      )}
    </Stack>
  );
};
