// data-source.js

export const projectNewData = [
  {
    TaskID: 1,
    TaskName: '프로젝트 시작',
    StartDate: new Date('2024-03-24'),
    EndDate: new Date('2024-03-26'),
    Progress: 20,
    Predecessor: null,
    subtasks: [
      {
        TaskID: 2,
        TaskName: '설계 시작',
        StartDate: new Date('2024-03-24'),
        EndDate: new Date('2024-03-25'),
        Progress: 40,
        Predecessor: '1'
      },
      {
        TaskID: 3,
        TaskName: '기획 시작',
        StartDate: new Date('2024-03-25'),
        EndDate: new Date('2024-03-26'),
        Progress: 30,
        Predecessor: '1'
      }
    ]
  },
  {
    TaskID: 4,
    TaskName: '개발 시작',
    StartDate: new Date('2024-03-27'),
    EndDate: new Date('2024-04-10'),
    Progress: 10,
    Predecessor: '1',
    subtasks: [
      {
        TaskID: 5,
        TaskName: '프론트엔드 개발',
        StartDate: new Date('2024-03-27'),
        EndDate: new Date('2024-04-05'),
        Progress: 50,
        Predecessor: '4'
      },
      {
        TaskID: 6,
        TaskName: '백엔드 개발',
        StartDate: new Date('2024-03-28'),
        EndDate: new Date('2024-04-08'),
        Progress: 40,
        Predecessor: '4'
      }
    ]
  },
  {
    TaskID: 7,
    TaskName: '테스트',
    StartDate: new Date('2024-04-11'),
    EndDate: new Date('2024-04-15'),
    Progress: 0,
    Predecessor: '3',
    subtasks: [
      {
        TaskID: 8,
        TaskName: '유닛 테스트',
        StartDate: new Date('2024-04-11'),
        EndDate: new Date('2024-04-13'),
        Progress: 0,
        Predecessor: null
      },
      {
        TaskID: 9,
        TaskName: '통합 테스트',
        StartDate: new Date('2024-04-12'),
        EndDate: new Date('2024-04-15'),
        Progress: 0,
        Predecessor: '8'
      }
    ]
  },
  {
    TaskID: 10,
    TaskName: '배포',
    StartDate: new Date('2024-04-16'),
    EndDate: new Date('2024-04-17'),
    Progress: 0,
    Predecessor: '4',
    subtasks: [
      {
        TaskID: 8,
        TaskName: '유닛 테스트',
        StartDate: new Date('2024-04-11'),
        EndDate: new Date('2024-04-13'),
        Progress: 0,
        Predecessor: '7'
      }
    ]
  },
]
