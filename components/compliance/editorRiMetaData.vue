<!--
   - verinice.veo web
   - Copyright (C) 2025 jae
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
   - along with props program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <component :is="render" />
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify';
import { VTextField, VExpansionPanels, VExpansionPanel, VExpansionPanelText } from 'vuetify/components';
import type { TAdditionalInfo } from './Editor.vue';

const props = defineProps<{
  data: Record<string, unknown>;
  property: { label: string; key: string };
  additionalInfo: TAdditionalInfo;
}>();

const { t } = useVeoI18n();

const nonDefaultCases = {
  TARGET_OBJECT_DESCRIPTION: 'targetObjectDescription',
  ORIGINATION_DESCRIPTION: 'originationDescription' // comes as raw HTML!
};

function render() {
  const data = { ...props.data, ...props.additionalInfo };
  const { label, key } = props.property;

  switch (props.property.key) {
    case nonDefaultCases.TARGET_OBJECT_DESCRIPTION:
      return expansionPanel(t(`riEditor.${label}`), data[key]);
    case nonDefaultCases.ORIGINATION_DESCRIPTION:
      return h(VExpansionPanels, () => [
        h(VExpansionPanel, { title: t(`riEditor.${label}`) }, () => [
          h(VExpansionPanelText, () => [
            h('span', {
              innerHTML: DOMPurify.sanitize(data[key] ?? t('na')),
              'data-veo-test': `compliance-editor-expansion-panel`
            })
          ])
        ])
      ]);
    default:
      return textField(t(label), data[key]);
  }
}

function textField(label: string, value: string) {
  return h(VTextField, {
    label,
    disabled: true,
    variant: 'underlined',
    modelValue: value ?? t('na'),
    'data-veo-test': `compliance-editor-text-field`
  });
}

function expansionPanel(label: string, value: string) {
  return h(VExpansionPanels, () => [
    h(VExpansionPanel, {
      title: label,
      text: value ?? t('na'),
      'data-veo-test': `compliance-editor-expansion-panel`
    })
  ]);
}
</script>
<i18n src="~/locales/base/components/compliance-editor.json"></i18n>
