<template>
  <ListLayout title="템플릿 목록">
    <v-container fluid>
      <v-row dense>
        <template v-for="(template, index) in templates.slice(0, 6)" :key="template.id">
          <v-col cols="12" sm="6" md="6">
            <TemplateCard
              v-bind="template"
              @delete="handleDelete"
            />
          </v-col>
        </template>
      </v-row>
    </v-container>
  </ListLayout>
</template>

<script setup>
import ListLayout from '@/components/layout/ListLayout.vue';
import TemplateCard from '@/components/template/TemplateCard.vue';
import api from '@/util/api.js'
import { ref, onMounted } from 'vue'

const templates = ref([])

onMounted(async () => {
  try {
    const res = await fetchTemplates();
    templates.value = res.data.data;
  } catch (error) {
    console.error('템플릿 목록 불러오기 실패:', error);
  }
});

const fetchTemplates = async () => {
  const res = await api.get('/api/template/list')
  console.log(res.data)
  return res;
}

const handleDelete = (id) => {
  templates.value = templates.value.filter(t => t.id !== id)
}
</script>

<style scoped>
.v-container {
  min-height: 600px;
}
</style>
