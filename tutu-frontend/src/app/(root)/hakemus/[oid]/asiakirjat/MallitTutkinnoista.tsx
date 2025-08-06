import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphInput,
  OphInputFormField,
  OphRadio,
  OphTypography,
} from '@opetushallitus/oph-design-system';

const BoldedLabel = ({ label }: { label: string }) => {
  return (
    <OphTypography variant={'label'} style={{ fontWeight: 'bold' }}>
      {label}
    </OphTypography>
  );
};

//         <Stack direction="row" justifyContent="space-between">

const TableHeader = () => {
  const { t } = useTranslations();
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ width: '20%' }}>
          <BoldedLabel
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.lahde')}
          />
        </TableCell>
        <TableCell style={{ width: '5%' }}>
          <BoldedLabel label={t('yleiset.kylla')} />
        </TableCell>
        <TableCell style={{ width: '5%' }}>
          <BoldedLabel label={t('yleiset.ei')} />
        </TableCell>
        <TableCell>
          <OphTypography variant={'label'}>
            {t('hakemus.asiakirjat.malleja_tutkinnoista.kuvaus')}
          </OphTypography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

//<Stack direction="row" justifyContent="space-between">

const RadioGroup = () => {
  return (
    <>
      <TableCell>
        <OphRadio value={'true'} label={''} name="true_false"></OphRadio>
      </TableCell>
      <TableCell>
        <OphRadio value={'false'} label={''} name="true_false"></OphRadio>
      </TableCell>
    </>
  );
};

const ContentRow = ({ label }: { label: string }) => {
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <RadioGroup />
      <TableCell>
        <OphInput></OphInput>
      </TableCell>
    </TableRow>
  );
};

export const AsiakirjaMallejaVastaavistaTutkinnoista = () => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.malleja_tutkinnoista.otsikko')}
      </OphTypography>
      <Table>
        <TableHeader />
        <TableBody>
          <ContentRow
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.ece')}
          />
          <ContentRow
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.uk-enic')}
          />
          <ContentRow
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.naric-portal')}
          />
          <ContentRow
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.nuffic')}
          />
          <ContentRow
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.aacrao')}
          />
          <TableRow>
            <TableCell>
              {t('hakemus.asiakirjat.malleja_tutkinnoista.muut')}
            </TableCell>
            <RadioGroup />
            <TableCell>
              <OphInputFormField
                label={t('hakemus.asiakirjat.malleja_tutkinnoista.muut_selite')}
              ></OphInputFormField>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  );
};
