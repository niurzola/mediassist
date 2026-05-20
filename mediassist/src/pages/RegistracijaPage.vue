<template>
  <q-page padding>
    <q-form @submit.prevent="registrirajSe">
      <q-input label="Ime" v-model="ime" />
      <q-input label="Prezime" v-model="prezime" />
      <q-input label="Email" v-model="email" type="email" />
      <q-input label="Lozinka" v-model="lozinka" type="password" />

      <div class="q-pa-md">
        <div class="text-subtitle2 q-mb-sm">Odaberite ulogu:</div>
        <q-option-group
          v-model="uloga"
          :options="roleOptions"
          color="primary"
          inline
        />
      </div>

      <q-btn label="Registracija" type="submit" color="primary" class="q-mt-md" />
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

// pozivanje $q.notify
const $q = useQuasar()

// Form state
const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')
const uloga = ref('korisnik')

const roleOptions = [
  { label: 'Korisnik', value: 'korisnik' },
  { label: 'Zdravstveni radnik', value: 'admin' },
]

async function registrirajSe() {
  let formData = {
    ime: ime.value,
    prezime: prezime.value,
    email: email.value,
    lozinka: lozinka.value,
    uloga: uloga.value
  }

  try {
    const result = await axios.post('http://localhost:3000/api/registracija', formData)

    $q.notify({
      type: 'positive',
      message: result.data.message || 'Registracija uspješna!',
      position: 'top',
      timeout: 3000
    })

    ime.value = ''
    prezime.value = ''
    email.value = ''
    lozinka.value = ''

  } catch (error) {
    console.error('Greška:', error)

    const porukaGreske = error.response?.data?.message || 'Dogodila se greška na serveru.'

    $q.notify({
      type: 'negative',
      message: porukaGreske,
      position: 'top',
      timeout: 4000
    })
  }
}
</script>
