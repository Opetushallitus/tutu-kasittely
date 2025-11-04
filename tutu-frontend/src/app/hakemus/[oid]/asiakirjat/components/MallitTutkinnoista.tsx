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
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import {
  AsiakirjamalliLahde,
  AsiakirjamallitTutkinnoista,
  AsiakirjamalliTutkinnosta,
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
} from '@/src/lib/types/hakemus';
import * as R from 'remeda';
import React, { useEffect } from 'react';
import { match, P } from 'ts-pattern';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

type LahdeOption = {
  id: AsiakirjamalliLahde;
  lKey: string;
};

const LahdeOptionsWoMuut: LahdeOption[] = [
  { id: 'ece', lKey: 'hakemus.asiakirjat.mallejaTutkinnoista.ece' },
  {
    id: 'UK_enic',
    lKey: 'hakemus.asiakirjat.mallejaTutkinnoista.ukEnic',
  },
  {
    id: 'naric_portal',
    lKey: 'hakemus.asiakirjat.mallejaTutkinnoista.naricPortal',
  },
  { id: 'nuffic', lKey: 'hakemus.asiakirjat.mallejaTutkinnoista.nuffic' },
  { id: 'aacrao', lKey: 'hakemus.asiakirjat.mallejaTutkinnoista.aacrao' },
];

const BoldedLabel = ({ label }: { label: string }) => {
  return (
    <OphTypography variant={'label'} style={{ fontWeight: 'bold' }}>
      {label}
    </OphTypography>
  );
};

