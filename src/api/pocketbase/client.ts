import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// 自动取消设置为 false
pb.autoCancellation(false);

export default pb;
