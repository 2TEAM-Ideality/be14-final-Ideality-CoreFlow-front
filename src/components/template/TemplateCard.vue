<template>
  <v-card :title="name" :subtitle="description" text="..." @click="showTemplateDetail(id)">
    <v-card-actions>
      <v-btn>Click me</v-btn>
    </v-card-actions>
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
    deptList : Array
});

const emit = defineEmits(['delete', 'tag']);

const onDelete = () => emit('delete');
const onTag = () => emit('tag');

const formatDate = (dateStr) => {
  // YYYY-MM-DD 포맷으로 잘라냄
  return dateStr?.split('T')[0] ?? dateStr;
};

const showTemplateDetail = (id) => {
    console.log("템플릿 아이디: " , id)
    router.push(`/template/detail/${id}`)
}


</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
