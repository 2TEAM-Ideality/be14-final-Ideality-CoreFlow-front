<template>
  <v-dialog v-model="dialogVisible" max-width="900px" persistent>
    <v-card>
      <v-card-title>
        📄 PDF 미리 보기
        <v-spacer />
        <div>{{ totalPages }} 페이지</div>
      </v-card-title>

      <v-card-text class="pdf-container">
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          class="mx-auto"
        />
        <div v-else>
          <div v-for="(page, index) in totalPages" :key="index">
            <canvas :ref="el => canvasRefs[index] = el" style="margin-bottom: 16px; border: 1px solid #ccc;" />
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="emit('update:modelValue', false)">닫기</v-btn>
        <v-btn color="primary" @click="download">다운로드</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min?url'

// 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

// props 및 emit
const props = defineProps({
  modelValue: Boolean,
  blob: Blob
})
const emit = defineEmits(['update:modelValue'])

// 다이얼로그 표시 여부
const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 상태값
const pdfUrl = ref('')
const pdfDoc = ref(null)
const totalPages = ref(0)
const isLoading = ref(false)
const canvasRefs = ref([])

// PDF 렌더링 함수
const renderPdf = async () => {
  try {
    isLoading.value = true
    canvasRefs.value = []

    if (!props.blob) return

    pdfUrl.value = URL.createObjectURL(props.blob)
    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl.value })
    const doc = await loadingTask.promise
    pdfDoc.value = doc
    totalPages.value = doc.numPages

    await nextTick()

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 1.2 })
      const canvas = canvasRefs.value[i - 1]
      const context = canvas?.getContext('2d')

      if (!canvas || !context) continue

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
    }
  } catch (err) {
    console.error('PDF 렌더링 실패 ❌', err)
  } finally {
    isLoading.value = false
  }
}

// blob 값이 바뀌면 PDF 렌더링
watch(() => props.blob, () => {
  if (props.blob) renderPdf()
}, { immediate: true })

// 다운로드
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
  padding: 8px;
}
</style>
