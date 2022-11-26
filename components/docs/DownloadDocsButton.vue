<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-tooltip
    bottom
    :disabled="pdfExists"
  >
    <template #activator="{ on }">
      <div v-on="on">
        <v-btn
          depressed
          :disabled="!pdfExists"
          :to="pdfPath"
          color="primary"
          class="mr-2"
          target="_blank"
        >
          {{ t('exportAsPDF') }}
        </v-btn>            
      </div>
    </template>
    <template #default>
      {{ t('noPdfExists') }}
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

export default defineComponent({
  setup() {
    const { locale, t } = useI18n();

    const pdfExists = ref(false);
    const pdfPath = computed(() => `/Documentation_${locale.value}.pdf`);
    onMounted(async () => {
      try {
        const response = await fetch(pdfPath.value);
        pdfExists.value = !!response.headers.get('content-type')?.startsWith('application/pdf');
      } catch (_) {}
    });

    return {
      pdfExists,
      pdfPath,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "exportAsPDF": "download as pdf",
    "noPdfExists": "There is no downloadable pdf for this language"
  },
  "de": {
    "exportAsPDF": "Als PDF herunterladen",
    "noPdfExists": "Für diese Sprache existiert keine PDF"
  }
}  
</i18n>
