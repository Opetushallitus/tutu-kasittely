import {
  styled,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import { SisaltoItem } from '@/src/lib/types/hakemus';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as R from 'remeda';

const NoWrap = styled('div')(() => ({
  textWrap: 'nowrap',
}));

export const AsiakirjaTaulukko = ({
  sisalto = [],
  osiot = [],
}: {
  sisalto: SisaltoItem[];
  osiot: string[];
}) => {
  const rajattuSisalto = sisalto.filter((item) => osiot.includes(item.key));
  const asiakirjat = haeAsiakirjat(rajattuSisalto);

  return (
    <Table>
      <AsiakirjaTableHeader />
      <TableBody>
        {asiakirjat.map((asiakirja) => (
          <AsiakirjaTableRow key={asiakirja.label.fi} asiakirja={asiakirja} />
        ))}
      </TableBody>
    </Table>
  );
};

const AsiakirjaTableHeader = () => {
  const { t } = useTranslations();

  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ width: '50%' }}>
          {t('hakemus.asiakirjat.asiakirja')}
        </TableCell>
        <TableCell>{t('hakemus.asiakirjat.saapunut')}</TableCell>
        <TableCell>{t('hakemus.asiakirjat.tarkistuksentila')}</TableCell>
      </TableRow>
    </TableHead>
  );
};

const AsiakirjaTableRow = ({ asiakirja }) => {
  return (
    <TableRow>
      <TableCell>
        <Stack>
          <NoWrap>{lomakeOtsake(asiakirja)}</NoWrap>
          <NoWrap>{tiedostoNimi(asiakirja)}</NoWrap>
        </Stack>
      </TableCell>
      <TableCell>{saapumisAika(asiakirja)}</TableCell>
      <TableCell>{tarkistuksenTila(asiakirja)}</TableCell>
    </TableRow>
  );
};

/* ----------------------------------------- */
/* Funktiot tietojen hakemiseen asiakirjasta */

const lomakeOtsake = (value: SisaltoValue) => {
  const lastItems = pathToRoot(value).slice(1, 3);
  return R.reverse(lastItems)
    .map((item) => item.label.fi)
    .join(' > ');
};

const tiedostoNimi = (/*value: SisaltoValue*/) => {
  return 'liite.txt';
};

const saapumisAika = (/*value: SisaltoValue*/) => {
  return '1.1.2025 11:10';
};

const tarkistuksenTila = (/*value: SisaltoValue*/) => {
  return 'Tarkistamatta';
};

const pathToRoot = (value: SisaltoValue): (SisaltoItem | SisaltoValue)[] => {
  const path = [];
  let current = value;

  while (current) {
    path.push(current);
    current = current.previous;
  }

  return path;
};

/* ------------------------------------------------------------ */
/* Korkean tason funktio asiakirjojen etsimiseen puurakenteesta */

const haeAsiakirjat = (sisalto: SisaltoItem[]): SisaltoValue[] => {
  const acc: SisaltoValue[] = [];

  const handleItem = (item: (SisaltoItem | SisaltoValue)[]) => {
    if (item.previous?.fieldType === 'attachment') {
      acc.push(item);
    }
  };

  traverseSisaltoTree(sisalto, handleItem);

  return acc;
};

/* ------------------------------------------------- */
/* Sisalto-rakenteelle määritetyt puun kulkufunktiot */

const traverseSisaltoTree = (
  openList: (SisaltoItem | SisaltoValue)[],
  handleItem: (item: SisaltoItem | SisaltoValue) => void,
) => {
  traverseTree(expand, combine, handleItem, openList);
};

const expand = (
  item: SisaltoItem | SisaltoValue,
): (SisaltoItem | SisaltoValue)[] => {
  const { children = [], followups = [] } = item;
  const value = getValueList(item);

  const expanded = [...followups, ...value, ...children].map((childItem) => ({
    ...childItem,
    previous: item,
  }));

  return expanded;
};

const combine = (
  items: (SisaltoItem | SisaltoValue)[],
  newItems: (SisaltoItem | SisaltoValue)[],
): (SisaltoItem | SisaltoValue)[] => {
  return [...newItems, ...items];
};

const getValueList = (item: SisaltoItem | SisaltoValue): SisaltoValue[] => {
  const value = item.value;
  return Array.isArray(value) ? value : [];
};

/* ------------------------------ */
/* Geneerinen puun kulkumenetelmä */

/* eslint-disable @typescript-eslint/no-explicit-any */

const traverseTree = (
  expand: (item: any) => any[],
  combine: (openList: any[], newList: any[]) => any[],
  handleItem: (item: any) => void,
  openList: any[],
) => {
  const [currentItem, ...restList] = openList;

  // Open list exhausted, end traversal
  if (!currentItem) {
    return;
  }

  handleItem(currentItem);

  const newList = expand(currentItem);
  const combinedList = combine(restList, newList);

  traverseTree(expand, combine, handleItem, combinedList);
};

/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------ */
