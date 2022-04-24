export const sortHighToLow = (a, b) => {
  return b.probability - a.probability;
};

export function waitFor(millSeconds) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, millSeconds);
  });
}
