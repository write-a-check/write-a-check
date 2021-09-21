import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Receive from '../views/Receive.vue'
import Write from '../views/Write.vue'
import Revoke from '../views/Revoke.vue'
const routes = [
  { path: "/", component: Home },
  { path: "/refer/:refereeAddr", component: Home },
  { path: "/write", component: Write },
  { path: "/receive", component: Receive },
  { path: "/revoke", component: Revoke }]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
