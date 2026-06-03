<template>
  <q-page padding class="bg-grey-1">
    <div class="q-pa-md style-kontejner">

      <div v-if="korisnikUloga === 'zdravstveni_radnik'">

        <q-card flat bordered class="q-pa-md shadow-2 bg-white q-mb-xl">
          <h5 class="text-primary text-weight-bold q-mt-none q-mb-md row items-center">
            <q-icon name="medication" class="q-mr-sm" />
            Izdavanje / Produljivanje Recepta
          </h5>

          <q-form @submit.prevent="pohraniRecept" class="q-gutter-md">
            <q-select
              filled
              v-model="odabraniPacijent"
              :options="pacijentiOpcije"
              label="Pacijent *"
              option-value="ID_Pacijenta"
              :option-label="opt => {
                if (!opt) return '';
                const ime = opt.Ime_pacijent || opt.Ime_pacijenta || '';
                const prezime = opt.Prezime_pacijenta || opt.Prezime_pacijent || '';
                return `${ime} ${prezime}`.trim() || 'Nepoznat pacijent';
              }"
              emit-value
              map-options
              :rules="[val => !!val || 'Odabir pacijenta je obavezan']"
            />

            <q-input filled v-model="nazivLijeka" label="Naziv lijeka *" :rules="[val => !!val || 'Naziv je obavezan']" />
            <q-input filled v-model="doziranje" label="Doziranje (npr. 1x1)" />
            <q-input filled v-model="napomena" type="textarea" label="Napomena / Upute" />

            <q-btn label="Izdaj recept" type="submit" color="secondary" icon="add_task" class="full-width text-weight-bold" />
          </q-form>
        </q-card>

        <div>
          <div class="row items-center q-mb-md text-primary">
            <q-icon name="history" size="28px" class="q-mr-xs" />
            <h6 class="q-my-none text-weight-bold">Povijest svih izdanih recepata</h6>
          </div>

          <div v-if="mojiRecepti.length === 0" class="text-center q-pa-lg bg-white shadow-1 rounded-borders">
            <p class="text-grey-7 q-my-none">Nema prethodno izdanih recepata u sustavu.</p>
          </div>

          <div v-else class="column q-gutter-y-sm">
            <q-card v-for="recept in mojiRecepti" :key="recept.ID_RECEPTA" flat bordered class="bg-white">
              <q-card-section class="row items-center justify-between q-py-sm bg-grey-2">
                <div class="text-weight-bold text-primary">
                  {{ recept.naziv_lijeka }} <span class="text-grey-8 text-weight-regular"> za </span> {{ recept.ime_pacijenta }}
                </div>
                <div class="text-caption text-grey-7">Izdan: {{ recept.datum_ispis }}</div>
              </q-card-section>

              <q-card-section class="row justify-between items-center q-py-sm">
                <div>
                  <div class="text-body2"><strong>Doza:</strong> {{ recept.doza_lijeka || 'Nije navedeno' }}</div>
                  <div class="text-caption text-italic text-grey-7" v-if="recept.upute">"{{ recept.upute }}"</div>
                  <div class="text-caption text-grey-5">Izdao/la: {{ recept.ime_lijecnika }}</div>
                </div>

                <q-btn
                  flat
                  round
                  color="primary"
                  icon="autorenew"
                  @click="pripremiZaProduljivanje(recept)"
                >
                  <q-tooltip>Produlji ovaj recept (kopiraj u formu)</q-tooltip>
                </q-btn>
              </q-card-section>
            </q-card>
          </div>
        </div>

      </div>

      <div v-else-if="korisnikUloga === 'pacijent'">
        <div class="row items-center q-mb-lg text-primary">
          <q-icon name="receipt_long" size="36px" class="q-mr-sm" />
          <h5 class="q-my-none text-weight-bold">Moji Propisani Recepti</h5>
        </div>

        <div v-if="mojiRecepti.length === 0" class="text-center q-pa-xl bg-white shadow-1 rounded-borders bordered">
          <q-icon name="sentiment_dissatisfied" size="60px" color="grey-5" />
          <p class="text-grey-7 q-mt-md text-subtitle1">Trenutno nemate propisanih recepata.</p>
        </div>

        <div v-else class="column q-gutter-y-md">
          <q-card v-for="recept in mojiRecepti" :key="recept.ID_RECEPTA" flat bordered class="shadow-1 prescription-card">
            <q-card-section class="bg-blue-1 text-primary row justify-between items-center q-py-sm">
              <div class="text-weight-bold text-subtitle1 row items-center">
                <q-icon name="pill" class="q-mr-xs" />
                {{ recept.naziv_lijeka }}
              </div>
              <q-chip outline color="primary" icon="event" size="sm">
                Izdan: {{ recept.datum_ispis }}
              </q-chip>
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <div class="q-mb-xs">
                <span class="text-weight-bold text-grey-8">Doziranje:</span>
                <span class="text-body1 text-secondary text-weight-medium q-ml-xs">{{ recept.doza_lijeka || 'Nije definirano' }}</span>
              </div>

              <div v-if="recept.upute" class="q-mt-sm bg-grey-2 q-pa-sm rounded-borders text-italic text-grey-9">
                <span class="text-weight-bold text-grey-8 not-italic block q-mb-xs">Upute / Napomena:</span>
                "{{ recept.upute }}"
              </div>

              <div class="q-mt-md text-caption text-grey-6 row items-center">
                <q-icon name="person" class="q-mr-xs" />
                Liječnik: {{ recept.ime_lijecnika || 'Nepoznat liječnik' }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-else class="text-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md text-grey-7">Provjera autorizacije i učitavanje...</p>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const korisnikUloga = ref(localStorage.getItem('korisnik_uloga') || '')

const pacijentiOpcije = ref([])
const odabraniPacijent = ref(null)
const nazivLijeka = ref('')
const doziranje = ref('')
const napomena = ref('')

// Zajednički reaktivni niz za recepte (Puni se s iste rute ovisno o ulozi)
const mojiRecepti = ref([])

//funkcija za dohvaćanje recepata
async function dohvatiRecepte() {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get('http://localhost:3000/api/mojiRecepti', {
      headers: { Authorization: `Bearer ${token}` }
    })
    mojiRecepti.value = res.data
  } catch (error) {
    console.error("Greška pri dohvaćanju recepata:", error)
    Notify.create({ type: 'negative', message: 'Nije moguće učitati recepte.' })
  }
}

