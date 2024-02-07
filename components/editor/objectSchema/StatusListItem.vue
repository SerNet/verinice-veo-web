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
  <v-list-item class="schema-details__status-list-item pl-0 my-0" dense>
    <template #prepend>
      <div
        class="handle d-flex align-center justify-center my-0 px-4"
        :style="{
          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
          height: '58px'
        }"
      >
        <v-icon color="white" :icon="mdiMenu" />
      </div>
    </template>
    <v-row no-gutters>
      <v-col class="d-flex align-center">
        <b>{{ status.key }}</b>
      </v-col>
      <v-col>
        <v-text-field
          :model-value="status[lang]"
          dense
          :prepend-inner-icon="mdiTranslate"
          :label="upperFirst(t('translation').toString())"
          hide-details
          variant="underlined"
          @update:model-value="onTranslationInput"
        />
      </v-col>
    </v-row>
    <template #append>
      <v-list-item-action>
        <v-tooltip location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" :icon="mdiTrashCanOutline" variant="text" @click="$emit('delete')" />
          </template>
          <template #default>
            {{ upperFirst(t('deleteStatus').toString()) }}
          </template>
        </v-tooltip>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { upperFirst } from 'lodash';
import { mdiMenu, mdiTranslate, mdiTrashCanOutline } from '@mdi/js';

import { CHART_COLORS } from '~/lib/utils';

export default defineComponent({
  props: {
    status: {
      type: Object as PropType<{ key: string; [lang: string]: string }>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    lang: {
      type: String,
      required: true
    }
  },
  emits: ['update-status', 'delete'],
  setup(props, { emit }) {
    const { t } = useI18n();

    function onTranslationInput(value: string) {
      emit('update-status', {
        ...props.status,
        [props.lang]: value
      });
    }

    return {
      onTranslationInput,

      t,
      upperFirst,
      mdiMenu,
      mdiTrashCanOutline,
      mdiTranslate,
      CHART_COLORS
    };
  }
});
</script>

<i18n>
{
  "en": {
    "deleteStatus": "delete status",
    "translation": "translation"
  },
  "de": {
    "translation": "übersetzung",
    "deleteStatus": "status löschen"
  }
}
</i18n>

<style lang="scss" scoped>
.schema-details__status-list-item {
  border: 1px solid $medium-grey;
  border-radius: 0px;
  overflow: hidden;

  .v-list-item__icon {
    height: 56px;
  }
}
</style>
