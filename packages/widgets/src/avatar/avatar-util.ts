export function getHashForString(str: string): number {
  let hash = 0;
  if (str) {
    [...str].forEach((_letter, index) => {
      const charCode = str.charCodeAt(index);
      hash += charCode;
    });
  }
  return hash;
}

// Get random background colors for avatar component
export const getRandomBgClassNameFromName = (name: string): string => {
  const classNames: string[] = [
    'bgPurpleBase',
    'bgGrayBase',
    'bgBlueBase',
    'bgTealBase',
    'bgGreenBase',
    'bgOrangeBase',
  ];
  // To keep consistent bg color for same name, generate index based on the name
  const hash = getHashForString(name);
  const index = hash % classNames.length;
  return classNames[index];
};
