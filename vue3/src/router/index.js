import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Receive from '../views/Receive.vue'
import Write from '../views/Write.vue'
import Revoke from '../views/Revoke.vue'
import Donate from '../views/Donate.vue'

const routes = [
  { path: "/app", component: Receive },
  { path: "/app/about", component: Home },
  { path: "/app/write", component: Write },
  { path: "/app/donate", component: Donate },
  { path: "/app/revoke", component: Revoke }]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
