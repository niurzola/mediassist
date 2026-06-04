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
          >
            <template v-slot:after>
              <q-btn
                outline
                color="primary"
                icon="tune"
                label="Granice"
                size="md"
                no-caps
                @click="dijagonalGranice = true"
              >
                <q-tooltip>Postavi granice glukoze</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <div v-if="granicaMin !== null && granicaMax !== null" class="text-caption text-grey-7 q-mb-sm">
            ⚠️ Granice: <strong>{{ granicaMin }}</strong> – <strong>{{ granicaMax }}</strong> mmol/L
          </div>

          <q-btn label="Spremi mjerenje" type="submit" color="secondary" icon="save" class="full-width text-weight-bold" />
        </q-form>
      </q-card>

      <q-dialog v-model="dijagonalGranice" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Postavi granice glukoze</div>
          </q-card-section>

          <q-card-section class="q-gutter-md q-mt-sm">
            <q-input
              filled
              v-model.number="granicaMin"
              type="number"
              step="0.1"
              label="Donja granica (mmol/L)"
              :rules="[val => (val !== null && !isNaN(val)) || 'Obavezno']"
            />
            <q-input
              filled
              v-model.number="granicaMax"
              type="number"
              step="0.1"
              label="Gornja granica (mmol/L)"
              :rules="[val => (val !== null && !isNaN(val)) || 'Obavezno']"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Odustani" color="grey-7" v-close-popup />
            <q-btn label="Spremi granice" color="primary" @click="spremiGranice" :loading="spremamGranice" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div v-if="granicaMin !== null && granicaMax !== null && ulogaKorisnika !== 'pacijent'" class="text-caption text-grey-7 q-mb-sm" style="max-width: 500px; margin: 0 auto 8px auto;">
        ⚠️ Granice za odabranog pacijenta: <strong>{{ granicaMin }}</strong> – <strong>{{ granicaMax }}</strong> mmol/L
        <q-btn flat dense round size="sm" color="primary" icon="tune" @click="dijagonalGranice = true" />
      </div>

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
import { ref, onMounted, watch } from 'vue'
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
const granicaMin = ref(null)
const granicaMax = ref(null)
const dijagonalGranice = ref(false)
const spremamGranice = ref(false)
const pacijentId = ref(null)

const columns = [
  { name: 'pacijent', label: 'Pacijent', field: 'ime_prezime_pacijenta', align: 'left', sortable: true },
  { name: 'tlak_gornji', label: 'Tlak Gornji', field: 'tlak_gornji', align: 'center' },
  { name: 'tlak_donji', label: 'Tlak Donji', field: 'tlak_donji', align: 'center' },
  { name: 'puls', label: 'Puls', field: 'puls', align: 'center' },
  { name: 'temperatura', label: 'Temp.', field: 'temperatura', align: 'center' },
  { name: 'vrijednost_glukoze', label: 'Glukoza', field: 'vrijednost_glukoze', align: 'center', sortable: true },
  { name: 'datum', label: 'Datum', field: 'ispis_datuma', align: 'left', sortable: true }
]

watch(odabraniPacijent, (noviId) => {
  pacijentId.value = noviId
  ucitajGranice()
})

onMounted(() => {
  if (ulogaKorisnika.value !== 'pacijent') {
    UcitajPacijenteZaSelect()
  }
  loadMjerenja()
  ucitajGranice()
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

async function ucitajGranice() {
  const tokenLocal = localStorage.getItem('token')
  try {
    let url = 'http://localhost:3000/api/glukoza-granice'
    if (ulogaKorisnika.value !== 'pacijent' && pacijentId.value) {
      url += `?id_pacijent=${pacijentId.value}`
    }
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${tokenLocal}` }
    })
    granicaMin.value = res.data.granica_min_glukoza
    granicaMax.value = res.data.granica_max_glukoza
  } catch {
    // ako nema granica ili greška, ostavi null
  }
}

async function spremiGranice() {
  if (granicaMin.value === null || granicaMax.value === null || isNaN(granicaMin.value) || isNaN(granicaMax.value)) {
    Notify.create({ type: 'negative', message: 'Molimo unesite i donju i gornju granicu.' })
    return
  }
  if (granicaMin.value >= granicaMax.value) {
    Notify.create({ type: 'negative', message: 'Donja granica mora biti manja od gornje.' })
    return
  }
  if (ulogaKorisnika.value !== 'pacijent' && !pacijentId.value) {
    Notify.create({ type: 'negative', message: 'Prvo odaberite pacijenta.' })
    return
  }

  spremamGranice.value = true
  const tokenLocal = localStorage.getItem('token')
  const body = {
    granica_min_glukoza: granicaMin.value,
    granica_max_glukoza: granicaMax.value
  }
  if (ulogaKorisnika.value !== 'pacijent') {
    body.id_pacijent = pacijentId.value
  }
  try {
    await axios.put('http://localhost:3000/api/glukoza-granice', body, {
      headers: { Authorization: `Bearer ${tokenLocal}` }
    })
    Notify.create({ type: 'positive', message: 'Granice glukoze su spremljene!' })
    dijagonalGranice.value = false
    ucitajGranice()
  } catch (err) {
    const poruka = err.response?.data?.message || 'Greška pri spremanju granica.'
    Notify.create({ type: 'negative', message: poruka })
  } finally {
    spremamGranice.value = false
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
      if (response.data.upozorenje) {
        Notify.create({ type: 'warning', message: response.data.poruka, position: 'top', timeout: 0, actions: [{ label: 'OK', color: 'white', handler: () => {} }] })
      } else {
        Notify.create({ type: 'positive', message: 'Mjerenje uspješno spremljeno!' })
      }
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
