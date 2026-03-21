import {
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { format } from 'date-fns';
import { parseAsString, useQueryState } from 'nuqs';
import React, { useEffect } from 'react';
import * as R from 'remeda';

import { TableHeaderCell } from '@/src/app/(root)/components/TableHeaderCell';
import {
  VahvistettuViestiModal,
  ViestiMetadata,
} from '@/src/app/hakemus/[oid]/editori/viesti/components/VahvistettuViestiModal';
import { StyledTableBody } from '@/src/components/StyledTableBody';
import { StyledTableCell } from '@/src/components/StyledTableCell';
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { VAHVISTETUT_VIESTIT_SORT_KEY } from '@/src/hooks/useVahvistetutViestit';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  VahvistettuViestiListItem,
  Viestityyppi,
} from '@/src/lib/types/viesti';

const FIELD_KEYS_ARRAY = [
  'hakemus.viesti.lista.vahvistettu',
  'hakemus.viesti.tyyppi',
  'hakemus.viesti.otsikko',
];

const SORTABLE_FIELDS = ['vahvistettu'];

const isSortableField = (fieldKey: string) =>
  SORTABLE_FIELDS.includes(fieldKey.split('.').at(-1)!);

export type VahvistettuListProps = {
  t: TFunction;
  theme: Theme;
  viestiLista: VahvistettuViestiListItem[];
  paivitaVahvistetut: () => void;
  poistaViesti: (id: string) => void;
  lisaaEditoriin: (html: string) => void;
};

export const VahvistettuList = ({
  t,
  theme,
  viestiLista,
  paivitaVahvistetut,
  poistaViesti,
  lisaaEditoriin,
}: VahvistettuListProps) => {
  const [sortDef, setSortDef] = useQueryState('vahvistetutSort', {
    ...parseAsString.withDefault('vahvistusPvm:desc'),
    clearOnDefault: false,
  });

  const handleSort = (sortDef: string) => {
    setSortDef(sortDef);
    localStorage.setItem(VAHVISTETUT_VIESTIT_SORT_KEY, sortDef);
    paivitaVahvistetut();
  };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [viestiInModal, setViestiInModal] = React.useState<
    ViestiMetadata | undefined
  >(undefined);

  const closeModal = () => {
    setIsModalOpen(false);
    setViestiInModal(undefined);
  };

  useEffect(() => {
    if (isModalOpen && viestiInModal) {
      if (!viestiLista.some((listItem) => listItem.id === viestiInModal.id)) {
        closeModal();
      }
    }
  }, [isModalOpen, viestiInModal, viestiLista]);

  const getTyyppi = (tyyppi?: Viestityyppi) =>
    tyyppi ? t(`hakemus.viesti.${tyyppi}`) : '';

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.viesti.listanOtsikko')}
      </OphTypography>
      <VahvistettuViestiModal
        t={t}
        theme={theme}
        open={isModalOpen}
        viestiMetadata={viestiInModal}
        handleClose={closeModal}
        handlePoistaViesti={poistaViesti}
        handleLisaaEditoriin={lisaaEditoriin}
      />
      <TableContainer>
        <Table data-testid={'vahvistettu-viesti-table'}>
          <TableHead>
            <TableRow>
              {R.map(FIELD_KEYS_ARRAY, (fieldKey) => (
                <TableHeaderCell
                  key={fieldKey}
                  colId={fieldKey.split('.').at(-1)}
                  title={t(fieldKey)}
                  sort={sortDef}
                  setSort={handleSort}
                  sortable={isSortableField(fieldKey)}
                ></TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <StyledTableBody>
            {R.map(viestiLista || [], (viesti: VahvistettuViestiListItem) => (
              <TableRow key={viesti.id}>
                <StyledTableCell>
                  <OphButton
                    data-testid={`vahvistettu-viesti-avaa-modal-button-${viesti.id}`}
                    variant="text"
                    sx={{ padding: 0, minWidth: 0, lineHeight: 1 }}
                    onClick={() => {
                      setViestiInModal({
                        id: viesti.id,
                        tyyppi: viesti.tyyppi,
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    {format(
                      Date.parse(viesti.vahvistettu),
                      DATE_TIME_PLACEHOLDER,
                    )}
                  </OphButton>
                </StyledTableCell>
                <StyledTableCell>{getTyyppi(viesti.tyyppi)}</StyledTableCell>
                <StyledTableCell>{viesti.otsikko}</StyledTableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
