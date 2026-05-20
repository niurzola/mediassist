<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 500px; margin: 0 auto;">
      <q-card flat bordered class="q-pa-md">
      <q-form class="q-gutter-md">
          <h5 class="text-primary q-mt-none q-mb-md">Novi unos termina</h5>
            <q-input filled color="grey-3" v-model="datum" label="Datum" type="date" />
            <q-input filled color="grey-3" v-model="vrijeme" label="Vrijeme" type="time" />
            <q-select filled color="grey-3" v-model="id" :options="options" label="Ime pacijenta" emit-value map-options/>
              <div class="q-pa-lg">
              </div>
                <div class="row justify-center">
                <q-btn label="Submit" type="submit" color="primary" @click="unosTermina()" />
                <q-btn label="Reset" @click="resetInput" color="red" flat class="q-ml-sm" />
                </div>
        </q-form>
        </q-card>
        </div>
        <div class="q-pa-md">
      <div class="row justify-center">
      <q-btn
        label="Prikaži tablicu" 
        color="black"
        @click="prikaziTablicu = !prikaziTablicu"
        class="q-mb-md"
      />
      </div>

      <q-table
        v-if="prikaziTablicu"
        flat
        bordered
        :rows="termini"
        :columns="columns"
        row-key="Datum"
        :wrap-cells="true"
      />
    </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { Notify } from 'quasar'


const datum = ref('')
const vrijeme = ref('')

const id = ref(null)
const options=[{label:'Marko Horvat', value:'1'}, {label:'Noa Iurzola', value:'6'}]

let termini = ref([])
let prikaziTablicu= ref(false)

const columns = [
  { name: 'Datum', label: 'Datum', field: 'Datum', align: 'left' },
  { name: 'Vrijeme', label: 'Vrijeme', field: 'Vrijeme', align: 'left' },
  { name: 'ID_Pacijenta', label: 'ID_Pacijenta', field: 'ID_Pacijenta', align: 'left' }
]

async function unosTermina() {
  let formData = {
    datum: datum.value,
    vrijeme: vrijeme.value,
    id: id.value,
  }

  try {
    const result = await axios.post('http://localhost:3000/api/unosTermina', formData)

    Notify.create({
      type: 'positive',
      message: 'Termin uspješno dodan!'
    })
    console.log(result)
  } 
  catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Neuspješan unos termina!'
    })
    console.log(error)
  }
}
function resetInput(){
  datum.value=''
  vrijeme.value=''
  id.value=''
}

onMounted(() => {
  loadTermini()
})

async function loadTermini() {
  try {
    const result = await axios.get('http://localhost:3000/api/termini')
    termini.value = result.data
  } catch (error) {
    console.error(error)
  }
}

</script>
