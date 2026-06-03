<template>
  <q-page class="bg-grey-1 flex flex-center">
    <div class="q-pa-md" style="width: 100%; max-width: 450px;">

      <div class="text-center q-mb-lg">
        <div @click="idiNaHome" class="cursor-pointer inline-block q-hoverable">
          <q-icon name="local_hospital" size="80px" color="primary" />
          <div class="text-h5 text-weight-bold text-primary">MediAssist</div>
        </div>

        <q-card v-if="jePrijavljen" flat bordered class="q-mt-md q-pa-sm bg-blue-1 text-primary shadow-1">
          <div class="text-weight-bold text-subtitle1">
            {{ imeIPrezime }}
          </div>
          <div class="text-caption text-uppercase text-weight-medium text-grey-7">
            Uloga: {{ ispisUloge }}
          </div>
        </q-card>
      </div>

      <div v-if="jePrijavljen" class="column q-gutter-y-md">
        <q-btn
          unelevated
          rounded
          color="primary"
          size="lg"
          label="Popis Pacijenata"
          icon="people"
          to="/Pacijenti"
          class="full-width text-weight-bold"
        />

        <q-btn
          unelevated
          rounded
          color="blue-6"
          size="lg"
          label="Unos pacijenta"
          icon="event"
          to="/unospacijenta"
          class="full-width text-weight-bold"
        />

        <q-btn
          unelevated
          rounded
          color="red-5"
          size="lg"
          label="Pregled Mjerenja"
          icon="monitor_heart"
          to="/mjerenja"
          class="full-width text-weight-bold"
        />

        <q-btn
          unelevated
          rounded
          color="green-6"
          size="lg"
          label="Izdaj Recept"
          icon="medication"
          to="/recepti"
          class="full-width text-weight-bold"
        />

        <q-btn
          unelevated
          rounded
          color="grey-6"
          size="lg"
          label="Zakazivanje termina"
          icon="timer"
          to="/termini"
          class="full-width text-weight-bold"
        />

        <q-btn
          unelevated
          rounded
          color="purple-6"
          size="lg"
          label="Tiketi / Upiti"
          icon="support_agent"
          to="/tiketi"
          class="full-width text-weight-bold"
        />
      </div>

      <div class="column q-mt-lg">

        <div v-if="!jePrijavljen" class="column q-gutter-y-sm text-center">
          <p class="text-grey-7 q-mb-xs">Dobrodošli! Molimo prijavite se za pristup sustavu.</p>
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Prijava"
            icon="login"
            to="/loginPage"
            class="full-width"
          />
          <q-btn
            outline
            rounded
            color="primary"
            label="Registracija"
            icon="person_add"
            to="/Registracija"
            class="full-width"
          />
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reaktivna stanja za korisnika
const token = ref(localStorage.getItem('token'))
const korisnikIme = ref(localStorage.getItem('korisnik_ime') || '')
const korisnikPrezime = ref(localStorage.getItem('korisnik_prezime') || '')
const korisnikUloga = ref(localStorage.getItem('korisnik_uloga') || '')

// Provjera je li korisnik prijavljen
const jePrijavljen = computed(() => !!token.value)

// Formatirani ispis imena i uloge
const imeIPrezime = computed(() => {
  return (korisnikIme.value || korisnikPrezime.value)
    ? `${korisnikIme.value} ${korisnikPrezime.value}`
    : 'Ulogirani korisnik'
})

const ispisUloge = computed(() => {
  if (!korisnikUloga.value) return ''
  return korisnikUloga.value.replace('_', ' ')
})

// Funkcija za Home gumb (Tekst MediAssist)
function idiNaHome() {
  router.push('/')
}

// Prilikom učitavanja stranice provjeravamo stanje u localStorage-u
onMounted(() => {
  token.value = localStorage.getItem('token')
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}
.cursor-pointer:hover {
  transform: scale(1.03);
}
</style>
