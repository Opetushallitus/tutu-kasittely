import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import { Option } from '@/src/constants/dropdownOptions';

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
): Option[] => {
  return koodisto
    .map((koodistoItem) => ({
      value: koodistoItem.koodiArvo,
      label: koodistoItem.nimi[lang as keyof KoodistoItem['nimi']],
    }))
    .sort((a, b) => a.label.localeCompare(b.label)) as Option[];
};

export const getKoodisto = async (
  koodisto: string,
): Promise<KoodistoItem[]> => {
  const url = `koodisto/${koodisto}`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const useKoodistoOptions = () => {
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

  const maatJaValtiotOptions = getKoodistoOptions(maatJaValtiot, lang);
  const koulutusLuokitusOptions = getKoodistoOptions(
    koulutusLuokitus,
    lang,
  ).filter((option) => option.value !== '00');

  return {
    maatJaValtiotOptions,
    koulutusLuokitusOptions,
    error: maatJaValtiotError || koulutusLuokitusError,
  };
};
