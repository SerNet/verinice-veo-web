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
  <BaseAlert
    :model-value="true"
    :type="piaMandatory ? VeoAlertType.INFO : VeoAlertType.SUCCESS"
    no-close-button
    flat
    :title="piaMandatory ? t('piaMandatory') : t('piaNotMandatory')">
    <span v-if="piaMandatory">
      <i18n-t keypath="piaMandatoryText" tag="span" scope="global"
        ><br
      /></i18n-t>
    </span>
    <span v-else>
      {{ t('piaNotMandatoryText') }}
    </span>
  </BaseAlert>
</template>

<script lang="ts">
import { IVeoFormsElementDefinition } from '../types';
import { VeoFormsWidgetProps } from '../util';
import { VeoAlertType } from '~/types/VeoTypes';

export const WIDGET_DEFINITION: IVeoFormsElementDefinition = {
  code: 'PiaMandatoryWidget',
  name: {
    en: 'PiaMandatoryWidget'
  },
  description: {
    en: 'Adds a label to the form, specifing whether a privacy impact assesment is mandatory.',
    de: 'Fügt einen Text im Formschema ein, der definiert, ob eine Datenschutz-Folgeabschätzung nötig ist.'
  }
};

export default defineComponent({
  name: WIDGET_DEFINITION.code,
  props: VeoFormsWidgetProps,
  setup(props) {
    const { t } = useI18n();

    const piaMandatory = computed(
      () => !!props.metaData?.decisionResults?.piaMandatory?.value
    );

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
    "piaMandatory": "Privacy impact assessment required",
    "piaMandatoryText": "Based on the data of this object, a privacy impact assessment is required.{0}Please create one using the button in the warnings tab on the right.",
    "piaNotMandatory": "Privacy impact assessment not required",
    "piaNotMandatoryText": "A privacy impact assessment is not required for this object."
  },
  "de": {
    "piaMandatory": "Datenschutz-Folgeabschätzung verpflichtend",
    "piaMandatoryText": "Basierend auf Daten in diesem Objekt ist eine Datenschutz-Folgeabschätzung verpflichtend.{0}Bitte erstellen Sie diese über die Warnungsleiste rechts.",
    "piaNotMandatory": "Datenschutz-Folgeabschätzung nicht verpflichtend",
    "piaNotMandatoryText": "Für dieses Objekt ist keine Datenschutz-Folgeabschätzung notwendig."
  }
}
</i18n>
