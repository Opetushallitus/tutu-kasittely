import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import { OphSelectOption } from '@/src/components/OphSelect';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

type KoodistoItem = {
  koodiUri: string;
  koodiArvo: string;
  nimi: {
    fi: string;
    en: string;
    sv: string;
  };
};

const getKoodistoOptions = (
  koodisto: KoodistoItem[],
  lang: string,
): OphSelectOption<string>[] => {
  return koodisto
    .filter(
      (item) => item.nimi && item.nimi[lang as keyof KoodistoItem['nimi']],
    )
    .map((koodistoItem) => ({
      value: koodistoItem.koodiUri,
      label: koodistoItem.nimi[lang as keyof KoodistoItem['nimi']],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const getKorkeakouluOptions = (
  koodisto: KoodistoItem[],
  lang: string,
  muuLabel: string,
): OphSelectOption<string>[] => {
  const options = getKoodistoOptions(koodisto, lang);

  const muuOption: OphSelectOption<string> = {
    value: 'muu',
    label: muuLabel,
  };

  return [...options, muuOption];
};

export const getKoodisto = async (
  koodisto: string,
): Promise<KoodistoItem[]> => {
  const url = `koodisto/${koodisto}`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const useKoodistoOptions = () => {
  const { t } = useTranslations();
  const asiointikieli = useAsiointiKieli();
  type Locale = keyof KoodistoItem['nimi'];
  const lang = asiointikieli as Locale;

  const { data: maatJaValtiot = [], error: maatJaValtiotError } = useQuery<
    KoodistoItem[]
  >({
    queryKey: ['getKoodisto', 'maatjavaltiot2'],
    queryFn: () => getKoodisto('maatjavaltiot2'),
    staleTime: Infinity,
  });

  const { data: koulutusLuokitus = [], error: koulutusLuokitusError } =
    useQuery<KoodistoItem[]>({
      queryKey: [
        'getKoodisto',
        'kansallinenkoulutusluokitus2016koulutusalataso1',
      ],
      queryFn: () =>
        getKoodisto('kansallinenkoulutusluokitus2016koulutusalataso1'),
      staleTime: Infinity,
    });

  const {
    data: korkeakoulut = [],
    error: korkeakoulutError,
    isLoading: korkeakoulutLoading,
  } = useQuery<KoodistoItem[]>({
    queryKey: ['getKoodisto', 'korkeakoulut'],
    queryFn: () => getKoodisto('korkeakoulut'),
    staleTime: Infinity,
  });

  const maatJaValtiotOptions = getKoodistoOptions(maatJaValtiot, lang);
  const koulutusLuokitusOptions = getKoodistoOptions(
    koulutusLuokitus,
    lang,
  ).filter((option) => option.value !== '00');
  const korkeakouluOptions = getKorkeakouluOptions(
    korkeakoulut,
    lang,
    t('hakemus.perustelu.lausuntotiedot.muuLausunnonAntajaValinta'),
  );

  return {
    maatJaValtiotOptions,
    koulutusLuokitusOptions,
    korkeakouluOptions,
    isLoading: korkeakoulutLoading,
    error: maatJaValtiotError || koulutusLuokitusError || korkeakoulutError,
  };
};
