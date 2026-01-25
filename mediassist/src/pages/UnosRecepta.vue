<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 500px; margin: 0 auto;">
      <q-card flat bordered class="q-pa-md">
        <h5 class="text-primary q-mt-none q-mb-md">Izdavanje Recepta</h5>

        <q-form @submit="pohraniRecept" class="q-gutter-md">
          <q-select
            filled
            v-model="odabraniPacijent"
            :options="pacijentiOpcije"
            label="Pacijent *"
            option-value="ID_Pacijenta"
            :option-label="opt => opt.Ime_pacijent + ' ' + opt.Prezime_pacijenta"
            emit-value
            map-options
          />

          <q-input filled v-model="nazivLijeka" label="Naziv lijeka *" :rules="[val => !!val || 'Naziv je obavezan']" />
          <q-input filled v-model="doziranje" label="Doziranje (npr. 1x1)" />
          <q-input filled v-model="napomena" type="textarea" label="Napomena" />

          <q-btn label="Izdaj recept" type="submit" color="secondary" icon="medication" class="full-width" />
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
const nazivLijeka = ref('')
const doziranje = ref('')
const napomena = ref('')

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/pacijenti')
  pacijentiOpcije.value = res.data
})

async function pohraniRecept() {
  const token = localStorage.getItem('token')
  const podaci = {
    id_pacijent: odabraniPacijent.value,
    naziv_lijeka: nazivLijeka.value,
    doziranje: doziranje.value,
    napomena: napomena.value
  }

  try {
    await axios.post('http://localhost:3000/api/unosrecepta', podaci, {
      headers: { Authorization: `Bearer ${token}` }
    })
    Notify.create({ type: 'positive', message: 'Recept je uspješno spremljen!' })
    // Reset polja
    nazivLijeka.value = doziranje.value = napomena.value = ''; odabraniPacijent.value = null;
  } catch (error) {
    console.error("Greška na serveru:", error.response?.data)
    Notify.create({
      type: 'negative',
      message: 'Greška: ' + (error.response?.data?.detalji || 'Provjeri terminal')
    })
  }
}

</script>
