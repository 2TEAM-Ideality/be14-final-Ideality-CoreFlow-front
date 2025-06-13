<template>
  <ListLayout title="템플릿 목록">
    <!-- <v-container fluid> -->
      
    <div class="list-container">
      <SearchBar
        v-model:query="searchQuery"
        :filter-label="selectedDept || '부서 전체'"
        :sort-label="sortLabel"
        :dept-list="allDepts"
        placeholder="템플릿 이름 검색"
        @filter-click="handleDeptFilter"  
        @sort-click="toggleSort"
      />
      <v-row  dense>
        <template v-for="(template, index) in paginatedTemplates" :key="template.id">
          <v-col cols="12" sm="6" md="6" >
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
    </div>
    <!-- </v-container> -->
  </ListLayout>
</template>

<script setup>
import ListLayout from '@/components/layout/ListLayout.vue';
import TemplateCard from '@/components/template/TemplateCard.vue';
import SearchBar from '@/components/common/SearchBar.vue'
import api from '@/util/api.js';
import { ref, onMounted, computed } from 'vue';

/*  페이지  */
const templates = ref([]);
const itemsPerPage = 6;
const currentPage = ref(1);

/*  검색   */
const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const allDepts = ref([])  // 부서 전체 목록



onMounted(async () => {
  try {
    const templateList = await fetchTemplates();     // 템플릿 목록 가져오기
    const deptList = await fetchDeptList();// 부서 목록 가져오기 
    templates.value = templateList.data.data;
    allDepts.value = deptList.data.data;

  } catch (error) {
    console.error('템플릿 목록 불러오기 실패:', error);
  }
});

// 템플릿 목록 가져오기
const fetchTemplates = async () => {
  const res = await api.get('/api/template/list');
  console.log(res);
  return res;
};

// 부서 목록 가져오기
const fetchDeptList = async () => {
  const res = await api.get('/api/dept/all')
  return res;
}


const filteredTemplates = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const deptFilter = selectedDept.value

  return templates.value.filter(t => {
    const matchesKeyword =
      !keyword ||
      t.name?.toLowerCase().includes(keyword) ||
      t.description?.toLowerCase().includes(keyword) ||
      t.createdBy?.toLowerCase().includes(keyword)

    const matchesDept =
      deptFilter === '부서 전체' ||
      t.deptList?.some(dept => dept.name === deptFilter)

    return matchesKeyword && matchesDept
  })
})


const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTemplates.value.slice(start, end)
})

const pageCount = computed(() => {
  return Math.ceil(filteredTemplates.value.length / itemsPerPage)
})

const handleDeptFilter = (deptName) => {
  console.log('선택된 부서:', deptName)
  selectedDept.value = deptName
}

const handleDelete = (id) => {
  templates.value = templates.value.filter(t => t.id !== id)
  if (paginatedTemplates.value.length === 0 && currentPage.value > 1) {
    currentPage.value--
  }
}


const openFilter = () => {
  console.log('부서 필터 클릭')
}
const toggleSort = () => {
  sortLabel.value = sortLabel.value === '오름차순' ? '내림차순' : '오름차순'
}


</script>

<style scoped>
.v-container {
  min-height: 600px;
}
.list-container {
  display: flex;
  flex-direction : column;
  gap: 30px;
}
</style>
