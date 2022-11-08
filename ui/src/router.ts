import { createRouter, createWebHashHistory } from 'vue-router';

import PadDetail from './pages/PadDetail.vue';
import MyPadsList from './pages/Dashboard.vue';

const routes = [
    { path: '/', component: MyPadsList },
    { path: '/pad/:actionHashString', component: PadDetail, props: true },
];

export default createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
});