import { SisaltoItem, SisaltoValue } from '@/src/lib/types/hakemus';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';
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
  const child = currentItem.children.find((childCandidate) =>
    sisaltoItemMatches(childCandidate, childPath[0]),
  );
  if (childPath.length > 1 && child) {
    return findSisaltoItemRecursivelyFromChildren(childPath.slice(1), child);
  }
  return child;
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
