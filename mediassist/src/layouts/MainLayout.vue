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

        <q-toolbar-title @click="idiNaHome" class="cursor-pointer text-weight-bold text-white row items-center">
          <q-icon name="local_hospital" size="28px" class="q-mr-sm" />
          MediAssist
        </q-toolbar-title>

        <q-btn v-if="jePrijavljen" flat round icon="notifications" class="q-mr-sm">
          <q-badge v-if="obavijesti.length > 0" color="red" floating explicit-element>
            {{ obavijesti.length }}
          </q-badge>

          <q-menu style="min-width: 320px;" class="q-pa-sm">
            <div class="text-weight-bold text-subtitle1 q-pa-sm text-primary row items-center">
              <q-icon name="notifications_active" class="q-mr-xs" />
              Podsjetnici
            </div>
            <q-separator />

            <q-item v-if="obavijesti.length === 0">
              <q-item-section class="text-grey-7 text-center q-py-md">
                Nemate podsjetnika.
              </q-item-section>
            </q-item>

            <q-list v-else separator>
              <q-item v-for="obavijest in obavijesti" :key="obavijest.ID_Termina" clickable>
                <q-item-section avatar>
                  <q-avatar icon="calendar_today" color="blue-1" text-color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ obavijest.datum_ispis }} u {{ obavijest.vrijeme_ispis }}
                  </q-item-label>
                  <q-item-label caption>
                    Pacijent: {{ obavijest.ime_pacijenta }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <div v-if="jePrijavljen" class="q-mr-md text-subtitle2 text-weight-light">
          {{ imeIPrezime }} ({{ ispisUloge }})
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-primary text-weight-bold text-uppercase">
          Poveznice
        </q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-white q-pa-sm" bordered>
      <div class="row justify-center q-gutter-x-md style-gumbi">
        <template v-if="!jePrijavljen">
          <q-btn unelevated rounded color="primary" label="Prijava" icon="login" to="/loginPage" />
          <q-btn outline rounded color="primary" label="Registracija" icon="person_add" to="/Registracija" />
        </template>
        <q-btn v-if="jePrijavljen" outline rounded color="red-7" label="Odjava" icon="logout" @click="logout" class="text-weight-bold" />
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()
const route = useRoute()

const token = ref(localStorage.getItem('token'))
const korisnikIme = ref(localStorage.getItem('korisnik_ime') || '')
const korisnikPrezime = ref(localStorage.getItem('korisnik_prezime') || '')
const korisnikUloga = ref(localStorage.getItem('korisnik_uloga') || '')

const leftDrawerOpen = ref(false)
const obavijesti = ref([]) // Lista podsjetnika

const linksList = [
  { title: 'Home', caption: 'Početna stranica', icon: 'home', link: '/' },
  { title: 'Prikaz pacijenata', caption: 'Noa Iurzola', icon: 'people', link: '/Pacijenti' },
  { title: 'Login', caption: 'Dorijan Šepić', icon: 'login', link: '/loginPage' },
  { title: 'Unos pacijenta', caption: 'Noa Iurzola', icon: 'person_add', link: '/unospacijenta' },
  { title: 'Register', caption: 'Dorijan Šepić', icon: 'app_registration', link: '/Registracija' },
  { title: 'Mjerenja', caption: 'Dorijan Šepić', icon: 'monitor_heart', link: '/mjerenja' },
  { title: 'Recepti', caption: 'Dorijan Šepić', icon: 'medication', link: '/recepti' },
  { title: 'Termin', caption: 'Noa Iurzola', icon: 'timer', link: '/termini' }
]

const jePrijavljen = computed(() => !!token.value)

const imeIPrezime = computed(() => {
  return (korisnikIme.value || korisnikPrezime.value) ? `${korisnikIme.value} ${korisnikPrezime.value}` : 'Korisnik'
})

const ispisUloge = computed(() => {
  if (!korisnikUloga.value) return ''
  return korisnikUloga.value.replace('_', ' ')
})

// Funkcija za dohvaćanje obavijesti s backenda
async function dohvatiObavijesti() {
  if (!jePrijavljen.value) return
  try {
    const res = await axios.get('http://localhost:3000/api/obavijesti', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    obavijesti.value = res.data
  } catch (error) {
    console.error("Greška pri dohvaćanju obavijesti:", error)
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function idiNaHome() {
  router.push('/')
}

function logout() {
  localStorage.clear()
  token.value = null
  korisnikIme.value = ''
  korisnikPrezime.value = ''
  korisnikUloga.value = ''
  obavijesti.value = []
  router.push('/loginPage')
}

// Prati promjene rute kako bi ažurirao stanje i ponovno povukao obavijesti
watch(() => route.path, () => {
  token.value = localStorage.getItem('token')
  korisnikIme.value = localStorage.getItem('korisnik_ime') || ''
  korisnikPrezime.value = localStorage.getItem('korisnik_prezime') || ''
  korisnikUloga.value = localStorage.getItem('korisnik_uloga') || ''
  dohvatiObavijesti()
})

onMounted(() => {
  dohvatiObavijesti()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
.cursor-pointer:hover {
  opacity: 0.85;
}
.style-gumbi {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
</style>
