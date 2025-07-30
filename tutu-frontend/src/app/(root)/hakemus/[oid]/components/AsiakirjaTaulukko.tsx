import {
  styled,
  useTheme,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/Error';
import AlarmIcon from '@mui/icons-material/Alarm';
import { ophColors } from '@/src/lib/theme';
import { SisaltoItem, SisaltoValue } from '@/src/lib/types/hakemus';
import { LiiteItem } from '@/src/lib/types/liiteItem';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';
import * as R from 'remeda';
import * as dateFns from 'date-fns';

const NoWrap = styled('div')(() => ({
  textWrap: 'nowrap',
}));

const GrayNoWrap = styled('div')(() => ({
  textWrap: 'nowrap',
  color: ophColors.grey600,
}));

const UusiBadge = styled(Chip)(() => ({
  color: ophColors.green1,
  backgroundColor: ophColors.green5,
  borderRadius: '2px',
}));

export const AsiakirjaTaulukko = ({ asiakirjat = [] }) => {
  return (
    <Table>
      <AsiakirjaTableHeader />
      <TableBody>
        {asiakirjat.map((data) => (
          <AsiakirjaTableRow key={data.key} data={data} />
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
        <TableCell>
          {t('hakemus.asiakirjat.tarkistuksen_tila.otsikko')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const AsiakirjaTableRow = ({ data }) => {
  const { t } = useTranslations();
  const theme = useTheme();
  return (
    <TableRow className="asiakirja-row" id={`asiakirja__${data.key}`}>
      <TableCell>
        <Stack>
          <NoWrap className="asiakirja-row__otsake">
            {lomakeOtsake(data.asiakirja)}
          </NoWrap>
          <GrayNoWrap className="asiakirja-row__tiedostonimi">
            {tiedostoNimi(data.metadata)}
          </GrayNoWrap>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={theme.spacing(1)}>
          <NoWrap className="asiakirja-row__saapumisaika">
            {saapumisAika(data.metadata)}
          </NoWrap>
          {uusiLiite(t, data)}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={theme.spacing(1)}>
          {tarkistuksenTilaIcon(data)}
          <NoWrap className="asiakirja-row__tarkistuksen-tila">
            {tarkistuksenTila(t, data)}
          </NoWrap>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

/* ----------------------------------------- */
/* Funktiot tietojen hakemiseen asiakirjasta */

const lomakeOtsake = (asiakirja: SisaltoValue) => {
  const lastItems = pathToRoot(asiakirja).slice(1, 3);
  return R.reverse(lastItems)
    .map(
      (item) =>
        item.label.fi.charAt(0).toUpperCase() +
        item.label.fi.slice(1).toLowerCase(),
    )
    .join(': ');
};

const saapumisAika = (metadata: LiiteItem) => {
  const timeStr = metadata?.uploaded;
  return timeStr ? dateFns.format(timeStr, 'dd.MM.yyyy HH:mm') : '-';
};

const tiedostoNimi = (metadata: LiiteItem) => {
  return metadata?.filename || '-';
};

const tarkistuksenTila = (t: TFunction, data) => {
  const translationKey = `hakemus.asiakirjat.tarkistuksen_tila.${data.liitteenTila?.state}`;
  const result = t(translationKey);

  return result !== translationKey ? result : '-';
};

const tarkistuksenTilaIcon = (data) => {
  switch (data.liitteenTila?.state) {
    case 'checked':
      return <CheckCircleOutlineIcon sx={{ color: ophColors.alias.success }} />;
    case 'attachment-missing':
      return <ErrorIcon sx={{ color: ophColors.alias.error }} />;
    case 'overdue':
      return <AlarmIcon sx={{ color: ophColors.yellow1 }} />;
    case 'incomplete-attachment':
      return <ErrorOutlineIcon sx={{ color: ophColors.alias.error }} />;
    case 'not-checked':
    default:
      return null;
  }
};

const uusiLiite = (t: TFunction, data) => {
  switch (data.liitteenTila?.state) {
    case 'not-checked':
      return (
        <UusiBadge
          className="asiakirja-row__uusi-liite"
          label={t('hakemus.asiakirjat.uusi')}
          size="small"
        />
      );
    default:
      return null;
  }
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

export const haeAsiakirjat = (sisalto: SisaltoItem[]): SisaltoValue[] => {
  const acc: SisaltoValue[] = [];

  const handleItem = (item: (SisaltoItem | SisaltoValue)[]) => {
    if (item.previous?.fieldType === 'attachment') {
      const newItem = {
        ...item,
        formId: item.previous.key,
      };
      acc.push(newItem);
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
