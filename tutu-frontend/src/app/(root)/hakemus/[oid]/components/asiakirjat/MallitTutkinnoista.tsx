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

type LahdeOption = {
  id: AsiakirjamalliLahde;
  lKey: string;
};

const LahdeOptionsWoMuut: LahdeOption[] = [
  { id: 'ece', lKey: 'hakemus.asiakirjat.malleja_tutkinnoista.ece' },
  {
    id: 'UK_enic',
    lKey: 'hakemus.asiakirjat.malleja_tutkinnoista.uk-enic',
  },
  {
    id: 'naric_portal',
    lKey: 'hakemus.asiakirjat.malleja_tutkinnoista.naric-portal',
  },
  { id: 'nuffic', lKey: 'hakemus.asiakirjat.malleja_tutkinnoista.nuffic' },
  { id: 'aacrao', lKey: 'hakemus.asiakirjat.malleja_tutkinnoista.aacrao' },
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
            label={t('hakemus.asiakirjat.malleja_tutkinnoista.lahde')}
          />
        </TableCell>
        <TableCell style={{ width: '5%' }}>
          <BoldedLabel label={t('yleiset.kylla')} />
        </TableCell>
        <TableCell style={{ width: '7%' }}>
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

const RadioGroup = ({
  id,
  value,
  handleChange,
}: {
  id: AsiakirjamalliLahde;
  value?: boolean;
  handleChange: (changeRequest: AsiakirjamalliChangeRequest) => void;
}) => {
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({
      lahde: id,
      vastaavuus: event.target.value === 'true',
    });
  };

  return (
    <>
      <TableCell>
        <OphRadio
          value={'true'}
          checked={value === true}
          label={''}
          name="vastaavuus_true_false"
          onChange={onChange}
        ></OphRadio>
      </TableCell>
      <TableCell>
        <OphRadio
          value={'false'}
          checked={value === false}
          label={''}
          name="vastaavuus_true_false"
          onChange={onChange}
        ></OphRadio>
      </TableCell>
    </>
  );
};

const StatelessKuvausInput = ({
  kuvaus,
  setKuvaus,
  kuvausLabel,
  useOphInputFormField,
}: {
  kuvaus: Observable<string>;
  setKuvaus: DebounceSetValue<string>;
  kuvausLabel?: string;
  useOphInputFormField: boolean;
}) => {
  return (
    <TableCell>
      {useOphInputFormField ? (
        <OphInputFormField
          label={kuvausLabel}
          value={kuvaus}
          onChange={(event) =>
            setKuvaus(event.target.value, { debounce: true })
          }
        />
      ) : (
        <OphInput
          value={kuvaus}
          onChange={(event) =>
            setKuvaus(event.target.value, { debounce: true })
          }
        />
      )}
    </TableCell>
  );
};

const ContentRow = ({
  id,
  label,
  value,
  handleChange,
  useOphInputFormField = false,
  kuvausLabel,
}: {
  id: AsiakirjamalliLahde;
  label: string;
  value?: AsiakirjamalliTutkinnosta;
  handleChange: (changeRequest: AsiakirjamalliChangeRequest) => void;
  useOphInputFormField?: boolean;
  kuvausLabel?: string;
}) => {
  const [kuvausObservable, setKuvaus] = useDebounced((val: string) => {
    handleChange({ lahde: id, kuvaus: val });
  });

  const kuvaus = useObservable(kuvausObservable);

  useEffect(() => {
    if (value?.kuvaus) {
      setKuvaus(kuvaus, { debounce: false });
    }
  }, [value?.kuvaus, setKuvaus, kuvaus]);

  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <RadioGroup
        id={id}
        value={value?.vastaavuus}
        handleChange={handleChange}
      />
      <StatelessKuvausInput
        kuvaus={kuvaus}
        setKuvaus={setKuvaus}
        kuvausLabel={kuvausLabel}
        useOphInputFormField={useOphInputFormField}
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
    const updatedMalli = {
      ...hakemus.asiakirjamallitTutkinnoista?.[changedLahde],
      lahde: changedLahde,
      vastaavuus:
        changeRequest.vastaavuus !== undefined
          ? changeRequest.vastaavuus
          : hakemus.asiakirjamallitTutkinnoista?.[changedLahde]?.vastaavuus,
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
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.malleja_tutkinnoista.otsikko')}
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
            label={'hakemus.asiakirjat.malleja_tutkinnoista.muut'}
            value={hakemus.asiakirjamallitTutkinnoista?.muu}
            handleChange={handleChange}
            useOphInputFormField={true}
            kuvausLabel={t(
              'hakemus.asiakirjat.malleja_tutkinnoista.muut_selite',
            )}
          />
        </TableBody>
      </Table>
    </Stack>
  );
};
