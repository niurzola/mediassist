<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 400px; max-width: 90vw;" class="q-pa-md shadow-2">
      <q-card-section class="text-center">
        <div class="text-h6 text-primary text-weight-bold">Prijava u sustav</div>
      </q-card-section>

      <q-form @submit.prevent="ulogirajSe" class="q-gutter-md">
        <!-- Input za Email s validacijom -->
        <q-input
          outlined
          label="Email"
          v-model="email"
          type="email"
          :rules="[
            val => !!val || 'Email je obavezan',
            val => /.+@.+\..+/.test(val) || 'Unesite ispravan email'
          ]"
        />

        <!-- Input za Lozinku s validacijom -->
        <q-input
          outlined
          label="Lozinka"
          v-model="lozinka"
          type="password"
          :rules="[val => !!val || 'Lozinka je obavezna']"
        />

        <!-- Gumb za prijavu -->
        <div class="row justify-center q-mt-lg">
          <q-btn
            label="Prijavi se"
            type="submit"
            color="primary"
            class="full-width text-weight-bold"
            size="lg"
          />
        </div>

        <!-- Link za registraciju ako korisnik nema račun -->
        <div class="text-center q-mt-md">
          <span class="text-grey-7">Nemate račun? </span>
          <router-link to="/registracija" class="text-primary text-weight-bold" style="text-decoration: none;">
            Registrirajte se
          </router-link>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()

// Form state
const email = ref('')
const lozinka = ref('')

async function ulogirajSe() {
  const loginData = {
    email: email.value,
    lozinka: lozinka.value
  }

  try {
    const result = await axios.post('http://localhost:3000/api/login', loginData)

    const token = result.data.token
    const uloga = result.data.uloga
    const ime = result.data.ime || ''
    const prezime = result.data.prezime || ''

    // 🚀 SPREMANJE U LOCALSTORAGE (Usklađeno s početnom stranicom)
    if (token) localStorage.setItem('token', token)
    localStorage.setItem('korisnik_uloga', uloga || '')
    localStorage.setItem('korisnik_ime', ime)
    localStorage.setItem('korisnik_prezime', prezime)

    $q.notify({
      type: 'positive',
      message: result.data.message || 'Prijava uspješna!',
      position: 'top',
      timeout: 2000
    })

    // Preusmjeravanje ovisno o ulozi
    if (uloga === 'zdravstveni_radnik') {
      await router.push('/')
    } else if (uloga === 'pacijent') {
      await router.push('/')
    } else {
      await router.push('/')
    }

  } catch (error) {
    console.error('Greška pri prijavi:', error)
    const porukaGreske = error.response?.data?.message || 'Neuspješna prijava.'

    $q.notify({
      type: 'negative',
      message: porukaGreske,
      position: 'top',
      timeout: 4000
    })
  }
}
</script>
