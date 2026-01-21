<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Mediassist </q-toolbar-title>

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
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Home',
    caption: '',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Noa Iurzola',
    caption: 'Dio',
    icon: 'school',
    link: '/#/Pacijenti',
  },
  {
    title: 'Login',
    caption: 'Dio',
    icon: 'school',
    link: '/#/loginPage',
  },
  {
    title: 'Unos pacijenta',
    caption: 'Dio',
    icon: 'icon',
    link: '/#/unospacijenta',
  },
  {
    title: 'Register',
    caption: 'Dorijan Šepić',
    icon: 'school',
    link: '/#/Registracija',
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
