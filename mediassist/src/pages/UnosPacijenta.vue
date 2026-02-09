<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 500px; margin: 0 auto;">
      <q-card flat bordered class="q-pa-md">
        <q-form class="q-gutter-md">
          <h5 class="text-primary q-mt-none q-mb-md">Novi unos pacijenta</h5>
          
          <q-input filled color="grey-3" v-model="ime" label="Ime" />
          <q-input filled color="grey-3" v-model="prezime" label="Prezime" />
          <q-input filled color="grey-3" v-model="dob" label="Dob" type="number" />
          
          <div class="q-pa-sm">
            <div class="text-subtitle2 q-mb-xs text-grey-7">Spol:</div>
            <q-option-group 
              v-model="spol" 
              :options="options" 
              color="primary" 
              inline
            />
          </div>

          <div class="row justify-center q-mt-md">
            <q-btn label="Submit" type="submit" color="primary" @click="unosPacijenta()" />
            <q-btn label="Reset" @click="resetInput" color="red" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';
import { Notify } from 'quasar'

const ime = ref('')
const prezime = ref('')
const dob = ref('')
const spol = ref(null)

const options = [
  { label: 'Muško', value: 'M' },
  { label: 'Žensko', value: 'Z' }
]

async function unosPacijenta() {
  if (!ime.value || !prezime.value) {
    Notify.create({ type: 'warning', message: 'Molimo popunite osnovne podatke!' })
    return
  }

  let formData = {
    ime: ime.value,
    prezime: prezime.value,
    dob: dob.value,
    spol: spol.value,
  }

  try {
    const result = await axios.post('http://localhost:3000/api/unospacijenta', formData)
    Notify.create({
      type: 'positive',
      message: 'Pacijent uspješno dodan!'
    })
    resetInput()
    console.log(result)
  } 
  catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Neuspješan unos pacijenta!'
    })
    console.error(error)
  }
}

function resetInput() {
  ime.value = ''
  prezime.value = ''
  spol.value = null
  dob.value = ''
}
</script>