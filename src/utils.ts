export const generateRandomKey = () =>
  Math.floor(Math.random() * 1e15).toString(16);
export const dynamicImport = async (packageName: string) =>
  new Function(`return import('${packageName}')`)();
