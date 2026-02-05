export const parseISOLocal = (string: string) => {
  const splitResult = string.split(/\D/);

  return new Date(
    +splitResult[0],
    +splitResult[1] - 1,
    +splitResult[2],
    +splitResult[3],
    +splitResult[4],
    +splitResult[5],
  );
};
