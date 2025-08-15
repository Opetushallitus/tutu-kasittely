import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Chip, styled, TableCell, TableRow } from '@mui/material';
import Link from 'next/link';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as dateFns from 'date-fns';
import { useKasittelyvaiheTranslation } from '@/src/lib/localization/hooks/useKasittelyvaiheTranslation';
import { ophColors } from '@/src/lib/theme';

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
  const hakemusKoskee = `valinnat.hakemusKoskeeValinta.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus.hakemusKoskee),
    )?.label || ''
  }`;

  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemus.hakemusOid}/perustiedot`}>
          {hakemus.hakija}
        </Link>
      </StyledTableCell>
      <StyledTableCell>{hakemus.asiatunnus}</StyledTableCell>
      {nayta === 'kaikki' && (
        <StyledTableCell>
          {hakemus.esittelijaKutsumanimi} {hakemus.esittelijaSukunimi}
        </StyledTableCell>
      )}
      <StyledTableCell data-testid={'hakemus-row-kasittelyvaihe'}>
        {useKasittelyvaiheTranslation(hakemus)}
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
        {t('hakemuslista.kokonaisaikaKk', '', {
          aika: muotoileKokonaisaika(hakemus.aika),
        })}
      </StyledTableCell>
    </TableRow>
  );
}
