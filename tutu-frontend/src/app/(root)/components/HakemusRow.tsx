import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { styled, TableCell, TableRow } from '@mui/material';
import Link from 'next/link';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as dateFns from 'date-fns';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

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
  const hakemusKoskee = `hakemuslista.hakemusKoskeeValinta.${
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
      <StyledTableCell>{hakemus.vaihe}</StyledTableCell>
      <StyledTableCell>{t(hakemusKoskee)}</StyledTableCell>
      <StyledTableCell>
        {t('hakemuslista.kokonaisaika.arvo', '', {
          aika: muotoileKokonaisaika(hakemus.aika),
        })}
      </StyledTableCell>
    </TableRow>
  );
}