const TableHeader = () => {
  const { t } = useTranslations();
  return (
    <TableHead>
      <TableRow>
        <TableCell style={{ width: '20%' }}>
          <BoldedLabel
            label={t('hakemus.asiakirjat.mallejaTutkinnoista.lahde')}
          />
        </TableCell>
        <TableCell colSpan={2} style={{ width: '25%' }}>
          <BoldedLabel
            label={t('hakemus.asiakirjat.mallejaTutkinnoista.vastaavuus')}
          />
        </TableCell>
        <TableCell>
          <OphTypography variant={'body1'}>
            {t('hakemus.asiakirjat.mallejaTutkinnoista.kuvaus')}
          </OphTypography>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const RadioGroup = ({
  vastaavuus,
  setVastaavuus,
  onClear,
  lahdeId,
}: {
  vastaavuus: boolean | undefined;
  setVastaavuus: (updatedVastaavuus: boolean) => void;
  onClear: () => void;
  lahdeId: string;
}) => {
  const { t } = useTranslations();

  return (
    <TableCell colSpan={2}>
      <OphRadioGroupWithClear
        labelId={`asiakirjamalli-vastaavuus-${lahdeId}-label`}
        data-testid={`asiakirjamalli-vastaavuus-${lahdeId}`}
        options={[
          { value: 'true', label: t('yleiset.kylla') },
          { value: 'false', label: t('yleiset.ei') },
        ]}
        row
        value={vastaavuus?.toString() ?? ''}
        onChange={(e) => setVastaavuus(e.target.value === 'true')}
        onClear={onClear}
        clearButtonPlacement="inline"
        inlineLabelMinWidth={60}
      />
    </TableCell>
  );
};

const KuvausInput = ({
  kuvaus,
  setKuvaus,
  kuvausLabel,
}: {
  kuvaus: string;
  setKuvaus: (updatedKuvaus: string) => void;
  kuvausLabel?: string;
}) => {
  const minRows = kuvausLabel ? 3 : 1;
  return (
    <TableCell>
      <OphInputFormField
        sx={{
          '& .MuiFormLabel-root': {
            fontWeight: 'normal',
          },
          width: '100%',
        }}
        label={kuvausLabel}
        multiline={true}
        minRows={minRows}
        value={kuvaus}
        onChange={(event) => setKuvaus(event.target.value)}
      />
    </TableCell>
  );
};

const ContentRow = ({
  id,
  label,
  value,
  handleChange,
  kuvausLabel,
}: {
  id: AsiakirjamalliLahde;
  label: string;
  value?: AsiakirjamalliTutkinnosta;
  handleChange: (changeRequest: AsiakirjamalliPyynto) => void;
  kuvausLabel?: string;
}) => {
  return (
    <TableRow data-testid={`asiakirjamallit-tutkinnoista-${id}`}>
      <TableCell>
        <OphTypography>{label}</OphTypography>
      </TableCell>
      <RadioGroup
        vastaavuus={value?.vastaavuus}
        setVastaavuus={(updatedVastaavuus: boolean) =>
          handleChange({
            lahde: id,
            vastaavuus: updatedVastaavuus,
          })
        }
        onClear={() => handleChange({ lahde: id, clear: true })}
        lahdeId={id}
      />
      <KuvausInput
        kuvaus={value?.kuvaus || ''}
        setKuvaus={(updatedKuvaus: string) =>
          handleChange({
            lahde: id,
            kuvaus: updatedKuvaus,
          })
        }
        kuvausLabel={kuvausLabel}
      />
    </TableRow>
  );
};

interface AsiakirjamalliPyynto {
  lahde: AsiakirjamalliLahde;
  vastaavuus?: boolean;
  kuvaus?: string;
  clear?: boolean;
}

export const AsiakirjaMallejaVastaavistaTutkinnoista = ({
  asiakirjaTieto,
  updateAsiakirjaTieto,
}: {
  asiakirjaTieto: AsiakirjaTieto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const [currentMallit, setCurrentMallit] = React.useState<
    AsiakirjamallitTutkinnoista | undefined
  >(asiakirjaTieto.asiakirjamallitTutkinnoista);

  useEffect(() => {
    if (asiakirjaTieto.asiakirjamallitTutkinnoista !== undefined) {
      setCurrentMallit(asiakirjaTieto.asiakirjamallitTutkinnoista);
    }
  }, [asiakirjaTieto.asiakirjamallitTutkinnoista]);

  const handleChange = (changeRequest: AsiakirjamalliPyynto) => {
    const changedLahde = changeRequest.lahde;
    if (changeRequest.clear) {
      return handleDelete(changedLahde);
    }
    handleModify(changeRequest);
  };

  const handleModify = (changeRequest: AsiakirjamalliPyynto) => {
    const changedLahde = changeRequest.lahde;
    const toBeVastaavuus = match([
      asiakirjaTieto.asiakirjamallitTutkinnoista?.[changedLahde]?.vastaavuus,
      changeRequest.vastaavuus,
      changeRequest.kuvaus,
    ])
      .with([P._, P.not(P.nullish), P._], ([, newVal]) => newVal)
      .with([P.not(P.nullish), P.nullish, P._], ([origVal]) => origVal)
      .with([P.nullish, P.nullish, P.not(P.nullish)], () => true)
      .with([P.nullish, P.nullish, P.nullish], () => undefined)
      .exhaustive();

    if (toBeVastaavuus !== undefined) {
      const updatedMalli = {
        ...asiakirjaTieto.asiakirjamallitTutkinnoista?.[changedLahde],
        lahde: changedLahde,
        vastaavuus: toBeVastaavuus,
        kuvaus:
          changeRequest.kuvaus !== undefined
            ? changeRequest.kuvaus
            : asiakirjaTieto.asiakirjamallitTutkinnoista?.[changedLahde]
                ?.kuvaus,
      };

      const updatedMallit: AsiakirjamallitTutkinnoista = {
        ...asiakirjaTieto.asiakirjamallitTutkinnoista,
        [changedLahde]: updatedMalli,
      };
      setCurrentMallit(updatedMallit);
      updateAsiakirjaTieto({
        asiakirjamallitTutkinnoista: updatedMallit,
      });
    }
  };

  const handleDelete = (deletedLahde: AsiakirjamalliLahde) => {
    const updatedMallit: AsiakirjamallitTutkinnoista = R.omit(
      asiakirjaTieto.asiakirjamallitTutkinnoista || {},
      [deletedLahde],
    );
    setCurrentMallit(updatedMallit);
    updateAsiakirjaTieto({
      asiakirjamallitTutkinnoista: updatedMallit,
    });
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography
        variant={'h3'}
        data-testid="asiakirjamalleja-vastaavista-tutkinnoista-otsikko"
      >
        {t('hakemus.asiakirjat.mallejaTutkinnoista.otsikko')}
      </OphTypography>
      <Table>
        <TableHeader />
        <TableBody>
          {R.map(LahdeOptionsWoMuut, (option) => (
            <ContentRow
              key={option.id}
              id={option.id}
              label={t(option.lKey)}
              value={currentMallit?.[option.id]}
              handleChange={handleChange}
            />
          ))}
          <ContentRow
            id={'muu'}
            label={t('hakemus.asiakirjat.mallejaTutkinnoista.muu')}
            value={currentMallit?.muu}
            handleChange={handleChange}
            kuvausLabel={t('hakemus.asiakirjat.mallejaTutkinnoista.muuSelite')}
          />
        </TableBody>
      </Table>
    </Stack>
  );
};
