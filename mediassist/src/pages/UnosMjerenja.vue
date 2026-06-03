<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 900px; margin: 0 auto;">

      <q-card v-if="ulogaKorisnika === 'pacijent'" flat bordered class="q-pa-md shadow-2 q-mb-xl" style="max-width: 500px; margin: 0 auto 40px auto;">
        <h5 class="text-primary text-weight-bold q-mt-none q-mb-md">
          Moje novo mjerenje
        </h5>

        <q-form @submit.prevent="pohraniMjerenje" class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input filled v-model.number="tlakGornji" type="number" label="Tlak Gornji (mmHg)" />
            </div>
            <div class="col-6">
              <q-input filled v-model.number="tlakDonji" type="number" label="Tlak Donji (mmHg)" />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input filled v-model.number="puls" type="number" label="Puls (bpm)" />
            </div>
            <div class="col-6">
              <q-input filled v-model.number="temperatura" type="number" step="0.1" label="Temperatura (°C)" />
            </div>
          </div>

          <q-input
            filled
            v-model.number="vrijednostGlukoze"
            type="number"
            step="0.1"
            label="Razina glukoze (mmol/L)"
          />

          <q-btn label="Spremi mjerenje" type="submit" color="secondary" icon="save" class="full-width text-weight-bold" />
        </q-form>
      </q-card>

      <div class="row items-center q-mb-md">
        <q-icon
          :name="ulogaKorisnika === 'pacijent' ? 'history' : 'assignment'"
          size="md"
          color="primary"
          class="q-mr-sm"
        />
        <h5 class="text-weight-bold q-my-none text-dark">
          {{ ulogaKorisnika === 'pacijent' ? 'Povijest mojih mjerenja' : 'Nadzorna ploča: Pregled mjerenja pacijenata' }}
        </h5>
      </div>

      <q-table
        flat
        bordered
        :rows="mjerenja"
        :columns="columns"
        row-key="id_mjerenja"
        :wrap-cells="true"
        class="shadow-1"
      />

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

// Dekodiranje uloge iz JWT tokena pomoću ugrađene JS funkcije
const token = localStorage.getItem('token')
let ulogaKorisnika = ref('pacijent')

if (token) {
  try {
    const baza64Url = token.split('.')[1]
    const baza64 = baza64Url.replace(/-/g, '+').replace(/_/g, '/')
    const dekodiraniToken = JSON.parse(window.atob(baza64))
    ulogaKorisnika.value = dekodiraniToken.uloga || 'pacijent'
  } catch (e) {
    console.error("Greška pri čitanju tokena:", e)
  }
}

const pacijentiOpcije = ref([])
const odabraniPacijent = ref(null)
const tlakGornji = ref(null)
const tlakDonji = ref(null)
const puls = ref(null)
const temperatura = ref(null)
const vrijednostGlukoze = ref(null)
const mjerenja = ref([])

const columns = [
  { name: 'pacijent', label: 'Pacijent', field: 'ime_prezime_pacijenta', align: 'left', sortable: true },
  { name: 'tlak_gornji', label: 'Tlak Gornji', field: 'tlak_gornji', align: 'center' },
  { name: 'tlak_donji', label: 'Tlak Donji', field: 'tlak_donji', align: 'center' },
  { name: 'puls', label: 'Puls', field: 'puls', align: 'center' },
  { name: 'temperatura', label: 'Temp.', field: 'temperatura', align: 'center' },
  { name: 'vrijednost_glukoze', label: 'Glukoza', field: 'vrijednost_glukoze', align: 'center', sortable: true },
  { name: 'datum', label: 'Datum', field: 'ispis_datuma', align: 'left', sortable: true }
]

onMounted(() => {
  // Liječnik treba popis pacijenata za padajući izbornik, pacijent ne treba
  if (ulogaKorisnika.value !== 'pacijent') {
    UcitajPacijenteZaSelect()
  }
  loadMjerenja()
})

async function UcitajPacijenteZaSelect() {
  try {
    const res = await axios.get('http://localhost:3000/api/pacijenti', {
      headers: { Authorization: `Bearer ${token}` }
    })
    pacijentiOpcije.value = res.data
  } catch (err) {
    console.error("Greška pri dohvaćanju pacijenata:", err)
  }
}

async function loadMjerenja() {
  try {
    const result = await axios.get('http://localhost:3000/api/svaMjerenja', {
      headers: { Authorization: `Bearer ${token}` }
    })
    mjerenja.value = result.data
  } catch (error) {
    console.error("Greška pri dohvaćanju mjerenja:", error)
  }
}

async function pohraniMjerenje() {
  // Ako je ulogiran liječnik, provjeravamo je li odabrao pacijenta iz liste
  if (ulogaKorisnika.value !== 'pacijent' && !odabraniPacijent.value) {
    Notify.create({ type: 'negative', message: 'Morate odabrati pacijenta!' })
    return
  }

  const podaci = {
    // Ako je pacijent, šaljemo null jer će backend sam izvući njegov ID iz tokena!
    id_pacijent: ulogaKorisnika.value === 'pacijent' ? null : odabraniPacijent.value,
    tlak_gornji: tlakGornji.value || 0,
    tlak_donji: tlakDonji.value || 0,
    puls: puls.value || 0,
    temperatura: temperatura.value || 0,
    vrijednost_glukoze: vrijednostGlukoze.value || 0
  }

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.post('http://localhost:3000/api/unosmjerenja', podaci, config)

    if (response.data.success) {
      Notify.create({ type: 'positive', message: 'Mjerenje uspješno spremljeno!' })
      tlakGornji.value = tlakDonji.value = puls.value = temperatura.value = vrijednostGlukoze.value = null
      odabraniPacijent.value = null
      loadMjerenja()
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Greška pri spremanju mjerenja.' })
    console.error("Greška pri spremanju mjerenja:", error)
  }
}
</script>
