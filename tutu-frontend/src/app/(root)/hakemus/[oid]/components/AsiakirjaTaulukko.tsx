import {
  styled,
  useTheme,
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/Error';
import AlarmIcon from '@mui/icons-material/Alarm';
import { ophColors } from '@/src/lib/theme';
import { SisaltoItem, TarkistuksenTila } from '@/src/lib/types/hakemus';
import { LiiteItem } from '@/src/lib/types/liiteITem';
import { FullSpinner } from '@/src/components/FullSpinner';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/useTranslations';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import * as R from 'remeda';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import * as dateFns from 'date-fns';

const NoWrap = styled('div')(() => ({
  textWrap: 'nowrap',
}));

export const AsiakirjaTaulukko = ({
  sisalto = [],
  liitteidenTilat = [],
  osiot = [],
}: {
  sisalto: SisaltoItem[];
  liitteidenTilat: TarkistuksenTila[];
  osiot: string[];
}) => {
  /* ------------------------------------------- */
  /* TODO: refactor -- extract to page.tsx       */
  /*       - Check for changes / conflicts first */
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const rajattuSisalto = sisalto.filter((item) => osiot.includes(item.key));
  const asiakirjat = haeAsiakirjat(rajattuSisalto);

  const { isLoading, data, error } = useLiitteet(
    asiakirjat.map((asiakirja) => asiakirja.label.fi).join(','),
  );

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.liitteiden-lataus', t);
  }, [error, addToast, t]);

  if (error) {
    return null;
  }

  if (isLoading || !data) return <FullSpinner></FullSpinner>;

  const completeAsiakirjaData = asiakirjat.map((asiakirja) => {
    const metadata = data.find(
      (dataItem) => dataItem.key === asiakirja.label.fi,
    );
    const liitteenTila = liitteidenTilat.find(
      (state) => state.attachment === asiakirja.formId,
    );
    return { asiakirja, metadata, liitteenTila, key: asiakirja.label.fi };
  });
  /* ODOT */

  return (
    <Table>
      <AsiakirjaTableHeader />
      <TableBody>
        {completeAsiakirjaData.map((data) => (
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
    <TableRow>
      <TableCell>
        <Stack>
          <NoWrap>{lomakeOtsake(data.asiakirja)}</NoWrap>
          <NoWrap>{tiedostoNimi(data.metadata)}</NoWrap>
        </Stack>
      </TableCell>
      <TableCell>{saapumisAika(data.metadata)}</TableCell>
      <TableCell>
        <Stack direction="row" gap={theme.spacing(1)}>
          {tarkistuksenTilaIcon(data)}
          {tarkistuksenTila(t, data)}
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
    .map((item) => item.label.fi)
    .join(' > ');
};

const saapumisAika = (metadata: LiiteItem) => {
  const timeStr = metadata?.uploaded;
  return timeStr ? dateFns.format(timeStr, 'dd.MM.yyyy HH:mm') : '-';
};

const tiedostoNimi = (metadata: LiiteItem) => {
  return metadata?.filename || '-';
};

const tarkistuksenTila = (t: TFunction, data: LiiteItem) => {
  const translationKey = `hakemus.asiakirjat.tarkistuksen_tila.${data.liitteenTila?.state}`;
  const result = t(translationKey);

  return result !== translationKey ? result : '-';
};

const tarkistuksenTilaIcon = (data: LiiteItem) => {
  switch (data.liitteenTila?.state) {
    case 'checked':
      return <CheckCircleOutlineIcon sx={{ color: ophColors.alias.success }} />;
    case 'attachment-missing':
      return <ErrorIcon sx={{ color: ophColors.alias.error }} />;
    case 'late': // TODO: tarkista tilan arvo -- tulee Atarusta
      return <AlarmIcon sx={{ color: ophColors.yellow1 }} />;
    case 'incomplete': // TODO: tarkista tilan arvo -- tulee Atarusta
      return <ErrorOutlineIcon sx={{ color: ophColors.alias.error }} />;
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

const haeAsiakirjat = (sisalto: SisaltoItem[]): SisaltoValue[] => {
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
