<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md" style="max-width: 900px; margin: 0 auto;">

      <div v-if="korisnikUloga === 'pacijent'">
        <q-card flat bordered class="q-pa-md shadow-2 bg-white q-mb-xl">
          <h5 class="text-primary text-weight-bold q-mt-none q-mb-md row items-center">
            <q-icon name="add_circle" class="q-mr-sm" />
            Novi upit / tiket
          </h5>

          <q-form @submit.prevent="kreirajTiket" class="q-gutter-md">
            <q-input
              filled
              v-model="naslovUpita"
              label="Naslov upita *"
              :rules="[val => !!val || 'Naslov je obavezan']"
            />
            <q-input
              filled
              v-model="tekstPoruke"
              type="textarea"
              label="Opis problema / poruka *"
              :rules="[val => !!val || 'Poruka je obavezna']"
            />
            <q-btn label="Pošalji upit" type="submit" color="primary" icon="send" class="full-width text-weight-bold" />
          </q-form>
        </q-card>
      </div>

      <div class="row items-center q-mb-md text-primary">
        <q-icon name="support_agent" size="28px" class="q-mr-xs" />
        <h6 class="q-my-none text-weight-bold">
          {{ korisnikUloga === 'pacijent' ? 'Moji upiti' : 'Svi upiti (tiketi)' }}
        </h6>
      </div>

      <div v-if="tiketi.length === 0" class="text-center q-pa-lg bg-white shadow-1 rounded-borders">
        <q-icon name="inbox" size="60px" color="grey-4" />
        <p class="text-grey-7 q-mt-md">Nema otvorenih tiketa.</p>
      </div>

      <q-table
        v-else
        flat
        bordered
        :rows="tiketi"
        :columns="kolone"
        row-key="id_tiketa"
        @row-click="otvoriTiket"
        :loading="loading"
        :no-data-label="'Nema tiketa'"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        class="clickable-rows"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="bojaStatusa(props.value)"
              text-color="white"
              size="sm"
              icon="circle"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="dijalogOtvoren" full-width position="right">
        <q-card class="dijalog-tiket" style="width: 700px; max-width: 90vw;">
          <q-card-section class="bg-primary text-white q-py-sm row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">
              {{ odabraniTiket?.naslov_upita }}
            </div>
            <div class="row items-center q-gutter-x-sm">
              <q-chip :color="bojaStatusa(odabraniTiket?.status)" text-color="white" dense>
                {{ odabraniTiket?.status }}
              </q-chip>
              <q-btn flat dense icon="close" v-close-popup />
            </div>
          </q-card-section>

          <q-card-section v-if="korisnikUloga === 'zdravstveni_radnik'" class="bg-grey-2 q-py-sm">
            <div class="row items-center q-gutter-x-sm">
              <span class="text-grey-8 text-weight-medium">Status:</span>
              <q-select
                dense
                outlined
                v-model="odabraniStatus"
                :options="statusOpcije"
                class="inline-block"
                style="min-width: 150px;"
                @update:model-value="azurirajStatus"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-sm bg-grey-3 text-caption text-grey-7 row justify-between">
            <span><strong>Autor:</strong> {{ odabraniTiket?.autor }}</span>
            <span><strong>Kreirano:</strong> {{ odabraniTiket?.vrijeme_kreiranja_ispis }}</span>
          </q-card-section>

          <q-separator />

          <q-card-section class="poruke-container" style="max-height: 50vh; overflow-y: auto;">
            <div v-if="poruke.length === 0" class="text-center q-pa-lg text-grey-5">
              <q-icon name="chat" size="40px" />
              <p>Nema poruka u ovom tiketu.</p>
            </div>

            <div v-for="poruka in poruke" :key="poruka.id_poruke" class="q-mb-md">
              <div class="row items-baseline q-gutter-x-sm q-mb-xs">
                <span class="text-weight-bold text-primary text-body2">{{ poruka.autor }}</span>
                <span class="text-caption text-grey-6">{{ poruka.vrijeme_slanja_ispis }}</span>
              </div>
              <div class="bg-grey-2 q-pa-sm rounded-borders text-body2" style="white-space: pre-wrap;">
                {{ poruka.tekst_poruke }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="odabraniTiket?.status !== 'ZATVORENO'">
            <q-form @submit.prevent="posaljiPoruku" class="row items-end q-gutter-x-sm">
              <q-input
                v-model="novaPoruka"
                filled
                type="textarea"
                label="Odgovori..."
                class="col"
                :rules="[val => !!val || 'Unesite poruku']"
                @keydown.enter.exact.prevent="posaljiPoruku"
              />
              <q-btn label="Pošalji" type="submit" color="primary" icon="send" round />
            </q-form>
          </q-card-section>

          <q-card-section v-else class="text-center text-grey-6 bg-grey-2">
            <q-icon name="lock" /> Tiket je zatvoren. Nije moguće dodavati poruke.
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const korisnikUloga = ref(localStorage.getItem('korisnik_uloga') || '')

const tiketi = ref([])
const poruke = ref([])
const loading = ref(false)

const naslovUpita = ref('')
const tekstPoruke = ref('')

const dijalogOtvoren = ref(false)
const odabraniTiket = ref(null)
const novaPoruka = ref('')
const odabraniStatus = ref(null)
const statusOpcije = ['OTVORENO', 'U OBRADI', 'ZATVORENO']

const kolone = [
  { name: 'naslov_upita', label: 'Naslov upita', field: 'naslov_upita', align: 'left', sortable: true },
  { name: 'autor', label: 'Autor', field: 'autor', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'vrijeme_kreiranja_ispis', label: 'Datum', field: 'vrijeme_kreiranja_ispis', align: 'center', sortable: true },
  { name: 'broj_poruka', label: 'Poruke', field: 'broj_poruka', align: 'center' },
]

function bojaStatusa(status) {
  if (!status) return 'grey'
  if (status === 'OTVORENO') return 'green'
  if (status === 'U OBRADI') return 'orange'
  if (status === 'ZATVORENO') return 'grey-6'
  return 'grey'
}

async function dohvatiTikete() {
  const token = localStorage.getItem('token')
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/tiketi', {
      headers: { Authorization: `Bearer ${token}` }
    })
    tiketi.value = res.data
  } catch (error) {
    console.error('Greška pri dohvaćanju tiketa:', error)
    Notify.create({ type: 'negative', message: 'Nije moguće učitati tikete.' })
  } finally {
    loading.value = false
  }
}

