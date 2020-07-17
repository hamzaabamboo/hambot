export const userPattern = /<@!(\d+?)>/;

export const matchUser = (input: string): string | undefined => {
  return userPattern.test(input) ? userPattern.exec(input)[1] : undefined;
};
