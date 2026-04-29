import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';

import { HomeIcon, HomeStyledChevron } from '@/src/components/HomeLink';

import { SearchBar } from './SearchBar';

export const PageHeaderRow = ({
  header,
  showSearchBar,
}: {
  header: string;
  showSearchBar?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={theme.spacing(0, 1)}
      sx={{ alignItems: 'center' }}
    >
      <HomeIcon href={`/`} />
      <HomeStyledChevron />
      <OphTypography variant={'h2'} component={'h1'}>
        {header}
      </OphTypography>
      {showSearchBar && <SearchBar />}
    </Stack>
  );
};
