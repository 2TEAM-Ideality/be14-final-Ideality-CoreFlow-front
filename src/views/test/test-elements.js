
export const initialNodes =  [
      {
        "id": "1",
        "type": "custom",
        // "position": {
        //   "x": 110,
        //   "y": 261.5
        // },
        "data": {
          "label": "스타일 기획",
          "description": "시장 조사 및 스타일 방향성 설정",
          "deptList": [
            "기획팀"
          ],
          "startBaseLine": "2025-06-01T00:00:00",
          "endBaseLine": "2025-06-03T00:00:00",
          "duration": 3,
          "slackTime": 1
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "2",
        "type": "custom",
        // "position": {
        //   "x": 380,
        //   "y": 261.5
        // },
        "data": {
          "label": "원단 선정",
          "description": "소재팀과 함께 여름용 원단 샘플 확보",
          "deptList": [
            "소재팀"
          ],
          "startBaseLine": "2025-06-04T00:00:00",
          "endBaseLine": "2025-06-07T00:00:00",
          "duration": 4,
          "slackTime": 2
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "3",
        "type": "custom",
        // "position": {
        //   "x": 650,
        //   "y": 261.5
        // },
        "data": {
          "label": "샘플링",
          "description": "패턴팀과 함께 초도 샘플 제작",
          "deptList": [
            "패턴팀",
            "생산팀"
          ],
          "startBaseLine": "2025-06-08T00:00:00",
          "endBaseLine": "2025-06-12T00:00:00",
          "duration": 5,
          "slackTime": 1
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "4",
        "type": "custom",
        // "position": {
        //   "x": 920,
        //   "y": 73.5
        // },
        "data": {
          "label": "샘플 피드백 & 수정",
          "description": "디자인팀 피드백 후 최종 샘플 확정",
          "deptList": [
            "디자인팀",
            "기획팀"
          ],
          "startBaseLine": "2025-06-13T00:00:00",
          "endBaseLine": "2025-06-18T00:00:00",
          "duration": 6,
          "slackTime": 3
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "node-1748707851446",
        "type": "custom",
        // "position": {
        //   "x": 920,
        //   "y": 261.5
        // },
        "data": {
          "label": "",
          "description": "",
          "deptList": [],
          "duration": null,
          "slackTime": null
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "node-1748707853908",
        "type": "custom",
        // "position": {
        //   "x": 1190,
        //   "y": 167.5
        // },
        "data": {
          "label": "",
          "description": "",
          "deptList": [],
          "duration": null,
          "slackTime": null
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "node-1748707856851",
        "type": "custom",
        // "position": {
        //   "x": 1190,
        //   "y": 355.5
        // },
        "data": {
          "label": "새로운 작업 마지막",
          "description": "새로운 작업 마지막",
          "deptList": [
            "기획팀"
          ],
          "duration": 3,
          "slackTime": 4
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "node-1748707879853",
        "type": "custom",
        // "position": {
        //   "x": 1460,
        //   "y": 355.5
        // },
        "data": {
          "label": "",
          "description": "",
          "deptList": [],
          "duration": null,
          "slackTime": null
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      },
      {
        "id": "node-1748707884117",
        "type": "custom",
        // "position": {
        //   "x": 920,
        //   "y": 440.5
        // },
        "data": {
          "label": "",
          "description": "",
          "deptList": [],
          "duration": null,
          "slackTime": null
        },
        "targetPosition": "left",
        "sourcePosition": "right"
      }
    ];


export const initialEdges = [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "type": "default"
      },
      {
        "id": "e2-3",
        "source": "2",
        "target": "3",
        "type": "default"
      },
      {
        "id": "e3-4",
        "source": "3",
        "target": "4",
        "type": "default"
      },
      {
        "id": "e-3-node-1748707851446",
        "source": "3",
        "target": "node-1748707851446",
        "type": "default"
      },
      {
        "id": "e-node-1748707851446-node-1748707853908",
        "source": "node-1748707851446",
        "target": "node-1748707853908",
        "type": "default"
      },
      {
        "id": "e-node-1748707851446-node-1748707856851",
        "source": "node-1748707851446",
        "target": "node-1748707856851",
        "type": "default"
      },
      {
        "id": "e-node-1748707856851-node-1748707879853",
        "source": "node-1748707856851",
        "target": "node-1748707879853",
        "type": "default"
      },
      {
        "id": "e-3-node-1748707884117",
        "source": "3",
        "target": "node-1748707884117",
        "type": "default"
      },
      {
        "id": "e-node-1748707884117-node-1748707879853-1748707888489",
        "source": "node-1748707884117",
        "target": "node-1748707879853",
        "type": "default"
      }
    ]
