<template>
  <ListLayout title="템플릿 목록">
    <v-container fluid>
      <v-row dense>
        <template v-for="(template, index) in paginatedTemplates" :key="template.id">
          <v-col cols="12" sm="6" md="6">
            <TemplateCard
              v-bind="template"
              @delete="handleDelete"
            />
          </v-col>
        </template>
      </v-row>

      <!-- ✅ v-pagination은 v-row 바깥에 위치 -->
      <v-row justify="center" class="mt-4">
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          total-visible="5"
          color="primary"
        />
      </v-row>
    </v-container>
  </ListLayout>
</template>

<script setup>
import ListLayout from '@/components/layout/ListLayout.vue';
import TemplateCard from '@/components/template/TemplateCard.vue';
import api from '@/util/api.js';
import { ref, onMounted, computed } from 'vue';

const templates = ref([]);
const itemsPerPage = 8;
const currentPage = ref(1);

onMounted(async () => {
  try {
    const res = await fetchTemplates();
    templates.value = res.data.data;
  } catch (error) {
    console.error('템플릿 목록 불러오기 실패:', error);
  }
});

const fetchTemplates = async () => {
  const res = await api.get('/api/template/list');
  return res;
};

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return templates.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(templates.value.length / itemsPerPage);
});

const handleDelete = (id) => {
  templates.value = templates.value.filter(t => t.id !== id);
  // 삭제 후 페이지 보정
  if (paginatedTemplates.value.length === 0 && currentPage.value > 1) {
    currentPage.value--;
  }
};
</script>

<style scoped>
.v-container {
  min-height: 600px;
}
</style>
