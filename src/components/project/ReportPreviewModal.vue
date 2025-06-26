<template>
  <v-dialog v-model="dialogVisible" max-width="900px" persistent>
    <v-card>
      <v-card-title>
        📄 PDF 미리 보기
        <v-spacer />
        <v-btn text @click="emit('update:modelValue', false)">닫기</v-btn>
        <v-btn color="primary" @click="download">다운로드</v-btn>
      </v-card-title>

      <v-card-text class="pdf-container">
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          class="mx-auto"
        />
        <vue-pdf-embed
          v-else
          :source="pdfUrl"
          @loaded="onPdfLoaded"
          style="width: 100%; border: 1px solid #ccc;"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

const props = defineProps({
  modelValue: Boolean,
  blob: Blob
})
const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const pdfUrl = ref('')
const totalPages = ref(0)
const isLoading = ref(true)

watch(() => props.blob, (blob) => {
  if (blob) {
    isLoading.value = true
    pdfUrl.value = URL.createObjectURL(blob)
  }
}, { immediate: true })

const onPdfLoaded = (pdf) => {
  totalPages.value = pdf.numPages
  isLoading.value = false
}

const download = () => {
  const a = document.createElement('a')
  a.href = pdfUrl.value
  a.download = '프로젝트_분석_리포트.pdf'
  a.click()
  URL.revokeObjectURL(pdfUrl.value)
}
</script>

<style scoped>
.pdf-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
