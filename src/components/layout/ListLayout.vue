<!-- components/common/ListForm.vue -->
<template>
  <v-table>
    <thead style="background-color: #F8F8F8; padding: 5px;">
      <tr>
        <th>
          <v-checkbox
            v-model="selectAll"
            @update:modelValue="toggleAll"
            hide-details
            density="compact"
            class="small-checkbox"
          />
        </th>
        <th v-for="header in headers" :key="header.key">
          {{ header.title }}
        </th>
        <th></th> <!-- 아이콘 버튼 (링크) -->
      </tr>
    </thead>

    <tbody style="font-size: 13px;">
      <tr v-for="(item, index) in paginatedItems" :key="index">
        <td>
          <v-checkbox
            v-model="item.selected"
            hide-details
            density="compact"
            class="small-checkbox"
          />
        </td>
        <td v-for="header in headers" :key="header.key">
          <template v-if="header.key === 'link'">
            <v-btn
              v-if="item.link"
              :href="item.link"
              icon
              variant="text"
              target="_blank"
              download
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
          <template v-else>
            {{ item[header.key] }}
          </template>
        </td>
      </tr>
    </tbody>
  </v-table>

  <v-row justify="center" class="mt-4">
    <v-pagination
      v-model="currentPage"
      :length="pageCount"
      total-visible="5"
      color="primary"
      density="comfortable"
    />
  </v-row>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  }
})

const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 15

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return props.items.slice(start, start + itemsPerPage)
})

const pageCount = computed(() =>
  Math.ceil(props.items.length / itemsPerPage)
)

function toggleAll(value) {
  paginatedItems.value.forEach(item => (item.selected = value))
}

watch(currentPage, () => {
  selectAll.value = false
})
</script>

<style scoped>
.v-table {
  font-size: 14px;
}
.small-checkbox {
  transform: scale(0.8);
  margin: 0;
  padding: 0;
}
.tbody {
  font-size: 12px;
}
.file-list-container {
  margin-top: 20px;
}
</style>
