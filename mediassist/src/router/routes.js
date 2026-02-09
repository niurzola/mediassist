const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children:[{ path: '', component: () => import('pages/IndexPage.vue') },
              { path: 'Registracija', component: () => import('pages/RegistracijaPage.vue') },
              { path: 'Pacijenti', component: () => import('pages/PregledPacijenta.vue') },
              { path: 'unospacijenta', component: () => import('pages/UnosPacijenta.vue') },
              { path: 'loginPage', component: () => import('pages/loginPage.vue') },
              { path: 'mjerenja', component: () => import('pages/UnosMjerenja.vue') },
              { path: 'recepti', component: () => import('pages/UnosRecepta.vue') },
              { path: 'UnosTermina', component: () => import('pages/UnosTermina.vue') },


    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
