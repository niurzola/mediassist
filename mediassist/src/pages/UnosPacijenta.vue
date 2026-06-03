<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 500px; margin: 0 auto;">
      <q-card flat bordered class="q-pa-md shadow-2">
        <q-form @submit.prevent="unosPacijenta" class="q-gutter-md">
          <h5 class="text-primary text-weight-bold q-mt-none q-mb-md">Novi unos pacijenta</h5>

          <q-input
            filled
            color="primary"
            v-model="ime"
            label="Ime"
            :rules="[val => !!val || 'Ime je obavezno']"
          />
          <q-input
            filled
            color="primary"
            v-model="prezime"
            label="Prezime"
            :rules="[val => !!val || 'Prezime je obavezno']"
          />

          <q-input
            filled
            v-model="dob"
            type="date"
            label="Datum rođenja *"
            stack-label
            :rules="[val => !!val || 'Datum rođenja je obavezan za pacijente']"
          />

          <div class="q-pa-sm bg-grey-2 rounded-borders">
            <div class="text-subtitle2 q-mb-xs text-grey-7">Spol:</div>
            <q-option-group
              v-model="spol"
              :options="options"
              color="primary"
              inline
            />
          </div>

          <div class="row justify-center q-mt-lg">
            <q-btn label="Spremi pacijenta" type="submit" color="primary" class="q-px-md text-weight-bold" />
            <q-btn label="Reset" @click="resetInput" color="red" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const ime = ref('')
const prezime = ref('')
const dob = ref('')
const spol = ref('M')

const options = [
  { label: 'Muško', value: 'M' },
  { label: 'Žensko', value: 'Ž' }
]

async function unosPacijenta() {
  if (!ime.value || !prezime.value || !dob.value) {
    Notify.create({ type: 'warning', message: 'Molimo popunite sva polja!' })
    return
  }

  let formData = {
    ime: ime.value,
    prezime: prezime.value,
    dob: dob.value,
    spol: spol.value,
  }

  const token = localStorage.getItem('token')

  try {
    const result = await axios.post('http://localhost:3000/api/unospacijenta', formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    Notify.create({
      type: 'positive',
      message: 'Pacijent uspješno spremljen u bazu podataka!'
    })

    resetInput()
    console.log("Server response:", result.data)
  }
  catch (error) {
    console.error("Greška pri slanju podataka:", error)
    const porukaGreske = error.response?.data?.message || 'Neuspješan unos pacijenta!'
    Notify.create({
      type: 'negative',
      message: porukaGreske
    })
  }
}

function resetInput() {
  ime.value = ''
  prezime.value = ''
  spol.value = 'M'
  dob.value = ''
}
</script>
