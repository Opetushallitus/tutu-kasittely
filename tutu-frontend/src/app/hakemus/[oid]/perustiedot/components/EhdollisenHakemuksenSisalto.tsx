import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { Sisalto } from '@/src/app/hakemus/[oid]/perustiedot/components/Sisalto';
import { TranslatedHakemuskoskee } from '@/src/app/hakemus/[oid]/perustiedot/components/TranslatedHakemuskoskee';
import { perustietoOsiot } from '@/src/constants/hakemuspalveluSisalto';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';

export type EhdollisenHakemuksenSisaltoProps = {
  hakemus: Hakemus;
  t: TFunction;
};

export const EhdollisenHakemuksenSisalto = ({
  hakemus,
  t,
}: EhdollisenHakemuksenSisaltoProps) => {
  return (
    <>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.hakemusKoskee')}
      </OphTypography>
      <TranslatedHakemuskoskee
        hakemusKoskee={hakemus.hakemusKoskee}
        kieli={hakemus.lomakkeenKieli}
      />
      <Sisalto
        osiot={perustietoOsiot}
        sisalto={hakemus.sisalto}
        lomakkeenKieli={hakemus.lomakkeenKieli}
        filterEmpty={false}
      />
    </>
  );
};
