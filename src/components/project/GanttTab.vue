<template>
  <div>
    <button @click="cancelChanges">수정 취소</button>
    <ejs-gantt 
      ref="gantt"
      id="GanttContainer"
      :key="ganttKey"


      :autoCalculateParentTasks="false"
      :enablePredecessorValidation="false"
      :dataSource="formattedData"
      :treeColumnIndex="treeColumnIndex"
      :taskFields="taskFields"
      :columns="columns"
      :renderBaseline="true"
      :workWeek="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']"
      :highlightWeekends="true"
      :editSettings="editSettings"
      :resourceFields= "resourceFields"
      :resources="resourceCollection"
      :projectStartDate= "projectStartDate" 
      :projectEndDate= "projectEndDate"
      :allowSelection= "true"
      :toolbar= "toolbar"
      :labelSettings="labelSettings"
      baselineColor='#cccccc'
      height="450px"  

      :splitterSettings="splitterSettings"

      @actionComplete="onActionComplete"
    >
    </ejs-gantt>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import { GanttComponent as EjsGantt, Edit, Toolbar, Selection } from '@syncfusion/ej2-vue-gantt';

provide('gantt', [Edit, Toolbar, Selection])

const splitterSettings = {
    position: "15%"
};
const gantt = ref(null)

const labelSettings = {
    rightLabel: 'resources',
    taskLabel: 'taskName'
};

const ganttKey = ref(0)

function cancelChanges() {
  taskData.value = originData.value.map(t => ({ ...t }));
  ganttKey.value += 1  // 강제로 Gantt 재렌더링
}

const editSettings = {
  allowEditing: true,      // 셀 편집 허용
  allowAdding: true,       // 작업 추가 허용
  allowDeleting: true,     // 작업 삭제 허용
  allowTaskbarEditing: true,
  showDeleteConfirmDialog: true,
  enableDependencyDragAndDrop: true,
  mode: 'CellEditing'      // 편집 모드 (CellEditing, Dialog, Auto 등)
}

function onActionComplete(args) {
  console.log('Action complete:', args);
  const updatedTask = args.data;
  console.log('수정된 태스크:', updatedTask);
}

const columns = [
  { field: 'taskId', visible: false, },
  { field: 'taskName', headerText: '이름', textAlign: 'Center', editType: 'stringedit' },
  { field: 'progress', headerText: '진척률', textAlign: 'Center', editType: 'numericedit' },
  { field: 'status', headerText: '상태',  allowEditing: false },
  { field: 'startDate', headerText: '시작일', format: 'yyyy-MM-dd', textAlign: 'Center', editType: 'datepickeredit' },
  { field: 'endDate', headerText: '마감일', format: 'yyyy-MM-dd', textAlign: 'Center', editType: 'datepickeredit' },
  { field: 'startBase', headerText: '시작 베이스라인', format: 'yyyy-MM-dd', textAlign: 'Center', editType: 'datepickeredit', allowEditing: false },
  { field: 'endBase', headerText: '마감 베이스라인', format: 'yyyy-MM-dd', textAlign: 'Center', editType: 'datepickeredit', allowEditing: false },
  { field: 'delay', headerText: '지연일', textAlign: 'Center', editType: 'numericedit'},  
]

const treeColumnIndex = 1

const viewType = 'ResourceView'

