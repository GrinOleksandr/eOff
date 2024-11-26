export const getBestResolutionImage = (srcset: string): string => {
  const set = srcset.split(' ');
  return set[set.length - 2];
};
