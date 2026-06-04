<template>
  <q-page class="column">
    <div class="bg-primary text-white q-pa-md text-center">
      <div class="text-h5 text-weight-bold">Korisnički priručnik</div>
      <div class="text-caption">MediAssist</div>
    </div>
    <iframe
      :src="pdfSrc"
      class="col"
      style="width: 100%; border: none;"
    />
  </q-page>
</template>

<script setup>
const pdfSrc = '/docs/MediAssist_Korisnicki_prirucnik.pdf'
</script>