// Kopiranje povijesnog recepta natrag u formu na vrhu (Samo za liječnika)
function pripremiZaProduljivanje(stariRecept) {
  nazivLijeka.value = stariRecept.naziv_lijeka
  doziranje.value = stariRecept.doza_lijeka
  napomena.value = stariRecept.upute || ''

  // Skrolaj na vrh ekrana
  window.scrollTo({ top: 0, behavior: 'smooth' })

  Notify.create({
    type: 'info',
    message: `Podaci za lijek ${stariRecept.naziv_lijeka} su kopirani gore u formu. Molimo odaberite pacijenta i potvrdite izdavanje.`,
    position: 'top',
    timeout: 5000
  })
}

onMounted(async () => {
  const token = localStorage.getItem('token')

  // Ako je ulogiran zdravstveni radnik, uz recepte povuci i pacijente
  if (korisnikUloga.value === 'zdravstveni_radnik') {
    try {
      const res = await axios.get('http://localhost:3000/api/pacijenti', {
        headers: { Authorization: `Bearer ${token}` }
      })
      pacijentiOpcije.value = res.data
    } catch (error) {
      console.error("Greška pri dohvaćanju opcija pacijenata:", error)
    }
  }
  dohvatiRecepte()
})

// Izdavanje novog/ponovljenog recepta (Samo liječnik)
async function pohraniRecept() {
  if (!odabraniPacijent.value) {
    Notify.create({ type: 'warning', message: 'Potrebno odabrati pacijenta!' })
    return
  }

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
    Notify.create({ type: 'positive', message: 'Recept je uspješno spremljen/produljen!' })

    // Resetiramo polja forme
    nazivLijeka.value = ''
    doziranje.value = ''
    napomena.value = ''
    odabraniPacijent.value = null

    // Osvježavamo listu da se odmah pojavi novi recept
    dohvatiRecepte()
  } catch (error) {
    console.error("Greška na serveru:", error)
    Notify.create({ type: 'negative', message: 'Greška pri spremanju recepta.' })
  }
}
</script>

<style scoped>
.style-kontejner {
  max-width: 650px;
  margin: 0 auto;
}
.prescription-card {
  border-left: 5px solid var(--q-primary) !important;
  background-color: white;
  transition: transform 0.2s;
}
.prescription-card:hover {
  transform: translateY(-2px);
}
</style>
