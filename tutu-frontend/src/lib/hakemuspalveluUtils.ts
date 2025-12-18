import {
  AsiakirjaMetadata,
  SisaltoItem,
  SisaltoPathNode,
  SisaltoValue,
  TarkistuksenTila,
} from '@/src/lib/types/hakemus';
import {
  Language,
  TranslatedName,
} from '@/src/lib/localization/localizationTypes';
import { HakemuspalveluSisaltoId } from '@/src/constants/hakemuspalveluSisalto';

export const sisaltoItemMatches = (
  item: SisaltoItem,
  key: HakemuspalveluSisaltoId,
): boolean => {
  return item && (item.key === key.generatedId || item.key === key.definedId);
};

export const sisaltoItemMatchesToAny = (
  item: SisaltoItem,
  keys: HakemuspalveluSisaltoId[],
): boolean => keys.find((key) => sisaltoItemMatches(item, key)) !== undefined;

const findSisaltoItemRecursivelyFromChildren = (
  childPath: HakemuspalveluSisaltoId[],
  currentItem: SisaltoItem,
): SisaltoItem | undefined => {
  if (!childPath.length) return currentItem;

  // First, try to find in children
  const child = currentItem.children.find((childCandidate) =>
    sisaltoItemMatches(childCandidate, childPath[0]),
  );
  if (child) {
    if (childPath.length > 1) {
      return findSisaltoItemRecursivelyFromChildren(childPath.slice(1), child);
    }
    return child;
  }

  // If not found in children, search in followups of value items
  if (currentItem.value && currentItem.value.length > 0) {
    for (const valueItem of currentItem.value) {
      if (valueItem.followups && valueItem.followups.length > 0) {
        const followupChild = valueItem.followups.find((followup) =>
          sisaltoItemMatches(followup, childPath[0]),
        );
        if (followupChild) {
          if (childPath.length > 1) {
            return findSisaltoItemRecursivelyFromChildren(
              childPath.slice(1),
              followupChild,
            );
          }
          return followupChild;
        }
      }
    }
  }

  return undefined;
};

export const findSisaltoQuestionAndAnswer = (
  sisalto: SisaltoItem[],
  childPath: HakemuspalveluSisaltoId[],
  kieli: keyof TranslatedName = 'fi',
): [string | undefined, string | undefined] => {
  let item = sisalto.find((item) => sisaltoItemMatches(item, childPath[0]));
  if (item) {
    item = findSisaltoItemRecursivelyFromChildren(childPath.slice(1), item);
  }
  if (item) {
    const label = item.label?.[kieli] || item.label?.fi;
    const value = item.value[0];
    const answer = value ? value.label?.[kieli] || value.label?.fi : undefined;
    return [label, answer];
  }
  return [undefined, undefined];
};

export const findSisaltoValuesByItem = (
  sisaltoId: HakemuspalveluSisaltoId,
  sisalto: SisaltoItem,
): SisaltoValue[] => {
  if (sisaltoItemMatches(sisalto, sisaltoId)) {
    return sisalto.value;
  }
  const children = sisalto?.children || [];
  for (const child of children) {
    const result = findSisaltoValuesByItem(sisaltoId, child);
    if (result.length > 0) {
      return result;
    }
  }
  return [];
};

export const isAttachmentField = (item: SisaltoItem): boolean => {
  return item.fieldType === 'attachment';
};

/* ------------------------------------------------------------ */
/* Korkean tason funktio asiakirjojen etsimiseen puurakenteesta */

export const haeAsiakirjat = (sisalto: SisaltoPathNode[]): SisaltoValue[] => {
  const acc: SisaltoValue[] = [];

  const handleItem = (item: SisaltoPathNode) => {
    if (
      'followups' in item && // this is a SisaltoValue
      item.previous &&
      'fieldType' in item.previous &&
      isAttachmentField(item.previous)
    ) {
      const newItem = {
        ...item,
        formId: item.previous.key,
      };
      acc.push(newItem);
    }
  };

  traverseSisaltoTree(sisalto, handleItem);

  return acc;
};

/* ------------------------------------------------- */
/* Sisalto-rakenteelle määritetyt puun kulkufunktiot */

const traverseSisaltoTree = (
  openList: SisaltoPathNode[],
  handleItem: (item: SisaltoPathNode) => void,
) => {
  traverseTree(expand, combine, handleItem, openList);
};

const expand = (item: SisaltoPathNode): SisaltoPathNode[] => {
  const children = 'children' in item ? item.children : [];
  const followups = 'followups' in item ? item.followups : [];
  const value = getValueList(item);

  return [...followups, ...value, ...children].map((childItem) => ({
    ...childItem,
    previous: item,
  }));
};

const combine = (
  items: SisaltoPathNode[],
  newItems: SisaltoPathNode[],
): SisaltoPathNode[] => {
  return [...newItems, ...items];
};

const getValueList = (item: SisaltoPathNode): SisaltoValue[] => {
  const value = item.value;
  return Array.isArray(value) ? value : [];
};

/* ------------------------------ */
/* Geneerinen puun kulkumenetelmä */

const traverseTree = (
  expand: (item: SisaltoPathNode) => SisaltoPathNode[],
  combine: (
    openList: SisaltoPathNode[],
    newList: SisaltoPathNode[],
  ) => SisaltoPathNode[],
  handleItem: (item: SisaltoPathNode) => void,
  openList: SisaltoPathNode[],
) => {
  const [currentItem, ...restList] = openList;

  // Open list exhausted, end traversal
  if (!currentItem) {
    return;
  }

  handleItem(currentItem);

  const newList = expand(currentItem);
  const combinedList = combine(restList, newList);

  traverseTree(expand, combine, handleItem, combinedList);
};

export const checkLiitteenTila = (
  tiedostoKohtainenMetadata: AsiakirjaMetadata | undefined,
  kokoLiitteenTila: TarkistuksenTila | undefined,
): TarkistuksenTila | undefined => {
  if (
    kokoLiitteenTila?.updateTime &&
    tiedostoKohtainenMetadata?.saapumisaika &&
    kokoLiitteenTila?.state !== 'not-checked'
  ) {
    if (
      new Date(tiedostoKohtainenMetadata.saapumisaika) >
      new Date(kokoLiitteenTila.updateTime)
    ) {
      return { ...kokoLiitteenTila, state: 'not-checked' };
    }
  }
  return kokoLiitteenTila;
};

export const buildLopullinenPaatosSuoritusItems = (
  topLevelItem: SisaltoItem,
  lomakkeenKieli: Language,
  translatedOtsikko: string,
): SisaltoItem[] => {
  const suoritusValues = topLevelItem.children?.[0].value || [];
  return suoritusValues.map((sVal, index) => ({
    label: { [lomakkeenKieli]: translatedOtsikko },
    value: [sVal],
    key: sVal.label[lomakkeenKieli] || `${translatedOtsikko}_${index}`,
    fieldType: '',
    children: [],
  }));
};
