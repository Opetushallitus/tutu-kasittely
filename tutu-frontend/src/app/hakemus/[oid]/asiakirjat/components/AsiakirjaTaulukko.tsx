import {
  Chip,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ErrorIcon from '@mui/icons-material/Error';
import AlarmIcon from '@mui/icons-material/Alarm';
import { ophColors } from '@/src/lib/theme';
import {
  AsiakirjaMetadata,
  SisaltoPathNode,
  SisaltoValue,
  TarkistuksenTila,
} from '@/src/lib/types/hakemus';
import {
  TFunction,
  useTranslations,
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

export type AsiakirjaTaulukkoData = {
  key: string;
  saapumisaika: string;
  asiakirja: SisaltoValue;
  metadata?: AsiakirjaMetadata;
  liitteenTila?: TarkistuksenTila;
};

export const AsiakirjaTaulukko = ({
  asiakirjat,
}: {
  asiakirjat: AsiakirjaTaulukkoData[];
}) => {
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
          {t('hakemus.asiakirjat.tarkistuksenTila.otsikko')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const AsiakirjaTableRow = ({ data }: { data: AsiakirjaTaulukkoData }) => {
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
            {saapumisAika(data.saapumisaika)}
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
  const rootPath = pathToRoot(asiakirja);
  const itemsForOtsake = R.reverse([rootPath.at(1), rootPath.at(-1)]);
  return itemsForOtsake
    .map((item) => {
      const label = item?.label?.fi || '';
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    })
    .join(': ');
};

const saapumisAika = (saapumisAika: string) => {
  return dateFns.format(saapumisAika, 'dd.MM.yyyy HH:mm');
};

const tiedostoNimi = (metadata?: AsiakirjaMetadata) => {
  return metadata?.filename || '-';
};

const tarkistuksenTila = (t: TFunction, data: AsiakirjaTaulukkoData) => {
  const translationKey = `hakemus.asiakirjat.tarkistuksenTila.${data.liitteenTila?.state}`;
  const result = t(translationKey);

  return result !== translationKey ? result : '-';
};

const tarkistuksenTilaIcon = (data: AsiakirjaTaulukkoData) => {
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

const uusiLiite = (t: TFunction, data: AsiakirjaTaulukkoData) => {
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

const pathToRoot = (value: SisaltoValue): SisaltoPathNode[] => {
  const path = [];
  let current: SisaltoPathNode | undefined = value;

  while (current) {
    path.push(current);
    current = current.previous;
  }

  return path;
};