async function kreirajTiket() {
  if (!naslovUpita.value || !tekstPoruke.value) {
    Notify.create({ type: 'warning', message: 'Naslov i poruka su obavezni.' })
    return
  }

  const token = localStorage.getItem('token')
  try {
    await axios.post('http://localhost:3000/api/tiketi', {
      naslov_upita: naslovUpita.value,
      tekst_poruke: tekstPoruke.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    Notify.create({ type: 'positive', message: 'Tiket uspješno kreiran!' })
    naslovUpita.value = ''
    tekstPoruke.value = ''
    dohvatiTikete()
  } catch (error) {
    console.error('Greška pri kreiranju tiketa:', error)
    Notify.create({ type: 'negative', message: error.response?.data?.message || 'Greška pri kreiranju tiketa.' })
  }
}

async function otvoriTiket(evt, row) {
  odabraniTiket.value = row
  odabraniStatus.value = row.status
  novaPoruka.value = ''
  dijalogOtvoren.value = true

  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`http://localhost:3000/api/tiketi/${row.id_tiketa}/poruke`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    poruke.value = res.data
  } catch (error) {
    console.error('Greška pri dohvaćanju poruka:', error)
    Notify.create({ type: 'negative', message: 'Nije moguće učitati poruke.' })
  }
}

async function posaljiPoruku() {
  if (!novaPoruka.value || !novaPoruka.value.trim()) return

  const token = localStorage.getItem('token')
  try {
    await axios.post(`http://localhost:3000/api/tiketi/${odabraniTiket.value.id_tiketa}/poruke`, {
      tekst_poruke: novaPoruka.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    Notify.create({ type: 'positive', message: 'Poruka poslana!' })
    novaPoruka.value = ''

    const res = await axios.get(`http://localhost:3000/api/tiketi/${odabraniTiket.value.id_tiketa}/poruke`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    poruke.value = res.data
    dohvatiTikete()
  } catch (error) {
    console.error('Greška pri slanju poruke:', error)
    Notify.create({ type: 'negative', message: error.response?.data?.message || 'Greška pri slanju poruke.' })
  }
}

async function azurirajStatus(noviStatus) {
  const token = localStorage.getItem('token')
  try {
    await axios.put(`http://localhost:3000/api/tiketi/${odabraniTiket.value.id_tiketa}/status`, {
      status: noviStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    Notify.create({ type: 'positive', message: `Status promijenjen u "${noviStatus}".` })
    odabraniTiket.value.status = noviStatus
    dohvatiTikete()
  } catch (error) {
    console.error('Greška pri promjeni statusa:', error)
    Notify.create({ type: 'negative', message: error.response?.data?.message || 'Greška pri promjeni statusa.' })
  }
}

onMounted(() => {
  dohvatiTikete()
})
</script>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
.clickable-rows :deep(tbody tr:hover) {
  background-color: #f5f5f5;
}
.dijalog-tiket .poruke-container {
  scroll-behavior: smooth;
}
</style>
