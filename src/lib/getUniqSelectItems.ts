export const getUniqSelectItems = <T, TKey extends keyof T>(list: T[], key: TKey): T[TKey][] => {
  if (!list) return [];

  const uniqueValuesSet = new Set<T[TKey]>();

  list.forEach((item) => {
    uniqueValuesSet.add(item[key]);
  });

  return Array.from(uniqueValuesSet);
};
