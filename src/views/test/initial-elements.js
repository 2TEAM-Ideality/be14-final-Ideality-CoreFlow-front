export const initialNodes = [
    {
      id: '1',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: '스타일 기획',
        description: '시장 조사 및 스타일 방향성 설정',
        deptList: ['기획팀'],
        startBaseLine: '2025-06-01T00:00:00',
        endBaseLine: '2025-06-03T00:00:00',
        duration: 3,
        slackTime: 1
      }
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 100, y: 250 },
      data: {
        label: '원단 선정',
        description: '소재팀과 함께 여름용 원단 샘플 확보',
        deptList: ['소재팀'],
        startBaseLine: '2025-06-04T00:00:00',
        endBaseLine: '2025-06-07T00:00:00',
        duration: 4,
        slackTime: 2
      }
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 100, y: 400 },
      data: {
        label: '샘플링',
        description: '패턴팀과 함께 초도 샘플 제작',
        deptList: ['패턴팀', '생산팀'],
        startBaseLine: '2025-06-08T00:00:00',
        endBaseLine: '2025-06-12T00:00:00',
        duration: 5,
        slackTime: 1
      }
    },
    {
      id: '4',
      type: 'custom',
      position: { x: 100, y: 550 },
      data: {
        label: '샘플 피드백 & 수정',
        description: '디자인팀 피드백 후 최종 샘플 확정',
        deptList: ['디자인팀', '기획팀'],
        startBaseLine: '2025-06-13T00:00:00',
        endBaseLine: '2025-06-18T00:00:00',
        duration: 6,
        slackTime: 3
      }
    }
  ];
  
  export const initialEdges = [
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
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      type: 'default'
    }
  ];
  