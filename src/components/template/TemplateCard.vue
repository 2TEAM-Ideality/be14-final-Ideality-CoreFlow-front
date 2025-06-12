<template>
  <v-card class="template-card" @click="showTemplateDetail(id)">
    <!-- 상단 아이콘 버튼 -->
    <div class="top-actions">
      <v-btn icon variant="text" @click.stop="onDelete">
        <v-icon size="18">mdi-delete-outline</v-icon>
      </v-btn>
      <v-btn icon variant="text" @click.stop="onTag">
        <v-icon size="18">mdi-tag-outline</v-icon>
      </v-btn>
    </div>

    <!-- 제목 -->
    <div class="title">{{ name }}</div>

    <!-- 생성일, 작성자 -->
    <div class="info-row">
      <div class="date">생성일 : {{ formatDate(createdAt) }}</div>
      <div class="author">
        <v-icon size="14" class="mr-1">mdi-account</v-icon>{{ createdBy }}
      </div>
    </div>

    <!-- 요약 정보 -->
    <v-row class="summary" dense>
      <v-col class="text-center">
        <div class="label">총 소요일</div>
        <div class="value">{{ duration }}일</div>
      </v-col>
      <v-col class="text-center">
        <div class="label">전체 태스크</div>
        <div class="value">{{ taskCount }}</div>
      </v-col>
      <v-col class="text-center">
        <div class="label">사용 프로젝트</div>
        <div class="value">{{ usingProjects }}</div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter();

defineProps({
  id: Number,
  name: String,
  description: String,
  createdAt: String,
  createdBy: String,
  duration: Number,
  taskCount: Number,
  usingProjects: Number,
  deptList: Array
});

const emit = defineEmits(['delete', 'tag']);

const onDelete = () => emit('delete');
const onTag = () => emit('tag');

const formatDate = (dateStr) => {
  return dateStr?.split('T')[0] ?? dateStr;
};

const showTemplateDetail = (id) => {
  router.push(`/template/detail/${id}`);
};
</script>

<style scoped>
.template-card {
  position: relative;
  padding: 20px;
  border-radius: 12px;
  background-color: #FAFAFA;
  border: 1px solid #E0E0E0;
  transition: box-shadow 0.2s;
  cursor: pointer;
}
.template-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.top-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.info-row {
  font-size: 12px;
  color: #777;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.summary .label {
  font-size: 12px;
  color: #888;
}

.summary .value {
  font-size: 16px;
  font-weight: bold;
  margin-top: 4px;
}
</style>