const originData = ref([
  {
    "taskId": 1,
    "taskName": "도식화",
    "startBase": "2025-06-01",
    "endBase": "2025-06-05",
    "startDate": "2025-06-01",
    "endDate": "2025-06-05",
    "progress": 100.0,
    "status": 'pending',
    "subTasks": [],
    "delay": 0,
  },
  {
    "taskId": 2,
    "taskName": "샘플 평가",
    "startBase": "2025-06-09",
    "endBase": "2025-06-10",
    "startDate": "2025-06-09",
    "endDate": "2025-06-10",
    "progress": 30.0,
    "subTasks": [],
    "status": 'pending',
    "delay": 0,
    "predecessor": "1"
  },
  {
    "taskId": 3,
    "taskName": "그레이딩",
    "startBase": "2025-06-11",
    "endBase": "2025-06-13",
    "startDate": "2025-06-11",
    "endDate": "2025-06-13",
    "progress": 20.0,
    "subTasks": [],
    "status": 'pending',
    "delay": 0,
    "predecessor": "1"
  },
  {
    "taskId": 4,
    "taskName": "원부자재 발주",
    "startBase": "2025-06-01",
    "endBase": "2025-06-12",
    "startDate": "2025-06-01",
    "endDate": "2025-06-12",
    "progress": 70.0,
    "status": 'pending',
    "predecessor": "2,3",
    "manual": true,
    "subTasks": [
      {
        "taskId": 5,
        "taskName": "세부일정 1",
        "startBase": "2025-06-01",
        "endBase": "2025-06-04",
        "startDate": "2025-06-01",
        "endDate": "2025-06-04",
        "progress": 100.0,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 3, resourceUnit: 75}],
      },
      {
        "taskId": 6,
        "taskName": "세부일정 2",
        "startBase": "2025-06-05",
        "endBase": "2025-06-08",
        "startDate": "2025-06-05",
        "endDate": "2025-06-08",
        "progress": 70.0,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 2, resourceUnit: 40}],
        "predecessor": "5"
      },
      {
        "taskId": 7,
        "taskName": "세부일정 3",
        "startBase": "2025-06-08",
        "endBase": "2025-06-10",
        "startDate": "2025-06-08",
        "endDate": "2025-06-10",
        "progress": 60.5,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 1 , resourceUnit: 30}],
        "predecessor": "5,6"
      }
    ],
    "delay": 0,
  }
])
const taskData = ref([
  {
    "taskId": 1,
    "taskName": "도식화",
    "startBase": "2025-06-01",
    "endBase": "2025-06-05",
    "startDate": "2025-06-01",
    "endDate": "2025-06-05",
    "progress": 100.0,
    "status": 'pending',
    "subTasks": [],
    "delay": 0,
  },
  {
    "taskId": 2,
    "taskName": "샘플 평가",
    "startBase": "2025-06-09",
    "endBase": "2025-06-10",
    "startDate": "2025-06-09",
    "endDate": "2025-06-10",
    "progress": 30.0,
    "subTasks": [],
    "status": 'pending',
    "delay": 0,
    "predecessor": "1"
  },
  {
    "taskId": 3,
    "taskName": "그레이딩",
    "startBase": "2025-06-11",
    "endBase": "2025-06-13",
    "startDate": "2025-06-11",
    "endDate": "2025-06-13",
    "progress": 20.0,
    "subTasks": [],
    "status": 'pending',
    "delay": 0,
    "predecessor": "1"
  },
  {
    "taskId": 4,
    "taskName": "원부자재 발주",
    "startBase": "2025-06-01",
    "endBase": "2025-06-12",
    "startDate": "2025-06-01",
    "endDate": "2025-06-12",
    "progress": 70.0,
    "status": 'pending',
    "predecessor": "2,3",
    "manual": true,
    "subTasks": [
      {
        "taskId": 5,
        "taskName": "세부일정 1",
        "startBase": "2025-06-01",
        "endBase": "2025-06-04",
        "startDate": "2025-06-01",
        "endDate": "2025-06-04",
        "progress": 100.0,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 3, resourceUnit: 75}],
      },
      {
        "taskId": 6,
        "taskName": "세부일정 2",
        "startBase": "2025-06-05",
        "endBase": "2025-06-08",
        "startDate": "2025-06-05",
        "endDate": "2025-06-08",
        "progress": 70.0,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 2, resourceUnit: 40}],
        "predecessor": "5"
      },
      {
        "taskId": 7,
        "taskName": "세부일정 3",
        "startBase": "2025-06-08",
        "endBase": "2025-06-10",
        "startDate": "2025-06-08",
        "endDate": "2025-06-10",
        "progress": 60.5,
        "subTasks": [],
        "delay": 0,
        "status": 'pending',
        "resources": [{ resourceId: 1 , resourceUnit: 30}],
        "predecessor": "5,6"
      }
    ],
    "delay": 0,
  }
]);

const projectStartDate = new Date('04/28/2025');
const projectEndDate = new Date('07/18/2025');
const toolbar = ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'Search', 'ZoomIn', 'ZoomOut', 'ZoomToFit'];
const resourceFields = {
    id: 'resourceId',
    name: 'resourceName',
};

const resourceCollection = [
  { resourceId: 1, resourceName: '홍길동', resourceGroup: 'Planning Team1' },
  { resourceId: 2, resourceName: '기계 A', resourceGroup: 'Planning Team2' },
  { resourceId: 3, resourceName: '팀 B', resourceGroup: 'Planning Team3' }
];

// 날짜, progress, subtasks 변환
function processTasks(tasks) {
  return tasks.map(t => ({
    ...t,
    startDate: t.startDate ? toDateOnly(t.startDate) : new Date(),
    endDate: t.endDate ? toDateOnly(t.endDate) : new Date(),
    startBase: t.startBase ? toDateOnly(t.startBase) : new Date(),
    endBase: t.endBase ? toDateOnly(t.endBase) : new Date(),
    actualDuration: Number(getDurationDays(t.startDate, t.endDate)),
    baselineDuration: Number(getDurationDays(t.startBase, t.endBase)),
    progress: t.progress ?? 0,
    delay: t.delay ?? 0,
    isAutoSchedule: false,
    subTasks: t.subTasks ? processTasks(t.subTasks) : [],
  }))
}

function getDurationDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
}

const formattedData = processTasks(taskData.value)

function toDateOnly(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}
// 간트 렌더링용 필드 매핑
const taskFields = {
  id: 'taskId',
  name: 'taskName',
  startDate: 'startDate',
  endDate: 'endDate',
  baselineStartDate: 'startBase',
  baselineEndDate: 'endBase',
  progress: 'progress',
  child: 'subTasks',
  delay: 'delay',
  resourceInfo: 'resources',
  status: 'status',
  dependency: 'predecessor',
  manual: 'isAutoSchedule',
};
</script>
