<template>
  <div>
    <div>
      <!-- <button @click="canEdit = true">수정 </button>
      <button @click="logChanges">수정 완료</button>
      <button @click="cancelChanges">수정 취소</button> -->

    </div>
    <ejs-gantt 
      v-if="isDataReady"
      ref="gantt"
      id="GanttContainer"
      :key="ganttKey"

      :queryTaskbarInfo="onQueryTaskbarInfo"

      :editDialogFields="addDialogFields"
      :autoCalculateParentTasks="true"
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
      baselineColor='#ff0000'
      height="450px"  

      :splitterSettings="splitterSettings"


      @actionComplete="onActionComplete"
      @taskbarClick="onTaskbarClick"
    >
    </ejs-gantt>
  </div>
</template>

<script setup>
import { ref, provide, computed, toRaw, onMounted } from 'vue';
import { GanttComponent as EjsGantt, Edit, Toolbar, Selection, DayMarkers } from '@syncfusion/ej2-vue-gantt';
import { useRouter, useRoute } from 'vue-router'
import api from '@/api';

const route = useRoute()
const projectId = route.params.id

const router = useRouter();

let lastClickTime = 0;

function onQueryTaskbarInfo(args) {
  console.log('args', args)
  const taskId = args.data.taskId
  console.log('taskId', taskId)
  const status = args.data.status
  console.log('status', status)

  const originalTask = findTaskById(taskId, originData.value)
  const originalEndDate = originalTask?.endDate
    ? new Date(originalTask.endDate)
    : null
  console.log('endExpect', originalEndDate)
  let latestChildEndExpect = null;

  // 자식이 있는 경우 가장 늦은 자식의 endExpect 구하기
  if (!args.data.isChild) {
    const children = args.data.childRecords;

    for (const child of children) {
      const childEnd = new Date(child.endDate);
      console.log('childEnd', childEnd)
      if (!latestChildEndExpect || childEnd > latestChildEndExpect) {
        latestChildEndExpect = childEnd;
      }
    }

    // 자식이 부모보다 늦게 끝나는 경우 warning
    if (latestChildEndExpect && originalEndDate) {
      const childDate = stripTime(latestChildEndExpect);
      const originalDate = stripTime(originalEndDate);
      if (childDate > originalDate) {
        args.taskbarBgColor = '#ffff00'; // 경고 색상
        args.taskLabelColor = '#000000';
        return;
      }
    }
  }

  if (status === 'PENDING') {
    args.taskbarBgColor='#cccccc'
  } else if (status === 'COMPLETED') {
    args.taskbarBgColor='#90ff90'
  } else if (status === 'PROGRESS') {
    args.taskbarBgColor='#7578ee'
  } else if (status === 'DELETED') {
    args.taskbarBgColor='#ff9090'
  } else {
    args.taskbarBgColor='#909090'
  }

  args.taskLabelColor = '#000000';
  args.taskbarBorderColor = '#000000'; 
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function onTaskbarClick(args) {
  const now = Date.now();
  const DOUBLE_CLICK_DELAY = 300; // 300ms 이내 클릭 2번 = 더블클릭

  if (now - lastClickTime < DOUBLE_CLICK_DELAY) {
    if (canEdit.value) return
    console.log('더블클릭')
    // 실제 더블클릭 감지됨
    const task = args.data;
    console.log('task', task)

    // 부모만 허용
    if (task.level > 0) {
      console.log('자식 컷')
      return;
    }
    router.push(`/task/${task.taskId}`)
  }

  lastClickTime = now;
}

provide('gantt', [Edit, Toolbar, Selection, DayMarkers])

const splitterSettings = {
    position: "15%"
};
const gantt = ref(null)

const labelSettings = {
    taskLabel: 'taskName'
};

const ganttKey = ref(0)

function cancelChanges() {
  taskData.value = originData.value.map(t => ({ ...t }));
  processTasks(taskData.value)
  ganttKey.value += 1  // 강제로 Gantt 재렌더링
}

function logChanges() {
  console.log('수정된 태스크:', modifiedTasks.value)
  canEdit.value = false
}

// 수정 권한
const canEdit = ref(false)

const editSettings = computed(() => ({
  allowEditing: canEdit.value,      // 셀 편집 허용
  allowAdding: canEdit.value,       // 작업 추가 허용
  allowDeleting: canEdit.value,     // 작업 삭제 허용
  allowTaskbarEditing: canEdit.value,
  showDeleteConfirmDialog: canEdit.value,
  enableDependencyDragAndDrop: canEdit.value,
  mode: 'Dialog'      // 편집 모드 (CellEditing, Dialog, Auto 등)
}))

// const addDialogFields = [
//   { type: 'General', fields: ['taskName', 'startDate', 'endDate'] },
//   }
//   {
//     type: 'Custom',
//     headerText: '부모 태스크',
//     editType: 'dropdownedit',
//     field: 'parentId'
//   }
// ];

function onActionComplete(args) {
  if (args.requestType === 'save') {

    const updated = toRaw(args.data.taskData ?? args.data)
    
    const taskId = updated.taskId
    console.log('originalData', originData.value)
    const original = findTaskById(taskId, originData.value)
    console.log('originalTask', original)
    if (!original) {
      console.log('origin이 없음')
      return
    }

    const diff = compareTask(original, updated)
    if (Object.keys(diff).length > 0) {
      const existing = modifiedTasks.value.find(t => t.taskId === taskId)
      if (existing) {
        Object.assign(existing.changes, diff)
      } else {
        modifiedTasks.value.push({
          taskId,
          taskName: updated.taskName,
          changes: diff
        })
      }
    }

    // const end = new Date(task.endDate);
    // const base = new Date(task.endBase);

    // const delay = Math.max(0, Math.round((end - base) / (1000 * 60 * 60 * 24)));

    // delay 값 업데이트
    // task.delayDays = delay;

    // console.log('지연일 반영됨:', task.taskName, '=>', delay, '일');
  }
}

function findTaskById(id, list) {
  for (const task of list) {
    if (task.taskId === id) return task
    if (task.subTasks?.length) {
      const found = findTaskById(id, task.subTasks)
      if (found) return found
    }
  }
  return null
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
  { field: 'delayDays', headerText: '지연일', textAlign: 'Center', editType: 'numericedit'},  
]

const treeColumnIndex = 1

const originData = ref([])
const taskData = ref([])
const modifiedTasks = ref([])

const isDataReady = ref(false)

onMounted(() => {
  fetchTaskData()
  fetchDeptData()
  fetchProjectDate()
  isDataReady.value=true
})

async function fetchProjectDate() {
  try {
    const response = await api.get(`/api/projects/${projectId}/gantt/project-date`)
    projectStartDate.value = response.data.data.projectStartBase
    projectEndDate.value = response.data.data.projectEndBase
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message)
    }
  }
}

