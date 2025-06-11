<template>
  <v-card class="pa-4 rounded-xl" elevation="1">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn icon size="small" variant="text" @click="onDelete">
          <v-icon size="20">mdi-delete-outline</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" @click="onTag">
          <v-icon size="20">mdi-tag-outline</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="text-caption text-grey-darken-1 mb-3">
      생성일 : {{ createdAt }} &nbsp;
      <v-icon size="14" class="mr-1">mdi-account</v-icon>
      {{ author }}
    </div>

    <v-row class="text-center">
      <v-col>
        <div class="text-caption text-grey-darken-1">총 소요일</div>
        <div class="text-body-1 font-weight-bold">{{ totalDays }}일</div>
      </v-col>
      <v-col>
        <div class="text-caption text-grey-darken-1">전체 태스크</div>
        <div class="text-body-1 font-weight-bold">{{ totalTasks }}</div>
      </v-col>
      <v-col>
        <div class="text-caption text-grey-darken-1">사용 프로젝트</div>
        <div class="text-body-1 font-weight-bold">{{ usedProjects }}</div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  createdAt: String,
  author: String,
  totalDays: Number,
  totalTasks: Number,
  usedProjects: Number,
});

const emit = defineEmits(['delete', 'tag']);

const onDelete = () => emit('delete');
const onTag = () => emit('tag');
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
