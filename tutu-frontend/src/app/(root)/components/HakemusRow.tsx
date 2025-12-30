import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Chip, Stack, styled, TableCell, TableRow } from '@mui/material';
import Link from 'next/link';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as dateFns from 'date-fns';
import { useKasittelyvaiheTranslation } from '@/src/lib/localization/hooks/useKasittelyvaiheTranslation';
import { ophColors } from '@/src/lib/theme';
import { EditOutlined } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { doApiPatch } from '@/src/lib/tutu-backend/api';
import useToaster from '@/src/hooks/useToaster';
import { handleFetchError } from '@/src/lib/utils';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

const ApHakemusBadge = styled(Chip)(() => ({
  color: ophColors.blue3,
  backgroundColor: ophColors.lightBlue1,
  borderRadius: '2px',
}));

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
  const { addToast } = useToaster();

  const updateAsiatunnus = useCallback(async () => {
    if (asiatunnus && asiatunnus !== '' && asiatunnus !== hakemus.asiatunnus) {
      try {
        await doApiPatch(`hakemus/${hakemus.hakemusOid}/asiatunnus`, {
          asiatunnus,
        });
        setShowEditAsiatunnus(false);
      } catch (error) {
        handleFetchError(addToast, error, 'virhe.paivitaAsiatunnus', t);
      }
    }
  }, [asiatunnus, hakemus.asiatunnus, hakemus.hakemusOid, addToast, t]);

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
          {hakemus.hakija}
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
            <>
              <OphInputFormField
                value={asiatunnus ?? ''}
                onChange={(event) => {
                  setAsiatunnus(event.target.value);
                }}
              ></OphInputFormField>
              <OphButton
                variant={'contained'}
                onClick={updateAsiatunnus}
                disabled={!asiaTunnusValid}
              >
                {t('yleiset.tallenna')}
              </OphButton>
            </>
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
          {...(timeLimitExceeded && { sx: { color: ophColors.alias.error } })}
        >
          {kasittelyVaiheTranslation}
        </OphTypography>
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
              size="small"
            />
          </>
        )}
      </StyledTableCell>
      <StyledTableCell>
        {dateFns.formatDate(hakemus.aika, 'd.M.yyyy')}
      </StyledTableCell>
      <StyledTableCell>
        {t('hakemuslista.kokonaisaikaKk', '', {
          aika: muotoileKokonaisaika(hakemus.aika),
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
