export const getElementPosition = (target: HTMLElement) => {
  const element: HTMLElement = target as HTMLElement;
  const offsetX: number = element.offsetLeft;
  const { width } = element.getBoundingClientRect();
  return {
    offsetX,
    width,
  };
};
