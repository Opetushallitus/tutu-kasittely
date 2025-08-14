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
  OphRadio,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import {
  AsiakirjamalliLahde,
  AsiakirjamalliTutkinnosta,
  Hakemus,
} from '@/src/lib/types/hakemus';
import * as R from 'remeda';
import { DebounceSetValue, useDebounced } from '@/src/hooks/useDebounced';
import { useObservable } from 'react-rx';
import { Observable } from 'rxjs';
import { useEffect } from 'react';
import { match, P } from 'ts-pattern';

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
        <TableCell style={{ width: '5%' }}>
          <BoldedLabel label={t('yleiset.kylla')} />
        </TableCell>
        <TableCell style={{ width: '7%' }}>
          <BoldedLabel label={t('yleiset.ei')} />
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

const StatelessRadioGroup = ({
  vastaavuusObservable,
  setVastaavuus,
}: {
  vastaavuusObservable: Observable<boolean>;
  setVastaavuus: DebounceSetValue<boolean>;
}) => {
  const vastaavuus = useObservable(vastaavuusObservable, undefined);

  return (
    <>
      <TableCell>
        <OphRadio
          value={'true'}
          checked={vastaavuus === true}
          label={''}
          name="vastaavuus_true_false"
          onChange={() => setVastaavuus(true, { debounce: true })}
        ></OphRadio>
      </TableCell>
      <TableCell>
        <OphRadio
          value={'false'}
          checked={vastaavuus === false}
          label={''}
          name="vastaavuus_true_false"
          onChange={() => setVastaavuus(false, { debounce: true })}
        ></OphRadio>
      </TableCell>
    </>
  );
};

const StatelessKuvausInput = ({
  kuvausObservable,
  setKuvaus,
  kuvausLabel,
}: {
  kuvausObservable: Observable<string>;
  setKuvaus: DebounceSetValue<string>;
  kuvausLabel?: string;
}) => {
  const kuvaus = useObservable(kuvausObservable, '');

  const [minRows, multiline] = kuvausLabel ? [3, true] : [1, false];
  return (
    <TableCell>
      <OphInputFormField
        sx={{
          '& .MuiFormLabel-root': {
            fontWeight: 'normal',
          },
        }}
        label={kuvausLabel}
        multiline={multiline}
        minRows={minRows}
        value={kuvaus}
        onChange={(event) => setKuvaus(event.target.value, { debounce: true })}
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
  handleChange: (changeRequest: AsiakirjamalliChangeRequest) => void;
  kuvausLabel?: string;
}) => {
  const [kuvausObservable, setKuvaus] = useDebounced((val: string) => {
    handleChange({ lahde: id, kuvaus: val });
  });

  const [vastaavuusObservable, setVastaavuus] = useDebounced((val: boolean) => {
    handleChange({ lahde: id, vastaavuus: val });
  });

  useEffect(() => {
    if (value?.kuvaus) {
      setKuvaus(value.kuvaus!, { debounce: false });
    }
  }, [value?.kuvaus, setKuvaus]);

  useEffect(() => {
    if (value?.vastaavuus !== undefined) {
      setVastaavuus(value.vastaavuus!, { debounce: false });
    }
  }, [value?.vastaavuus, setVastaavuus]);

  return (
    <TableRow data-testid={`asiakirjamallit-tutkinnoista-${id}`}>
      <TableCell>{label}</TableCell>
      <StatelessRadioGroup
        vastaavuusObservable={vastaavuusObservable}
        setVastaavuus={setVastaavuus}
      />
      <StatelessKuvausInput
        kuvausObservable={kuvausObservable}
        setKuvaus={setKuvaus}
        kuvausLabel={kuvausLabel}
      />
    </TableRow>
  );
};

interface AsiakirjamalliChangeRequest {
  lahde: AsiakirjamalliLahde;
  vastaavuus?: boolean;
  kuvaus?: string;
}

export const AsiakirjaMallejaVastaavistaTutkinnoista = ({
  hakemus,
  updateHakemus,
}: {
  hakemus: Hakemus;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const handleChange = (changeRequest: AsiakirjamalliChangeRequest) => {
    const changedLahde = changeRequest.lahde;
    const toBeVastaavuus = match([
      hakemus.asiakirjamallitTutkinnoista?.[changedLahde]?.vastaavuus,
      changeRequest.vastaavuus,
      changeRequest.kuvaus,
    ])
      .with([P._, P.not(P.nullish), P._], ([, newVal]) => newVal)
      .with([P.not(P.nullish), P.nullish, P._], ([origVal, ,]) => origVal)
      .with([P.nullish, P.nullish, P.not(P.nullish)], () => false)
      .with([P.nullish, P.nullish, P.nullish], () => undefined)
      .exhaustive();

    if (toBeVastaavuus !== undefined) {
      const updatedMalli = {
        ...hakemus.asiakirjamallitTutkinnoista?.[changedLahde],
        lahde: changedLahde,
        vastaavuus: toBeVastaavuus,
        kuvaus:
          changeRequest.kuvaus !== undefined
            ? changeRequest.kuvaus
            : hakemus.asiakirjamallitTutkinnoista?.[changedLahde]?.kuvaus,
      };

      const updatedHakemus: Partial<Hakemus> = {
        asiakirjamallitTutkinnoista: {
          ...hakemus.asiakirjamallitTutkinnoista,
          [changedLahde]: updatedMalli,
        },
      };

      updateHakemus(updatedHakemus);
    }
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
              value={hakemus.asiakirjamallitTutkinnoista?.[option.id]}
              handleChange={handleChange}
            />
          ))}
          <ContentRow
            id={'muu'}
            label={t('hakemus.asiakirjat.mallejaTutkinnoista.muu')}
            value={hakemus.asiakirjamallitTutkinnoista?.muu}
            handleChange={handleChange}
            kuvausLabel={t('hakemus.asiakirjat.mallejaTutkinnoista.muuSelite')}
          />
        </TableBody>
      </Table>
    </Stack>
  );
};
