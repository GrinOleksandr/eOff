export const removeSpacesFromString = (input: string): string => {
  return input.replace(/\s+/g, ''); // Replace all spaces (including tabs and newlines) with nothing
};

export const removeNbsp = (input: string): string => {
  return input.replace(/&nbsp;/g, ''); // Replace all occurrences of "&nbsp;" with nothing
};
