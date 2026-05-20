<template>
  <q-page class="bg-grey-1 flex flex-center">
    <div class="q-pa-md" style="width: 100%; max-width: 400px;">

      <div class="text-center q-mb-xl">
        <q-icon name="local_hospital" size="80px" color="primary" />
        <div class="text-h5 text-weight-bold text-primary">MediAssist</div>
      </div>

      <div class="column q-gutter-y-md">
        <q-btn
          unelevated
          rounded
          color="primary"
          size="lg"
          label="Popis Pacijenata"
          icon="people"
          to="/Pacijenti"
          class="full-width"
        />

        <q-btn
          unelevated
          rounded
          color="red-5"
          size="lg"
          label="Unos Mjerenja"
          icon="monitor_heart"
          to="/mjerenja"
          class="full-width"
        />

        <q-btn
          unelevated
          rounded
          color="green-6"
          size="lg"
          label="Izdaj Recept"
          icon="medication"
          to="/recepti"
          class="full-width"
        />
        <q-btn
          unelevated
          rounded
          color="grey-6"
          size="lg"
          label="Zakazivanje termina"
          icon="timer"
          to="/UnosTermina"
          class="full-width"
        />

        <q-btn
          outline
          rounded
          color="grey-8"
          label="Odjava"
          icon="logout"
          @click="logout"
          class="q-mt-lg"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  router.push('/loginPage')
}
</script>
