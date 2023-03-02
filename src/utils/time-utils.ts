export const startTime = () => {
  return performance.now();
}

export const getElapsedSeconds = (startTime: number) => {
  const endTime = performance.now();
  let timeDiff = endTime - startTime;
  timeDiff /= 1000;

  const seconds = Math.round(timeDiff);
  return seconds;
}
