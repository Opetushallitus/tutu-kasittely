import { SisaltoItem } from '@/src/lib/types/hakemus';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';

const findSisaltoItemRecursivelyFromChildren = (
  childPath: string[],
  currentItem: SisaltoItem,
): SisaltoItem | undefined => {
  if (childPath.length === 0) {
    return currentItem;
  }
  const child = currentItem.children.find(
    (childCandidate) => childCandidate.key === childPath[0],
  );
  if (childPath.length > 1 && child) {
    return findSisaltoItemRecursivelyFromChildren(childPath.slice(1), child);
  }
  return child;
};

export const findSisaltoQuestionAndAnswer = (
  sisalto: SisaltoItem[],
  childPath: string[],
  kieli: keyof TranslatedName = 'fi',
): [string | undefined, string | undefined] => {
  let item = sisalto.find((item) => item.key === childPath[0]);
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
