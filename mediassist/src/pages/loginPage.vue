<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 400px">
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="email"
          label="Email*"
          hint="Unesite vaš email"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Molimo unesite email']"
        />

        <q-input
          filled
          type="password"
          v-model="password"
          label="Lozinka*"
          :rules="[ val => val && val.length > 0 || 'Molimo unesite lozinku']"
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

export default {
  setup () {
    const $q = useQuasar()

    const email = ref(null)
    const password = ref(null)

    return {
      email,
      password,

      async onSubmit () {
        try {
          // Šaljemo podatke na rutu u app.js
          const response = await axios.post('http://localhost:3000/api/login', {
            email: email.value,
            lozinka: password.value
          })

          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Prijava uspješna!'
          })

          // spremanje tokena u localstorage
          console.log('Token:', response.data.token)

        } catch (error) {
          // Ako backend vrati grešku (npr. neispravna lozinka)
          $q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: error.response?.data?.message || 'Neuspješna prijava'
          })
        }
      },

      onReset () {
        email.value = null
        password.value = null
      }
    }
  }
}
</script>
