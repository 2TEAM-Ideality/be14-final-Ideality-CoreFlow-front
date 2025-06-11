<template>
    <ListLayout title="템플릿 목록" >
        템플릿 목록

            <v-container fluid>
              <v-row dense>
                <v-col
                  v-for="template in templates"
                  :key="template.id"
                  cols="12" sm="6" md="4"
                >
                  <TemplateCard
                    v-bind="template"
                    @delete="handleDelete"
                  />
                </v-col>
              </v-row>
            </v-container>
    </ListLayout>

 

</template>

<script setup>
import ListLayout from '@/components/layout/ListLayout.vue';
import TemplateCard from '@/components/template/TemplateCard.vue';

import { ref, onMounted } from 'vue'
import axios from 'axios'

const templates = ref([])

onMounted(async () => {
  const res = await axios.get('/api/template/list')
  templates.value = res.data.data
})

const handleDelete = (id) => {
  templates.value = templates.value.filter(t => t.id !== id)
}
</script>

<style scoped>
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
</style>

