export const isFloat = (value: string) => {
  const floatValue = parseFloat(value);
  return !isNaN(floatValue) && Number.isFinite(floatValue) && value.includes(".");
};
