<template>
  <q-page padding>
    <div class="q-pa-md">

      <q-btn 
        label="Prikaži tablicu" 
        color="primary"
        @click="prikaziTablicu = !prikaziTablicu"
        class="q-mb-md"
      />

      <q-table
        v-if="prikaziTablicu"
        flat
        bordered
        :rows="pacijenti"
        :columns="columns"
        row-key="ID_PACIJENTA"
        :wrap-cells="true"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';

let pacijenti = ref([])
let prikaziTablicu= ref(false)

const columns = [
  { name: 'ID_Pacijenta', label: 'ID', field: 'ID_PACIJENTA', align: 'left' },
  { name: 'Ime_pacijent', label: 'Ime', field: 'Ime_pacijent', align: 'left' },
  { name: 'Prezime_pacijent', label: 'Prezime', field: 'Prezime_pacijent', align: 'left' },
  { name: 'DOB_Pacijent', label: 'Dob', field: 'DOB_Pacijent', align: 'left' },
  { name: 'Spol_pacijent', label: 'Spol', field: 'Spol_pacijent', align: 'left' }
]

onMounted(() => {
  loadPacijenti()
})

async function loadPacijenti() {
  try {
    const result = await axios.get('http://localhost:3000/api/pacijenti')
    pacijenti.value = result.data
  } catch (error) {
    console.error(error)
  }
}
</script>
