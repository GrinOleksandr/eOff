export const linesForQueueNumbers = [
  {
    index: 1,
    line: '00:03-01:13  1 та 6 черги',
    expectedResult: ['1', '6'],
  },
  {
    index: 2,
    line: '08:00-09:00  2 черга',
    expectedResult: ['2'],
  },
  {
    index: 1,
    line: '07:00-08:00  6 та 1 черги',
    expectedResult: ['6', '1'],
  },
];