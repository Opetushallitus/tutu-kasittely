import { Stack } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { StyledLink } from '@/src/components/StyledLink';
import { useHakemus } from '@/src/context/HakemusContext';
import { useMuutHakemukset } from '@/src/hooks/useMuutHakemukset';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export const MuutHakemukset = () => {
  const { t } = useTranslations();
  const { hakemusState } = useHakemus();
  const { muutHakemukset, error, isLoading } = useMuutHakemukset(
    hakemusState.editedData?.hakemusOid,
  );
  const { pathname } = useLocation();
  const { addToast } = useToaster();
  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.muutHakemuksetLataus', t);
  }, [addToast, t, error]);

  const replaceOid = (hakemusOid: string) => {
    return pathname
      .split('/')
      .map((part) => (part.startsWith('1.2.246.') ? hakemusOid : part))
      .join('/');
  };

  const kokoNimi = (etunimet?: string, sukunimi?: string) => {
    return ((etunimet ?? '') + ' ' + (sukunimi ?? '')).trim();
  };

  if (isLoading || muutHakemukset === undefined) {
    return;
  }

  return (
    <Stack direction="column" spacing={1}>
      <OphTypography variant={'label'} sx={{ fontWeight: 'bold' }}>
        {t('hakemus.sivupalkki.muuthakemukset.otsikko')}
      </OphTypography>
      {muutHakemukset.length === 0 && (
        <OphTypography variant={'body1'}>
          {t('hakemus.sivupalkki.muuthakemukset.eiMuitaHakemuksia')}
        </OphTypography>
      )}
      {muutHakemukset.map((mh, index) => {
        return (
          <Stack direction="column" key={`${index}-${mh.hakemusOid}`}>
            <StyledLink
              to={replaceOid(mh.hakemusOid)}
              sx={{ fontWeight: '400' }}
            >
              {mh.asiatunnus ?? mh.hakemusOid}
            </StyledLink>
            {(mh.hakijaEtunimet || mh.hakijaSukunimi) && (
              <OphTypography
                sx={{
                  color: ophColors.grey600,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                }}
              >
                {kokoNimi(mh.hakijaEtunimet, mh.hakijaSukunimi)}
              </OphTypography>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
