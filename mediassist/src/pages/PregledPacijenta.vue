<template>
  <q-page padding>
    <div class="q-pa-md">
      <h5 class="text-primary text-weight-bold q-mt-none q-mb-md">Pregled evidentiranih pacijenata</h5>

      <q-btn
        :label="prikaziTablicu ? 'Sakrij tablicu pacijenata' : 'Prikaži tablicu pacijenata'"
        color="primary"
        @click="prikaziTablicu = !prikaziTablicu"
        class="q-mb-md text-weight-bold"
      />

      <q-table
        v-if="prikaziTablicu"
        flat
        bordered
        :rows="pacijenti"
        :columns="columns"
        row-key="id_pacijenta"
        :wrap-cells="true"
        class="shadow-2"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const prikaziTablicu = ref(true) // Postavljeno na true da se tablica odmah vidi kad se povuku podaci
const pacijenti = ref([])

const columns = [
  {
    name: 'id_pacijenta',
    label: 'ID',
    field: 'ID_Pacijenta',
    align: 'left',
    sortable: true
  },
  {
    name: 'Ime_pacijent',
    label: 'Ime',
    field: 'Ime_pacijent',
    align: 'left',
    sortable: true
  },
  {
    name: 'Prezime_pacijenta',
    label: 'Prezime',
    field: 'Prezime_pacijenta',
    align: 'left',
    sortable: true
  },
  {
    name: 'DOB_Pacijent',
    label: 'Dob / Godine',
    field: 'DOB_Pacijent',
    align: 'left'
  },
  {
    name: 'Spol_pacijent',
    label: 'Spol',
    field: 'Spol_pacijent',
    align: 'center'
  }
]

// Funkcija koja povlači pacijente s backend servera
async function loadPacijenti() {
  const token = localStorage.getItem('token')

  try {
    const result = await axios.get('http://localhost:3000/api/pacijenti', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    pacijenti.value = result.data
    console.log("Učitani pacijenti:", result.data)

  } catch (error) {
    console.error("Greška pri dohvaćanju pacijenata:", error)

    const porukaGreske = error.response?.data?.message || 'Nemate ovlasti ili se dogodila greška na serveru.'

    Notify.create({
      type: 'negative',
      message: porukaGreske,
      position: 'top'
    })
  }
}

onMounted(() => {
  loadPacijenti()
})
</script>
