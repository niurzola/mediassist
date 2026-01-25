<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 500px; margin: 0 auto;">
      <q-card flat bordered class="q-pa-md">
        <h5 class="text-primary q-mt-none q-mb-md">Novi unos mjerenja</h5>

        <q-form @submit="pohraniMjerenje" class="q-gutter-md">
          <q-select
            filled
            v-model="odabraniPacijent"
            :options="pacijentiOpcije"
            label="Odaberi pacijenta *"
            :option-label="opt => opt.Ime_pacijent + ' ' + opt.Prezime_pacijenta"
            :rules="[val => !!val || 'Odabir pacijenta je obavezan']"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input filled v-model.number="tlakGornji" type="number" label="Tlak Gornji" />
            </div>
            <div class="col-6">
              <q-input filled v-model.number="tlakDonji" type="number" label="Tlak Donji" />
            </div>
          </div>

          <q-input filled v-model.number="puls" type="number" label="Puls" />
          <q-input filled v-model.number="temperatura" type="number" step="0.1" label="Temperatura" />

          <q-btn label="Spremi mjerenje" type="submit" color="primary" icon="save" class="full-width" />
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const pacijentiOpcije = ref([])
const odabraniPacijent = ref(null)
const tlakGornji = ref(null)
const tlakDonji = ref(null)
const puls = ref(null)
const temperatura = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/pacijenti')
    pacijentiOpcije.value = res.data
    console.log("Pacijenti učitani:", res.data)
  } catch (err) {
    console.error("Greška pri dohvaćanju pacijenata:", err)
  }
})

async function pohraniMjerenje() {
  console.log("Gumb kliknut. Trenutno odabrani pacijent (v-model):", odabraniPacijent.value)

  // 1. Provjera je li išta odabrano
  if (!odabraniPacijent.value) {
    Notify.create({ type: 'negative', message: 'Niste odabrali pacijenta!' })
    return
  }

  // 2. Izvlačenje ID-a (tražimo bilo koju verziju naziva jer MySQL zna varirati)
  let finalId = null
  if (typeof odabraniPacijent.value === 'object') {
    finalId = odabraniPacijent.value.ID_PACIJENTA || odabraniPacijent.value.id_pacijent || odabraniPacijent.value.ID_Pacijenta
  } else {
    finalId = odabraniPacijent.value // Ako je ipak spremljen samo broj
  }

  console.log("Izvučeni ID pacijenta za slanje:", finalId)

  if (!finalId) {
    Notify.create({ type: 'negative', message: 'Greška: Ne mogu pronaći ID u odabranom pacijentu!' })
    return
  }

  const podaci = {
    id_pacijent: finalId,
    tlak_gornji: tlakGornji.value || 0,
    tlak_donji: tlakDonji.value || 0,
    puls: puls.value || 0,
    temperatura: temperatura.value || 0
  }

  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    const response = await axios.post('http://localhost:3000/api/unosmjerenja', podaci, config)

    if (response.data.success) {
      Notify.create({ type: 'positive', message: 'Uspješno spremljeno!' })
      // Reset forme
      odabraniPacijent.value = null
      tlakGornji.value = tlakDonji.value = puls.value = temperatura.value = null
    }
  } catch (error) {
    console.error("Greška na serveru:", error.response?.data)
    Notify.create({
      type: 'negative',
      message: 'Greška: ' + (error.response?.data?.detalji || 'Provjeri terminal')
    })
  }
}
</script>
