import PocketBase from 'pocketbase';

// PocketBase 实例配置
const pocketbase = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// // 认证状态监听
// pocketbase.authStore.onChange((auth) => {
//   console.log('Auth state changed:', auth);
// });

// // 请求拦截器 - 添加认证头
// pocketbase.beforeSend = function (url, options) {
//   const token = pocketbase.authStore.token;
//   // if (token) {
//   //   options.headers = {
//   //     ...options.headers,
//   //     Authorization1: `${token}`
//   //   };
//   // }
//   return { url, options };
// };

// // 响应拦截器 - 处理错误
// pocketbase.afterSend = function (response, data) {
//   if (!response.ok) {
//     console.error('PocketBase request failed:', response.status, data);
//   }
//   return { response, data };
// };

export default pocketbase;
