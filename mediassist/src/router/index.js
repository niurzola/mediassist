import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })
Router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresRole) {
    if (!token) {
      return next('/loginPage') // Nema tokena, bježi na login
    }

    // Dekodiranje uloge iz JWT-a
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const ulogaKorisnika = payload.uloga ? payload.uloga.toLowerCase() : ''
      const potrebnaUloga = to.meta.requiresRole.toLowerCase()

      if (ulogaKorisnika === potrebnaUloga) {
        next() // Uloge se poklapaju, pusti ga unutra
      } else {
        console.warn('Nemate pravo pristupa ovoj stranici!')
        next(false) // Blokiraj navigaciju (gumb ne radi)
      }
    } catch (e) {
      next('/loginPage')
      console.error('Neispravan token:', e)
    }
  } else {
    next() // Stranica ne zahtijeva ulogu, pusti korisnika
  }
})

  return Router
})
