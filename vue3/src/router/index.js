import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Receive from '../views/Receive.vue'
import Write from '../views/Write.vue'
import Revoke from '../views/Revoke.vue'
import Donate from '../views/Donate.vue'
import Airdrop from '../views/Airdrop.vue'

const routes = [
  { path: "/", component: Receive },
  { path: "/about", component: Home },
  { path: "/refer/:refereeAddr", component: Receive },
  { path: "/write", component: Write },
  { path: "/receive", component: Receive },
  { path: "/donate", component: Donate },
  { path: "/airdrop", component: Airdrop },
  { path: "/revoke", component: Revoke }]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
