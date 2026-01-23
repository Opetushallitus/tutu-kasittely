import {
  Stack,
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
import { OphTypography } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import { UusiBadge } from '@/src/components/Badges';

export type AsiakirjaTaulukkoData = {
  key: string;
  asiakirja: SisaltoValue;
  metadata?: AsiakirjaMetadata;
  liitteenTila?: TarkistuksenTila;
};

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

const saapumisAika = (metadata?: AsiakirjaMetadata) => {
  return metadata?.saapumisaika
    ? dateFns.format(metadata.saapumisaika, 'dd.MM.yyyy HH:mm')
    : '-';
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

const isUusiLiite = (data: AsiakirjaTaulukkoData) => {
  if (data.liitteenTila) {
    if (data.liitteenTila.state === 'not-checked') {
      return true;
    }
  }

  return false;
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

const AsiakirjaTableHeader = () => {
  const { t } = useTranslations();

  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: '75%' }}>
          {t('hakemus.asiakirjat.asiakirja')}
        </TableCell>
        <TableCell sx={{ width: '20%' }}>
          {t('hakemus.asiakirjat.saapunut')}
        </TableCell>
        <TableCell sx={{ width: '15%' }}>
          {t('hakemus.asiakirjat.tarkistuksenTila.otsikko')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const AsiakirjaTableRow = ({ data }: { data: AsiakirjaTaulukkoData }) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const uusiLiite = isUusiLiite(data);
  return (
    <TableRow className="asiakirja-row" id={`asiakirja__${data.key}`}>
      <TableCell>
        <Stack sx={{ width: '100%' }} gap={theme.spacing(1)}>
          <OphTypography className="asiakirja-row__otsake">
            {lomakeOtsake(data.asiakirja)}
          </OphTypography>
          <OphTypography
            className="asiakirja-row__tiedostonimi"
            sx={{
              color: ophColors.grey600,
            }}
          >
            {tiedostoNimi(data.metadata)}
          </OphTypography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={theme.spacing(1)}>
          <OphTypography className="asiakirja-row__saapumisaika">
            {saapumisAika(data.metadata)}
          </OphTypography>
          {uusiLiite && (
            <UusiBadge
              className="asiakirja-row__uusi-liite"
              label={t('hakemus.asiakirjat.uusi')}
            />
          )}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={theme.spacing(1)}>
          {tarkistuksenTilaIcon(data)}
          <OphTypography className="asiakirja-row__tarkistuksen-tila">
            {tarkistuksenTila(t, data)}
          </OphTypography>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export const AsiakirjaTaulukko = ({
  asiakirjat,
}: {
  asiakirjat: AsiakirjaTaulukkoData[];
}) => {
  return (
    <Table style={{ tableLayout: 'fixed', width: '100%' }}>
      <AsiakirjaTableHeader />
      <TableBody>
        {asiakirjat.map((data) => (
          <AsiakirjaTableRow key={data.key} data={data} />
        ))}
      </TableBody>
    </Table>
  );
};
