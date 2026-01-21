<template>
  <q-page padding>
     <div class="q-pa-md" style="max-width: 400px">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="name"
        label="name*"
        hint="Korisničko ime"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        filled
        type="password"
        v-model="password"
        label="lozinka*"
      />


      <div>
        <q-btn label="Potvrdi" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>

  </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
  setup () {
    const $q = useQuasar()
    const router = useRouter()

    const email = ref('')
    const password = ref('')

    const onSubmit = async () => {
      try {
        // Slanje podataka na backend rutu definiranu u app.js
        const response = await axios.post('http://localhost:3000/api/login', {
          email: email.value,
          lozinka: password.value
        })

        // Ako je prijava uspješna (backend vraća poruku i token)
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Prijava uspješna!'
        })

        // Spremanje tokena u local storage
        localStorage.setItem('token', response.data.token)

        // Preusmjeravanje na početnu stranicu nakon prijave
        router.push('/')

      } catch (error) {

        $q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: error.response?.data?.message || 'Greška pri prijavi'
        })
      }
    }

    const onReset = () => {
      email.value = ''
      password.value = ''
    }

    return {
      email,
      password,
      onSubmit,
      onReset
    }
  }
}
</script>
