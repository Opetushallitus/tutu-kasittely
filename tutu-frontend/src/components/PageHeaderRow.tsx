import { Stack } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

import { SearchBar } from './SearchBar';

import { HomeIcon, HomeStyledChevron } from '@/src/components/HomeLink';

export const PageHeaderRow = ({
  header,
  showSearchBar,
}: {
  header: string;
  showSearchBar?: boolean;
}) => {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <HomeIcon href={`/`} />
        <HomeStyledChevron />
        <OphTypography
          variant={'h2'}
          component={'h1'}
          sx={showSearchBar ? { paddingRight: '88px' } : undefined}
        >
          {header}
        </OphTypography>
      </Stack>
      {showSearchBar && <SearchBar />}
    </Stack>
  );
};
