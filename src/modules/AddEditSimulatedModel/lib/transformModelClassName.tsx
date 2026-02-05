const isUpperCaseRegex = (char: string) => {
  return /[A-Z]/.test(char);
};

const isNumber = (char: string) => {
  return !isNaN(Number(char));
};

export const transformModelClassName = (input: string): string => {
  let res = "";

  for (let i = 0; i < input.length; i++) {
    const currentCharacter = input[i];
    const nextCharacter = input[i + 1];

    if (!nextCharacter) {
      res += currentCharacter;
      continue;
    }

    const areBothNumbers = isNumber(currentCharacter) === isNumber(nextCharacter);
    const areBothSameCase =
      (isUpperCaseRegex(currentCharacter) && !isUpperCaseRegex(nextCharacter)) ||
      isUpperCaseRegex(currentCharacter) === isUpperCaseRegex(nextCharacter);

    if (!areBothNumbers || !areBothSameCase) {
      res += `${currentCharacter}_`;
      continue;
    }

    res += currentCharacter;
  }

  return res.toLocaleLowerCase();
};
