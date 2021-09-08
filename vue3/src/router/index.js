import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Receive from '../views/Receive.vue'
import Write from '../views/Write.vue'
const routes = [
  { path: "/", component: Home },
  { path: "/write", component: Write },
  { path: "/receive", component: Receive }]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
