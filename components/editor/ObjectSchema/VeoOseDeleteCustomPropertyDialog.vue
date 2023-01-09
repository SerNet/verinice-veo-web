<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
  <BaseDialog
    v-model="dialog.value"
    :headline="headline"
  >
    <template #default>
      <span>{{ t(`delete.${type}`, { title }) }}</span>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$emit('delete-item')"
      >
        {{ t('global.button.delete') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>
<script lang="ts">
import { PropType } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String as PropType<'aspect' | 'link'>,
      required: true
    }
  },
  emits: ['input', 'delete-item'],
  setup(props, context) {
    const { t } = useI18n();

    const dialog = ref({ value: props.value });

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val;
      }
    );

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val);
        }
      }
    );

    const headline = computed(() => {
      return props.type ? t(`headline_${props.type}`) : '';
    });

    return { dialog, headline, t };
  }
});
</script>

<i18n>
{
  "en": {
    "delete": {
      "aspect": "Do you really want to delete the aspect \"{title}\"?",
      "link": "Do you really want to delete the link \"{title}\"?"
    }
  },
  "de": {
    "delete": {
      "aspect": "Möchten Sie den Aspekt \"{title}\" wirklich löschen?",
      "link": "Möchten Sie den Link \"{title}\" wirklich löschen?"
    }
  }
}
</i18n>
