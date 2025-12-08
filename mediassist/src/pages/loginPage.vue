<template>
  <q-page padding>
     <div class="q-pa-md" style="max-width: 400px">

      <q-form>
        <q-input label="Email" v-model="email" type="email"  />
        <q-input label="Lozinka" v-model="lozinka" type="password"  />


      <q-btn label ="Prijava" color="primary" class="q-mt-md" @click="loginUser()"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref("");
const lozinka = ref("");

async function loginUser() {
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      email: email.value,
      lozinka: lozinka.value
    });

    console.log("TOKEN:", res.data.token);

    localStorage.setItem("token", res.data.token);
  }
  catch (error) {
    console.error('Greška pri prijavi:', error);
  }
}
</script>
