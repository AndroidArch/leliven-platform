import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify/index';
import i18n from '@/plugins/i18n';
import msw from '@/plugins/msw';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css';
import VueApexCharts from 'vue3-apexcharts';
import store from './store';

// 初始化 PocketBase 认证状态
import { usePocketBaseStore } from '@/store/pocketbaseStore';

const app = createApp(App);

// 注册插件
app.use(router);
app.use(PerfectScrollbar);
app.use(VueApexCharts);
app.use(store);
app.use(i18n);

// 根据环境决定是否启用 MSW
if (import.meta.env.DEV) {
  app.use(msw);
}

app.use(vuetify).mount('#app');

// 初始化 PocketBase 认证状态
const pocketbaseStore = usePocketBaseStore();
pocketbaseStore.initAuth();
