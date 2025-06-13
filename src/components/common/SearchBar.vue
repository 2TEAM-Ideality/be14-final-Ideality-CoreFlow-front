<template>
  <div class="search-bar">
    <!-- ✅ 부서 필터 -->
    <v-menu v-model="menu" offset-y >
      <template #activator="{ props }">
        <v-btn
          variant="outlined"
          class="filter-btn"
          v-bind="props"
        >
          <v-icon size="16" class="mr-1">mdi-filter-variant</v-icon>
          {{ filterLabel }}
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          @click="selectDept(null)"
        >
          전체 부서
        </v-list-item>
        <v-list-item
          v-for="dept in deptList"
          :key="dept.deptId"
          @click="selectDept(dept.deptName)"
        >
          {{ dept.deptName }}
        </v-list-item>
      </v-list>
    </v-menu>

     <!-- 검색 input -->
    <input
      class="search-new"
      type="text"
      v-model="searchInput"
      :placeholder="placeholder"
      @input="$emit('update:query', searchInput)"
    />



    <!-- 정렬 버튼 -->
    <v-btn variant="outlined" class="sort-btn" @click="$emit('sort-click')">
      <v-icon size="16" class="mr-1">mdi-sort</v-icon>
      {{ sortLabel }}
    </v-btn>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  query: String,
  filterLabel: String,
  sortLabel: String,
  deptList: Array,
  placeholder: {
    type: String,
    default: '검색어를 입력하세요'
  }
})
const emit = defineEmits(['update:query', 'filter-click', 'sort-click'])

const searchInput = ref(props.query || '')
watch(() => searchInput.value, val => emit('update:query', val))

// ✅ 부서 선택 드롭다운용
const menu = ref(false)
const selectDept = (deptName) => {
  emit('filter-click', deptName || '부서 전체')
  menu.value = false
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-btn,
.sort-btn {
  white-space: nowrap;
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
  border: solid 1px #D9D9D9;
  color: #767676;
}



/* 커스텀 검색창 */
.search-new {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #D9D9D9;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-new:focus {
  border-color: #6366f1;
}

.icon {
  margin-right: 4px;
}
</style>
