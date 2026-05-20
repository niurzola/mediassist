<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 400px">
      <!-- Added .prevent modifier to form submission -->
      <q-form @submit.prevent="onSubmit" @reset="onReset" class="q-gutter-md">
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
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup () {
    const $q = useQuasar()
    const router = useRouter()

    const email = ref(null)
    const password = ref(null)

    return {
      email,
      password,

      async onSubmit () {
        try {
          const response = await axios.post('http://localhost:3000/api/login', {
            email: email.value,
            lozinka: password.value
          });

          // token i user_role to localStorage
          localStorage.setItem('token', response.data.token)

          localStorage.setItem('user_role', response.data.uloga)

          console.log('Prijava uspješna. Uloga:', response.data.uloga)

          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Prijava uspješna!'
          })

          // 4. Redirect based on role
          if (response.data.uloga === 'zdravstveni_radnik') {
            router.push('/pregled-pacijenta')
          } else {
            router.push('/') // Send users to index homepage
          }

        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user_role')

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
