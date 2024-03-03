export function orderKeyBySprint(sprintObj: Record<string, any>) {
  const sprintKeys = Object.keys(sprintObj).sort((a, b) => {
    const springItemOrder = ['CDB', 'DBP', 'FWP', 'DevOps']
    if (a.includes('Backlog')) return 1;
    if (b.includes('Backlog')) return -1;
    const [aBoard, , aSprint] = a.split(' ');
    const [bBoard, , bSprint] = b.split(' ');
    if (aBoard !== bBoard) {
      return springItemOrder.indexOf(aBoard) - springItemOrder.indexOf(bBoard);
    }

    const aSpringNumber = Number(aSprint.replace('R', ''))
    const bSpringNumber = Number(bSprint.replace('R', ''))
    return aSpringNumber - bSpringNumber;
  });
  const newSprintObj: Record<string, any> = {};
  for (const key of sprintKeys) {
    newSprintObj[key] = sprintObj[key];
  }
  sprintObj = newSprintObj;

  return sprintObj;
}