<template>
  <q-page padding>
    <q-form>
      <q-input label="Ime" v-model="ime" />
      <q-input label="Prezime" v-model="prezime" />
      <q-input label="Email" v-model="email" type="email" />
      <q-input label="Lozinka" v-model="lozinka" type="password" />
      <q-btn label="Registracija" @click="registrirajSe()" color="primary" class="q-mt-md" />
    </q-form>
  </q-page>


</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';

const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')

async function registrirajSe() {
  let formData = {
    ime: ime.value,
    prezime: prezime.value,
    email: email.value,
    lozinka: lozinka.value
  }

  try {
    const result = await axios.post('http://localhost:3000/api/registracija', formData)
    console.log(result)
  }
  catch (error) {
    console.error('Greška pri registraciji:', error)
  }
}

</script>
