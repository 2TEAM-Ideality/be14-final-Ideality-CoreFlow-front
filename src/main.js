import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia' 
import vuetify from './plugins/vuetify'
import { GanttPlugin } from '@syncfusion/ej2-vue-gantt';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-vue-gantt/styles/material.css';
import { registerLicense } from '@syncfusion/ej2-base';

// 여기에 라이선스 키 붙여넣기
registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF1cWWhPYVF0WmFZfVtgdVdMYF9bR3JPIiBoS35Rc0VlWHpfcnRWRWRVUkd+VEBU');

const app = createApp(App)

app.use(createPinia())  
app.use(router)
app.use(vuetify)
app.use(GanttPlugin);

app.mount('#app')
