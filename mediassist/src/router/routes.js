const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children:[{ path: '', component: () => import('pages/IndexPage.vue') },
              { path: 'Registracija', component: () => import('pages/RegistracijaPage.vue')  },
              { path: 'Pacijenti', component: () => import('pages/PregledPacijenta.vue'), meta: { requiresRole: 'zdravstveni_radnik' } },
              { path: 'unospacijenta', component: () => import('pages/UnosPacijenta.vue'), meta: { requiresRole: 'zdravstveni_radnik' } },
              { path: 'loginPage', component: () => import('pages/loginPage.vue') },
              { path: 'mjerenja', component: () => import('pages/UnosMjerenja.vue') },
              { path: 'recepti', component: () => import('pages/UnosRecepta.vue'), meta: { requiresRole: 'zdravstveni_radnik' } },

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
