import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia' 
import vuetify from './plugins/vuetify'
import { GanttPlugin } from '@syncfusion/ej2-vue-gantt';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-vue-gantt/styles/material.css';
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-notifications/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-layouts/styles/material.css";
import "@syncfusion/ej2-grids/styles/material.css";
import "@syncfusion/ej2-treegrid/styles/material.css";
import "@syncfusion/ej2-vue-gantt/styles/material.css";
import { registerLicense } from '@syncfusion/ej2-base';


registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

const app = createApp(App)

app.use(createPinia())  
app.use(router)
app.use(vuetify)
app.use(GanttPlugin);

app.mount('#app')
