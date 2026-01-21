<template>
  <q-page padding>
    <q-form class="q-gutter-md">
          <q-input color="grey-3" v-model="ime" label="Ime" />
          <q-input color="grey-3" v-model="prezime" label="Prezime" />
          <q-input color="grey-3" v-model="dob" label="Dob" />
            <div class="q-pa-lg">
              <q-option-group v-model="spol" :options="options" color="primary"/>
            </div>
            <div>
              <q-btn label="Submit" type="submit" color="primary" @click="unosPacijenta()" />
              <q-btn label="Reset" @click="resetInput" color="primary" flat class="q-ml-sm" />
            </div>
      </q-form>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';
import { Notify } from 'quasar'


const ime = ref('')
const prezime = ref('')
const dob = ref('')
const spol = ref(null)

const options =[
        {
          label: 'Muško',
          value: 'M'
        },
        {
          label: 'Žensko',
          value: 'Z'
        }]

async function unosPacijenta() {
  let formData = {
    ime: ime.value,
    prezime: prezime.value,
    dob: dob.value,
    spol: spol.value,
  }

  try {
    const result = await axios.post('http://localhost:3000/api/unospacijenta', formData)

    Notify.create({
      type: 'positive',
      message: 'Pacijent uspješno dodan!'
    })
    console.log(result)
  } 
  catch (error) {
    Notify.create({
      type: 'negative',
      message: 'Neuspješan unos pacijenta!'
    })
    console.log(error)
  }
}
function resetInput(){
  ime.value=''
  prezime.value=''
  spol.value=''
  dob.value=''
}

</script>
