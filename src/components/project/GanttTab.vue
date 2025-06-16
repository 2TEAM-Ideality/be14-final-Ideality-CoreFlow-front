<template>
  <div>
    <ejs-gantt
      :dataSource="taskData"
      :taskFields="taskFields"
      height="450px"
    ></ejs-gantt>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const taskData = ref([
  {
    TaskID: 1,
    TaskName: '프로젝트 시작',
    StartDate: new Date('2025-06-01'),
    Duration: 5,
    Progress: 50,
  },
  {
    TaskID: 2,
    TaskName: '요구사항 분석',
    StartDate: new Date('2025-06-06'),
    Duration: 4,
    Progress: 30,
    Predecessor: '1',
  },
]);

const taskFields = {
  id: 'TaskID',
  name: 'TaskName',
  startDate: 'StartDate',
  duration: 'Duration',
  progress: 'Progress',
  dependency: 'Predecessor',
};
</script>
