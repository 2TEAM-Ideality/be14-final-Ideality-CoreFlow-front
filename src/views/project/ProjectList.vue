
<script setup>
import Breadcrumb from '@/components/common/BreadCrumb.vue';
import ListLayout from '@/components/layout/ListLayout.vue';
import { useUserStore } from '@/stores/userStore.js'
import api from '@/util/api.js'

const userStore = useUserStore()
const token = userStore.accessToken


const downloadPdf = async () => {
  try {
    const response = await api.get('/api/projects/report/2', {
      responseType: 'blob', // 필수
      headers: {
        'Accept': 'application/pdf' // 안정을 위해
      }
    });

    // ✅ Axios에서는 headers는 object 형태
    const disposition = response.headers['content-disposition'];
    let filename = 'report.pdf';

    const match = disposition?.match(/filename\*?=UTF-8''(.+)/);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF 다운로드 오류:', error);
    alert('PDF 생성에 실패했습니다.');
  }
};





</script>

<template>


    <ListLayout title="프로젝트 목록" >

        프로젝트 목록

        <button @click="downloadPdf">PDF 다운로드</button>
    </ListLayout>


</template>



<style scoped>
.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
}
</style>

