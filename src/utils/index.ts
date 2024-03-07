export function orderKeyBySprint(sprintObj: Record<string, any>, springItemOrder?: string[], sprintStartWord: string = '') {
  const sprintKeys = Object.keys(sprintObj).sort((a, b) => {
    if (!springItemOrder) return 0;
    const [aBoard, , aSprint] = a.split(' ');
    const [bBoard, , bSprint] = b.split(' ');
    if (springItemOrder.indexOf(aBoard) === -1) return 1;
    if (springItemOrder.indexOf(bBoard) === -1) return -1;
    if (aBoard !== bBoard) {
      return springItemOrder.indexOf(aBoard) - springItemOrder.indexOf(bBoard);
    }

    const aSpringNumber = Number(aSprint.replace(sprintStartWord, ''))
    const bSpringNumber = Number(bSprint.replace(sprintStartWord, ''))
    return aSpringNumber - bSpringNumber;
  });
  const newSprintObj: Record<string, any> = {};
  for (const key of sprintKeys) {
    newSprintObj[key] = sprintObj[key];
  }
  sprintObj = newSprintObj;

  return sprintObj;
};

// a little function to help us with reordering the result
export function reorder<T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};