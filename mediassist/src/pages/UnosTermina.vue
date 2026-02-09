<template>
  <q-page padding>
    <q-form class="q-gutter-md">
          <q-input color="grey-3" v-model="datum" label="Datum" type="date" />
          <q-input color="grey-3" v-model="vrijeme" label="Vrijeme" type="time" />
          <q-select color="grey-3" v-model="id" :options="options" label="Ime pacijenta" emit-value map-options/>
            <div class="q-pa-lg">
            </div>
            <div>
              <q-btn label="Submit" type="submit" color="primary" @click="unosTermina()" />
              <q-btn label="Reset" @click="resetInput" color="primary" flat class="q-ml-sm" />
            </div>
      </q-form>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';
import { Notify } from 'quasar'


const datum = ref('')
const vrijeme = ref('')

const id = ref(null)
const options=[{label:'Marko Horvat', value:'1'}, {label:'Noa Iurzola', value:'6'}]

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

</script>
