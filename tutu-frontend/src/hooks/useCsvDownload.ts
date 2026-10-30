import { useState } from 'react';

import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { apiFetch } from '@/src/lib/tutu-backend/api';
import { handleFetchError } from '@/src/lib/utils';

export const useCsvDownload = (alkuPvm: Date | null, loppuPvm: Date | null) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const [loading, setLoading] = useState(false);

  const startDownload = async () => {
    const params = new URLSearchParams();
    if (alkuPvm) params.set('alkuPvm', alkuPvm.toISOString());
    if (loppuPvm) params.set('loppuPvm', loppuPvm.toISOString());
    const queryParams = params.size > 0 ? `?${params.toString()}` : '';

    setLoading(true);
    try {
      const response = await apiFetch(
        'tilastot/tilastokeskus-csv',
        { queryParams, headers: { Accept: 'text/csv' } },
        'no-store',
      );
      const blob = await response.blob();

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'tilastokeskus.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      handleFetchError(addToast, error, 'virhe.tilastoCsvLataus', t);
    } finally {
      setLoading(false);
    }
  };

  return { startDownload, loading };
};
