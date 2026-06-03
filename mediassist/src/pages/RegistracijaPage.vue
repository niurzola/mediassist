<template>
  <q-page padding class="flex flex-center">
    <q-card flat bordered class="q-pa-md shadow-2" style="width: 100%; max-width: 450px;">
      <h5 class="text-primary text-center text-weight-bold q-mt-none q-mb-md">Registracija Korisnika</h5>

      <q-form @submit.prevent="izvrsiRegistraciju" class="q-gutter-md">

        <q-select
          filled
          v-model="forma.uloga"
          :options="ulogeOpcije"
          emit-value
          map-options
          label="Registriram se kao *"
          :rules="[val => !!val || 'Odabir uloge je obavezan']"
        />

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input filled v-model="forma.ime" label="Ime *" :rules="[val => !!val || 'Ime je obavezno']" />
          </div>
          <div class="col-6">
            <q-input filled v-model="forma.prezime" label="Prezime *" :rules="[val => !!val || 'Prezime je obavezno']" />
          </div>
        </div>

        <q-input
          filled
          v-model="forma.email"
          type="email"
          label="E-mail adresa *"
          :rules="[
            val => !!val || 'Email je obavezan',
            val => /.+@.+\..+/.test(val) || 'Unesite ispravnu e-mail adresu (npr. ime@domena.com)'
          ]"
        />
        <q-input filled v-model="forma.lozinka" type="password" label="Lozinka *" :rules="[val => !!val || 'Lozinka je obavezna', val => val.length >= 6 || 'Lozinka mora imati najmanje 6 znakova']" />

        <div v-if="forma.uloga === 'pacijent'" class="q-gutter-md q-pt-none">
          <q-input
            filled
            v-model="forma.dob"
            type="date"
            label="Datum rođenja *"
            stack-label
            :rules="[val => !!val || 'Datum rođenja je obavezan za pacijente']"
          />

          <q-select
            filled
            v-model="forma.spol"
            :options="['M', 'Ž']"
            label="Spol *"
            :rules="[val => !!val || 'Odabir spola je obavezan za pacijente']"
          />
        </div>

        <q-btn label="Registriraj se" type="submit" color="primary" class="full-width text-weight-bold q-mt-md" />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'

const router = useRouter()

const ulogeOpcije = [
  { label: 'Zdravstveni radnik / Liječnik', value: 'zdravstveni_radnik' },
  { label: 'Pacijent', value: 'pacijent' }
]

const forma = ref({
  ime: '',
  prezime: '',
  email: '',
  lozinka: '',
  uloga: 'pacijent', // zadana vrijednost na početku
  dob: '',
  spol: ''
})

async function izvrsiRegistraciju() {
  try {
    // Pripremamo objekt za slanje. Ako nije pacijent, dob i spol šaljemo kao null
    const slanjePodataka = {
      ime: forma.value.ime,
      prezime: forma.value.prezime,
      email: forma.value.email,
      lozinka: forma.value.lozinka,
      uloga: forma.value.uloga,
      dob: forma.value.uloga === 'pacijent' ? forma.value.dob : null,
      spol: forma.value.uloga === 'pacijent' ? forma.value.spol : null
    }

    const response = await axios.post('http://localhost:3000/api/registracija', slanjePodataka)

    Notify.create({ type: 'positive', message: response.data.message || 'Registracija uspješna!' })
    router.push('/loginPage') // Preusmjeri na login nakon uspjeha
  } catch (error) {
    console.error("Greška pri registraciji:", error.response?.data)
    Notify.create({
      type: 'negative',
      message: 'Greška: ' + (error.response?.data?.detalji || 'Neuspjela registracija.')
    })
  }
}
</script>
