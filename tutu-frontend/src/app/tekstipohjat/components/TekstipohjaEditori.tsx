import { DeleteOutline } from '@mui/icons-material';
import {
  OphButton,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import { RefObject, useState } from 'react';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { Editor } from '@/src/components/editor/Editor';
import { normalizedEditorContent } from '@/src/components/editor/editor-utils';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useValidation } from '@/src/hooks/useValidation';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { LanguageCode } from '@/src/lib/types/common';
import {
  Paatospohja,
  PaatospohjaKategoria,
} from '@/src/lib/types/paatosteksti';
import { Viestipohja, ViestipohjaKategoria } from '@/src/lib/types/viesti';

const requiredFields = ['nimi', 'kategoriaId'];

export const TekstipohjaEditori = <
  T extends Viestipohja | Paatospohja,
  K extends ViestipohjaKategoria | PaatospohjaKategoria,
>({
  id,
  setValittuId,
  kategoriat,
  currentPohja,
  languages,
  updateLocal,
  onSave,
  hasChanges,
  updateOngoing,
  poistaPohja,
  editorRefs,
  translationKeyPrefix,
}: {
  id?: string;
  setValittuId: (id?: string | null) => void;
  kategoriat: Array<K>;
  currentPohja: T;
  languages: LanguageCode[];
  onSave: () => void;
  updateLocal: (updatedFields: Partial<Viestipohja | Paatospohja>) => void;
  hasChanges: boolean;
  updateOngoing: boolean;
  poistaPohja: () => void;
  editorRefs: Partial<Record<LanguageCode, RefObject<LexicalEditor | null>>>;
  translationKeyPrefix: string;
}) => {
  const { t } = useTranslations();
  const { showConfirmation } = useGlobalConfirmationModal();
  const validation = useValidation(currentPohja, requiredFields);

  const [language, setLanguage] = useState<(typeof languages)[number]>('fi');

  return (
    <>
      <OphInputFormField
        label={t('tekstipohjat.nimi')}
        required
        errorMessage={validation.validationErrors['nimi']}
        value={currentPohja.nimi}
        onChange={(e) => {
          updateLocal({ nimi: e.target.value });
        }}
      ></OphInputFormField>
      <OphSelectFormFieldPatched
        required
        errorMessage={validation.validationErrors['kategoriaId']}
        placeholder={t('yleiset.valitse')}
        label={t('tekstipohjat.kategoria')}
        value={currentPohja.kategoriaId ?? ''}
        options={kategoriat.map((k) => ({ value: k.id!, label: k.nimi }))}
        onChange={(e) => {
          updateLocal({
            kategoriaId: e.target.value,
          });
        }}
        data-testid={'kategoria-select'}
      />
      <Tabs
        buttons={languages.map((lang) => ({
          tabName: lang,
          onClick: () => setLanguage(lang),
          active: language === lang,
        }))}
        tPrefix={'tekstipohjat.kieli'}
      ></Tabs>
      {languages.map((lang) => (
        <div
          style={{ display: language === lang ? 'block' : 'none' }}
          key={lang}
        >
          {editorRefs[lang] && (
            <Editor
              key={`tekstipohja-editor-${lang}`}
              editorRef={editorRefs[lang]}
              onChange={(editor) => {
                updateLocal({
                  sisalto: {
                    ...currentPohja.sisalto,
                    [lang]: normalizedEditorContent(editor),
                  },
                });
              }}
            />
          )}
        </div>
      ))}
      <OphButton
        variant={id ? 'text' : 'outlined'}
        onClick={() => {
          if (id) {
            showConfirmation({
              confirmButtonText: t(`${translationKeyPrefix}.poista`),
              content: t(`${translationKeyPrefix}.poista.content`, {
                nimi: currentPohja!.nimi,
              }),
              handleConfirmAction: poistaPohja,
              header: t(`${translationKeyPrefix}.poista.header`),
            });
          } else {
            setValittuId(null);
          }
        }}
        sx={{ marginLeft: 'auto' }}
        startIcon={id ? <DeleteOutline /> : undefined}
      >
        {t(id ? `${translationKeyPrefix}.poista` : 'yleiset.peruuta')}
      </OphButton>
      <SaveRibbon
        onSave={() => validation.validateAndSave(onSave)}
        isSaving={updateOngoing}
        hasChanges={hasChanges}
        lastSaved={currentPohja?.muokattu}
        modifier={currentPohja?.muokkaaja}
      />
    </>
  );
};
