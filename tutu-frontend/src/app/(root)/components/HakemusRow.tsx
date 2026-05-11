import { EditOutlined } from '@mui/icons-material';
import { Stack, TableRow } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ApHakemusBadge, PeruutettuBadge } from '@/src/components/Badges';
import { StyledTableCell } from '@/src/components/StyledTableCell';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import useToaster from '@/src/hooks/useToaster';
import { formatHelsinki } from '@/src/lib/dateUtils';
import { useKasittelyvaiheTranslation } from '@/src/lib/localization/hooks/useKasittelyvaiheTranslation';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import { doApiPatch } from '@/src/lib/tutu-backend/api';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { handleFetchError } from '@/src/lib/utils';

export const muotoileKokonaisaikaPure = (nyt: Date, luotu: Date) => {
  const kuukausiYlitetty = luotu.getDate() > nyt.getDate();

  const jaksonAlku = new Date(
    dateFns.subMonths(nyt, kuukausiYlitetty ? 1 : 0).setDate(luotu.getDate()),
  );
  const paiviaKuluvassaJaksossa = dateFns.getDaysInMonth(jaksonAlku);

  const erotusKk = dateFns.differenceInMonths(nyt, luotu);
  const erotusPv = dateFns.differenceInCalendarDays(nyt, jaksonAlku);

  const aikaDesimaalina = erotusKk + ((erotusPv / paiviaKuluvassaJaksossa) % 1);

  return aikaDesimaalina.toFixed(1);
};

export const muotoileKokonaisaika = (luotuStr: string) => {
  const luotu = new Date(luotuStr);
  const nyt = new Date();
  return muotoileKokonaisaikaPure(nyt, luotu);
};

export default function HakemusRow({
  hakemus,
  nayta,
}: {
  hakemus: HakemusListItem;
  nayta: string;
}) {
  const { t } = useTranslations();
  const [showEditAsiatunnus, setShowEditAsiatunnus] = useState(false);
  const [asiatunnus, setAsiatunnus] = useState(hakemus.asiatunnus);
  const [savedAsiatunnus, setSavedAsiatunnus] = useState(hakemus.asiatunnus);
  const { addToast } = useToaster();

  const editRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!showEditAsiatunnus) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setShowEditAsiatunnus(false);
        setAsiatunnus(savedAsiatunnus);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEditAsiatunnus, savedAsiatunnus]);

  const updateAsiatunnus = useCallback(async () => {
    if (asiatunnus && asiatunnus !== '' && asiatunnus !== savedAsiatunnus) {
      try {
        await doApiPatch(`hakemus/${hakemus.hakemusOid}/asiatunnus`, {
          asiatunnus,
        });
        setSavedAsiatunnus(asiatunnus);
        setShowEditAsiatunnus(false);
      } catch (error) {
        handleFetchError(addToast, error, 'virhe.paivitaAsiatunnus', t);
      }
    } else {
      setShowEditAsiatunnus(false);
    }
  }, [asiatunnus, savedAsiatunnus, hakemus.hakemusOid, addToast, t]);

  const asiaTunnusValid = useMemo(() => {
    return (
      asiatunnus && asiatunnus.match(new RegExp(/OPH-\d+-\d{4}$/)) !== null
    );
  }, [asiatunnus]);

  const hakemusKoskee = `valinnat.hakemusKoskeeValinta.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus.hakemusKoskee),
    )?.label || ''
  }`;
  const { translation: kasittelyVaiheTranslation, timeLimitExceeded } =
    useKasittelyvaiheTranslation(hakemus);

  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemus.hakemusOid}/perustiedot`}>
          {hakemus.hakija.etunimet} {hakemus.hakija.sukunimi}
        </Link>
      </StyledTableCell>
      <StyledTableCell>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          data-testid="asiatunnus"
        >
          {showEditAsiatunnus ? (
            <form
              ref={editRef}
              style={{ display: 'contents' }}
              onSubmit={(e) => {
                e.preventDefault();
                if (asiaTunnusValid) {
                  updateAsiatunnus();
                }
              }}
            >
              <OphInputFormField
                value={asiatunnus ?? ''}
                onChange={(event) => {
                  setAsiatunnus(event.target.value);
                }}
              ></OphInputFormField>
              <OphButton
                type="submit"
                variant={'contained'}
                disabled={!asiaTunnusValid}
              >
                {t('yleiset.tallenna')}
              </OphButton>
            </form>
          ) : (
            <>
              <OphTypography>{asiatunnus}</OphTypography>
              <EditOutlined
                sx={{ color: 'primary.main' }}
                onClick={() => setShowEditAsiatunnus(true)}
              ></EditOutlined>
            </>
          )}
        </Stack>
      </StyledTableCell>
      {nayta === 'kaikki' && (
        <StyledTableCell>
          {hakemus.esittelijaKutsumanimi} {hakemus.esittelijaSukunimi}
        </StyledTableCell>
      )}
      <StyledTableCell data-testid={'hakemus-row-kasittelyvaihe'}>
        <OphTypography
          variant="body1"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            ...(timeLimitExceeded && { color: ophColors.alias.error }),
          }}
        >
          {kasittelyVaiheTranslation}
        </OphTypography>
        {hakemus.onkoPeruutettu && (
          <PeruutettuBadge
            data-testid="peruutettu-badge"
            label={t('hakemus.ataruhakemuksentila.peruutettu')}
          />
        )}
      </StyledTableCell>
      <StyledTableCell>
        {t(hakemusKoskee)}{' '}
        {hakemus.apHakemus && (
          <>
            <br />
            <ApHakemusBadge
              data-testid="ap-hakemus-badge"
              className="hakemusrow-aphakemus-badge"
              label={t('hakemus.apHakemus')}
            />
          </>
        )}
      </StyledTableCell>
      <StyledTableCell>
        {formatHelsinki(hakemus.saapumisPvm, 'd.M.yyyy')}
      </StyledTableCell>
      <StyledTableCell>
        {t('hakemuslista.kokonaisaikaKk', '', {
          aika: muotoileKokonaisaika(hakemus.saapumisPvm),
        })}
      </StyledTableCell>
      <StyledTableCell>
        {hakemus.viimeinenAsiakirjaHakijalta
          ? t('hakemuslista.kokonaisaikaKk', '', {
              aika: muotoileKokonaisaika(hakemus.viimeinenAsiakirjaHakijalta),
            })
          : ''}
      </StyledTableCell>
    </TableRow>
  );
}
