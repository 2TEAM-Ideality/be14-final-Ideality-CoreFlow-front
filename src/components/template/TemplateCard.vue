<template>
  <v-card class="template-card" @click="showTemplateDetail(id)">
    <div class="template-info">
      <!-- 상단 태그 -->
      <CategoryTag :categoryName="createdAt.split('T')[0].split('-')[0]" />

      <!-- 제목 -->
      <div class="title">{{ name }}</div>

      <!-- 생성자 / 생성일 -->
      <div class="info-row">
        <div class="author">
          <v-icon size="14" class="mr-1">mdi-account</v-icon>{{ createdBy }}
        </div>
        <div class="date">생성일 : {{ formatDate(createdAt) }}</div>
      </div>
    </div>

    <!-- 하단 요약 정보 -->
    <div class="summary-row">
      <div class="summary-item">
        <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
        총 소요일 <strong>{{ duration }}일</strong>
      </div>
      <div class="summary-item">
        <v-icon size="16" class="mr-1">mdi-format-list-bulleted</v-icon>
        전체 태스크 <strong>{{ taskCount }}</strong>
      </div>
      <!-- <div class="summary-item">
        <v-icon size="16" class="mr-1">mdi-bookmark-outline</v-icon>
        사용 프로젝트 <strong>{{ usingProjects }}</strong>
      </div> -->
      <div class="summary-item">
        <v-icon size="16" class="mr-1">mdi-account-group-outline</v-icon>
        참여 부서 <strong>{{ deptList?.[0]?.name }} +{{ deptList.length - 1 }}</strong>
      </div>
    </div>
  </v-card>
</template>


<script setup>
import { useRouter } from 'vue-router'
import CategoryTag from '@/components/template/CategoryChip.vue'

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
  padding: 20px 25px; 
  border-radius: 12px;
  background-color: #F8F8F8;
  border: 1px solid #CFCFCF;
  cursor: pointer;
  height: 100%;
  text-align: left;
  /* box-shadow 제거됨 */
}
.template-info {
  display:flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
.info-row {
  font-size: 12px;
  color: #777;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom:12px;
}

.template-card:hover {
  /* hover 효과 제거 */
  box-shadow: none;
}

.title {
  font-size: 16px;
  font-weight: bold;
  /* margin-bottom: 16px; */
}

.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

