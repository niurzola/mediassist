<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md style-kontejner">

      <q-card v-if="korisnikUloga === 'pacijent'" flat bordered class="q-pa-md shadow-2 bg-white q-mb-xl">
        <h5 class="text-primary text-weight-bold q-mt-none q-mb-md row items-center">
          <q-icon name="edit_calendar" class="q-mr-sm" />
          Rezervacija novog termina
        </h5>

        <q-form @submit.prevent="pohraniTermin" class="q-gutter-md">
          <q-input filled v-model="datum" label="Datum *" type="date" :rules="[val => !!val || 'Datum je obavezan']" />

          <q-input filled v-model="vrijeme" label="Vrijeme *" type="time" :rules="[val => !!val || 'Vrijeme je obavezno']" />

          <q-btn label="Rezerviraj termin" type="submit" color="primary" icon="check" class="full-width text-weight-bold" />
        </q-form>
      </q-card>

      <div>
        <div class="row items-center q-mb-lg text-primary">
          <q-icon :name="korisnikUloga === 'zdravstveni_radnik' ? 'calendar_month' : 'schedule'" size="36px" class="q-mr-sm" />
          <h5 class="q-my-none text-weight-bold">
            {{ korisnikUloga === 'zdravstveni_radnik' ? 'Raspored svih termina' : 'Moji naručeni termini' }}
          </h5>
        </div>

        <div v-if="termini.length === 0" class="text-center q-pa-xl bg-white shadow-1 rounded-borders bordered">
          <q-icon name="event_busy" size="60px" color="grey-5" />
          <p class="text-grey-7 q-mt-md text-subtitle1">Trenutno nema zakazanih termina.</p>
        </div>

        <div v-else class="column q-gutter-y-sm">
          <q-card v-for="termin in termini" :key="termin.ID_Termina" flat bordered class="termin-card">
            <q-card-section class="row items-center justify-between q-py-md">

              <div class="row items-center q-gutter-x-md">
                <q-chip square color="primary" text-color="white" icon="event" class="text-weight-bold">
                  {{ termin.datum_ispis }}
                </q-chip>
                <q-chip square outline color="secondary" icon="access_time" class="text-weight-bold">
                  {{ termin.vrijeme_ispis }} ugh
                </q-chip>
              </div>

              <div class="text-subtitle1 text-weight-medium text-grey-9">
                <q-icon name="person" color="grey-6" class="q-mr-xs" />
                Pacijent: <span class="text-primary text-weight-bold">{{ termin.ime_prezime_pacijenta }}</span>
              </div>

            </q-card-section>
          </q-card>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

// Uloga iz localStorage-a
const korisnikUloga = ref(localStorage.getItem('korisnik_uloga') || '')

// Reaktivne varijable za formu
const datum = ref('')
const vrijeme = ref('')

// Popis termina s backenda
const termini = ref([])

// Funkcija za dohvaćanje termina (pokreće se odmah za oba korisnika)
async function dohvatiTermine() {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get('http://localhost:3000/api/termini', {
      headers: { Authorization: `Bearer ${token}` }
    })
    termini.value = res.data
  } catch (error) {
    console.error("Greška pri dohvaćanju termina:", error)
    Notify.create({ type: 'negative', message: 'Nije moguće učitati termine.' })
  }
}

onMounted(() => {
  dohvatiTermine()
})

// Slanje novog termina u bazu (Samo pacijent)
async function pohraniTermin() {
  const token = localStorage.getItem('token')
  const podaci = {
    datum: datum.value,
    vrijeme: vrijeme.value
  }

  try {
    await axios.post('http://localhost:3000/api/unostermina', podaci, {
      headers: { Authorization: `Bearer ${token}` }
    })
    Notify.create({ type: 'positive', message: 'Termin uspješno zakazan!' })

    // Reset polja forme
    datum.value = ''
    vrijeme.value = ''

    // Ponovno osvježi popis dolje da se vidi novi termin
    dohvatiTermine()
  } catch (error) {
    console.error("Greška na serveru pri unosu termina:", error)
    Notify.create({
      type: 'negative',
      message: 'Greška pri zakazivanju: ' + (error.response?.data?.message || 'Provjeri terminal')
    })
  }
}
</script>

<style scoped>
.style-kontejner {
  max-width: 700px;
  margin: 0 auto;
}
.termin-card {
  background-color: white;
  border-left: 5px solid #2196F3; /* Plava crta s lijeve strane za ljepši izgled */
  transition: transform 0.2s;
}
.termin-card:hover {
  transform: translateX(3px);
}
</style>
