import { Box, styled } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';

import { CenteredRow } from '@/src/components/CenteredRow';

const LinkBox = styled(Box)({
  border: `2px solid ${ophColors.blue2}`,
  display: 'flex',
});

export const ToimintoLinkki = ({
  href,
  onClick,
  gap,
  icon,
  label,
}: {
  href?: string;
  onClick?: () => void;
  gap: string;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <LinkBox>
      <OphButton
        sx={{ flexGrow: 1, justifyContent: 'flex-start' }}
        href={href}
        onClick={onClick}
      >
        <CenteredRow gap={gap}>
          {icon}
          {label}
        </CenteredRow>
      </OphButton>
    </LinkBox>
  );
};
