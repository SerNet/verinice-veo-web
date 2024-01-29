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
  <div>
    <v-img src="/images/defaultError.svg" max-height="300px" contain />
    <h2 class="text-h2 mt-8 text-center">
      {{ t('formInvalid') }}
    </h2>
    <b>{{ upperFirst(t('details').toString()) }}:</b>
    <UtilValidationResultList :items="errors" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';

import { VeoSchemaValidatorMessage } from '~/lib/ObjectSchemaValidator';

defineProps({
  errors: {
    type: Array as PropType<VeoSchemaValidatorMessage[]>,
    default: () => [],
  },
});

const { t } = useI18n();
</script>

<i18n>
{
  "en": {
    "details": "details",
    "formInvalid": "The form is invalid and couldn't be displayed."
  },
  "de": {
    "details": "details",
    "formInvalid": "Das Formular ist korrupt und kann nicht angezeigt werden."
  }
}
</i18n>