async function fetchTaskData() {
  try {
    const response = await api.get(`/api/projects/${projectId}/gantt`)
    taskData.value = response.data.data
    originData.value = processTasks(response.data.data)
    console.log(JSON.stringify(originData.value, null, 2));
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message)
    }
  }
}

async function fetchDeptData() {
  try {
    const response = await api.get('/api/org/dept/search')
    resourceCollection.value = response.data.data.map(dept => ({
      resourceId: dept.id,
      resourceName: dept.name
    }))
    console.log(resourceCollection.value)
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message) 
    }
  }
}

const projectStartDate = ref(null)
const projectEndDate = ref(null)
const toolbar = computed(() => 
  canEdit.value
  ? ['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit']
  : ['ExpandAll', 'CollapseAll', 'ZoomIn', 'ZoomOut', 'ZoomToFit']
)
const resourceFields = {
    id: 'resourceId',
    name: 'resourceName',
};

const resourceCollection = ref([]);

// 날짜, progress, subtasks 변환
function processTasks(tasks) {
  return tasks.map(t => ({
    ...t,
    startDate: t.startDate ? toDateOnly(t.startDate) : new Date(),
    endDate: t.endDate ? toDateOnly(t.endDate) : new Date(),
    startBase: t.startBase ? toDateOnly(t.startBase) : new Date(),
    endBase: t.endBase ? toDateOnly(t.endBase) : new Date(),
    actualDuration: getDurationDays(t.startDate, t.endDate),
    baselineDuration: getDurationDays(t.startBase, t.endBase),
    predecessor: Array.isArray(t.predecessor) ? t.predecessor.join(',') : '',
    progress: t.progress ?? 0,
    delayDays: t.delayDays ?? 0,
    isAutoSchedule: false,
    parentId: t.isChild ? t.parentTaskId : null,
    resources: Array.isArray(t.resources) ? t.resources : [],
    subTasks: t.subTasks ? processTasks(t.subTasks) : [],
  }))
}

function getDurationDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
}

const formattedData = computed(() => {
  return processTasks(taskData.value)
})

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
  delayDays: 'delayDays',
  parentID: 'parentId',
  resourceInfo: 'resources',
  status: 'status',
  dependency: 'predecessor',
  manual: 'isAutoSchedule',
};

  function compareTask(orig, mod) {
    const changed = {}

    for (const key of Object.keys(mod)) {
      if (key === 'subTasks') continue

      const origVal = orig[key]
      const modVal = mod[key]

      const isDate = origVal instanceof Date || modVal instanceof Date
      const origData = isDate ? new Date(origVal).getDate() : origVal
      const modData = isDate ? new Date(modVal).getDate() : modVal

      // resource 비교 처리
      if (key === 'resources') {
        // mod는 [{resourceId, resourceName}], origin은 {id}
        const modIds = Array.isArray(modData)
        ? modData.map(r => (typeof r === 'object' ? r.resourceId : r)).sort()
        : []

        const origIds = Array.isArray(origData) ? [...origData].sort() : [];

        if (JSON.stringify(modIds) !== JSON.stringify(origIds)) {
            changed[key] = { before: origIds, after: modIds };
        }

        continue; // 리소스는 별도로 처리했으니 넘어감
      }

      if (origData !== modData) {
        changed[key] = { before: origVal, after: modVal }
      }
    }
    return changed
  }
</script>

<style>
@import url("https://cdn.syncfusion.com/ej2/material.css");
</style>


