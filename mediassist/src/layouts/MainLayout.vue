<template>
  <q-layout view="lHh Lpr lFf">
<q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> MediAssist </q-toolbar-title>
        <q-btn flat round icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Poveznice </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()
const linksList = [
  {
    title: 'Home',
    caption: '',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Prikaz pacijenata',
    caption: 'Noa Iurzola',
    icon: 'school',
    link: '/#/Pacijenti',
  },
  {
    title: 'Login',
    caption: 'Dorijan Šepić',
    icon: 'school',
    link: '/#/loginPage',
  },
  {
    title: 'Unos pacijenta',
    caption: 'Noa Iurzola',
    icon: 'school',
    link: '/#/unospacijenta',
  },
  {
    title: 'Register',
    caption: 'Dorijan Šepić',
    icon: 'school',
    link: '/#/Registracija',
  },
  {
    title: 'Mjerenja',
    caption: 'Dorijan Šepić',
    icon: 'school',
    link: '/#/mjerenja',
  },
  {
    title: 'Recepti',
    caption: 'Dorijan Šepić',
    icon: 'school',
    link: '/#/recepti',
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('token')
  router.push('/loginPage')
}
</script>
