import AlarmIcon from '@mui/icons-material/Alarm';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import * as R from 'remeda';

import { UusiBadge } from '@/src/components/Badges';
import { formatHelsinki } from '@/src/lib/dateUtils';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';
import {
  AsiakirjaMetadata,
  SisaltoPathNode,
  SisaltoValue,
  TarkistuksenTila,
} from '@/src/lib/types/hakemus';

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
    ? formatHelsinki(metadata.saapumisaika, 'dd.MM.yyyy HH:mm')
    : '-';
};

const tiedostoNimi = (metadata?: AsiakirjaMetadata) => {
  return metadata?.filename || '-';
};

const tarkistuksenTila = (t: TFunction, data: AsiakirjaTaulukkoData) => {
  const translationKey = `hakemus.asiakirjat.tarkistuksenTila.${data.liitteenTila?.state}`;
  return data.liitteenTila?.state ? t(translationKey) : '-';
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
        <TableCell sx={{ width: '70%' }}>
          {t('hakemus.asiakirjat.asiakirja')}
        </TableCell>
        <TableCell sx={{ paddingLeft: '8px', paddingRight: '10px' }}>
          {t('hakemus.asiakirjat.saapunut')}
        </TableCell>
        <TableCell sx={{ paddingLeft: '8px', paddingRight: '10px' }}>
          {t('hakemus.asiakirjat.tarkistuksenTila.otsikko')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const AsiakirjaTableRow = ({
  data,
  mask,
}: {
  data: AsiakirjaTaulukkoData;
  mask?: string;
}) => {
  const { t } = useTranslations();
  const uusiLiite = isUusiLiite(data);
  return (
    <TableRow
      className="asiakirja-row"
      id={`asiakirja__${data.key}`}
      sx={{ maskImage: mask }}
    >
      <TableCell sx={{ paddingLeft: '8px', paddingRight: '10px' }}>
        <Stack sx={{ width: '100%' }} spacing={1}>
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
      <TableCell sx={{ paddingLeft: '8px', paddingRight: '10px' }}>
        <Stack direction="row" spacing={1}>
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
      <TableCell sx={{ paddingLeft: '8px', paddingRight: '10px' }}>
        <Stack direction="row" spacing={1}>
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
  const { t } = useTranslations();

  const [naytaKaikki, setNaytaKaikki] = useState(false);

  const asiakirjatToShow = naytaKaikki ? asiakirjat : asiakirjat.slice(0, 2);
  const hiddenAsiakirjaCount = asiakirjat.length - asiakirjatToShow.length;

  return (
    <>
      <OphTypography variant={'h3'} data-testid="toimitetut-asiakirjat-otsikko">
        {t('hakemus.asiakirjat.toimitetutasiakirjat.otsikko')}
      </OphTypography>
      <Table style={{ tableLayout: 'auto', width: '100%' }}>
        <AsiakirjaTableHeader />
        <TableBody>
          {asiakirjatToShow.map((data, index) => {
            // Mask if this is the last item and there are hidden items
            const mask =
              hiddenAsiakirjaCount !== 0 &&
              index === asiakirjatToShow.length - 1
                ? 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))'
                : '';
            return <AsiakirjaTableRow key={data.key} data={data} mask={mask} />;
          })}
        </TableBody>
      </Table>
      {hiddenAsiakirjaCount > 0 ? (
        <OphButton
          startIcon={<ExpandMoreOutlinedIcon />}
          onClick={() => {
            setNaytaKaikki(true);
          }}
        >
          {t('hakemus.asiakirjat.toimitetutasiakirjat.naytaKaikkiAsiakirjat', {
            count: hiddenAsiakirjaCount,
          })}
        </OphButton>
      ) : (
        <OphButton
          startIcon={<ExpandLessOutlinedIcon />}
          onClick={() => {
            setNaytaKaikki(false);
          }}
        >
          {t(
            'hakemus.asiakirjat.toimitetutasiakirjat.naytaVahemmanAsiakirjoja',
            {
              count: hiddenAsiakirjaCount,
            },
          )}
        </OphButton>
      )}
    </>
  );
};
