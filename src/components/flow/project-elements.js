// src/views/test/project-elements.js

export const initialProjectNodes = [
  {
    id: '1',
    type: 'task',
    data: {
      label: '기획 완료',
      startDate: '2025-06-01',
      endDate: '2025-06-05',
      endLabel: '마감일',
      progress: 100,
      elapsed: 100,
      delay: 0,
      status: 'done'
    }
  },
  {
    id: '2',
    type: 'task',
    data: {
      label: '디자인 진행중',
      startDate: '2025-06-06',
      endDate: '2025-06-10',
      endLabel: '예상 마감일',
      progress: 40,
      elapsed: 60,
      delay: 1,
      status: 'delayed'
    }
  },
  {
    id: '3',
    type: 'task',
    data: {
      label: '샘플 제작',
      startDate: '2025-06-11',
      endDate: '2025-06-13',
      progress: 0,
      elapsed: 0,
      delay: 0,
      status: 'pending'
    }
  }
]

export const initialProjectEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'default'
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'default'
  }
]
