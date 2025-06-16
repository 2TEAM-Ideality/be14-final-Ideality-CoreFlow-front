import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia' 
import vuetify from './plugins/vuetify'
import { GanttPlugin } from '@syncfusion/ej2-vue-gantt';

import { registerLicense } from '@syncfusion/ej2-base';

// ✅ .env에서 키 불러오기
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

const app = createApp(App)

app.use(createPinia())  
app.use(router)
app.use(vuetify)
app.use(GanttPlugin);

app.mount('#app')
