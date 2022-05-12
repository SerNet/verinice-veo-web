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
  <VeoAlert
    :value="true"
    :type="piaMandatory ? VeoAlertType.INFO : VeoAlertType.SUCCESS"
    no-close-button
    flat
    :title="piaMandatory ? t('piaMandatory') : t('piaNotMandatory')"
    :text="piaMandatory ? t('piaMandatoryText') : t('piaNotMandatoryText')"
  />
</template>

<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { separateUUIDParam } from '~/lib/utils';

import { IVeoFormsWidgetDefinition, VeoAlertType } from '~/types/VeoTypes';

export const WidgetDefinition: IVeoFormsWidgetDefinition = {
  name: 'PiaMandatoryWidget',
  description: {
    de: 'Fügt einen Text im Formschema ein, der definiert ob eine Datenschutzfolgeabschätzung nötig ist.',
    en: 'Adds a label to the form, specifing whether a privacy impact assesment is mandatory.'
  }
};

export default defineComponent({
  name: WidgetDefinition.name,
  props: {
    objectData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n();
    const route = useRoute();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const piaMandatory = computed(() => !!props.objectData.domains?.[domainId.value]?.decisionResults.piaMandatory.value);

    return {
      piaMandatory,

      t,
      VeoAlertType
    };
  }
});
</script>

<i18n>
{
  "en": {
    "piaMandatory": "Privacy impact assesment required",
    "piaMandatoryText": "Based on the data of this object, a privacy impact assesment is required.{0}Please create one using the button in the warnings tab on the right.",
    "piaNotMandatory": "Privacy impact assesment not required",
    "piaNotMandatoryText": "A privacy impact assesment is not required for this object."
  },
  "de": {
    "piaMandatory": "Datenschutzfolgeabschätzung verpflichtend",
    "piaMandatoryText": "Basierend auf Daten in diesem Objekt ist eine Datenschutzfolgeabschätzung verpflichtend.{0}Bitte erstellen Sie diese über die Warnungsleiste rechts.",
    "piaNotMandatory": "Datenschutzfolgeabschätzung nicht verpflichtend",
    "piaNotMandatoryText": "Für dieses Objekt ist keine Datenschutzfolgeabschätzung notwendig."
  }
}
</i18n>
