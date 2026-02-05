export function camelize(str: string) {
  return str.replace(/-([a-z])/g, function (match: any, letter: string) {
    return letter.toUpperCase();
  });
}
