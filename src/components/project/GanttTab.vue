<template>
  <div class="col-lg-12 control-section">
    <div>
      <ejs-gantt
        ref="gantt"
        id="GanttContainer"
        :dataSource="data"
        :height="height"
        :highlightWeekends="true"
        :taskFields="taskFields"
        :labelSettings="labelSettings"
        :treeColumnIndex="1"
        :projectStartDate="projectStartDate"
        :projectEndDate="projectEndDate"
        :connectorLine="true"
      >
    </ejs-gantt>
    </div>
  </div>
</template>

<script setup>
import { ref,provide } from 'vue';
import { GanttComponent, Selection, DayMarkers } from '@syncfusion/ej2-vue-gantt';
import { projectNewData } from './data-source.js';

// Define reactive state using ref
const data = ref(projectNewData);
const height = ref('450px');
const taskFields = ref({
  id: 'TaskID',
  name: 'TaskName',
  startDate: 'StartDate',
  endDate: 'EndDate',

  progress: 'Progress',
  dependency: 'Predecessor',
  child: 'subtasks'
});
const labelSettings = ref({
  leftLabel: 'TaskName'
});
const projectStartDate = ref(new Date('03/23/2024'));
const projectEndDate = ref(new Date('07/06/2024'));

// Provide DayMarkers and Selection module to the Gantt component
provide('gantt', [DayMarkers, Selection]);
</script>

<style>
@import url("https://cdn.syncfusion.com/ej2/material.css");
</style>


