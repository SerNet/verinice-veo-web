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
  <v-list-item
                  
    class="schema-details__status-list-item pl-0 my-0"
    dense
  >
    <v-list-item-icon
      class="handle d-flex align-center justify-center my-0 px-4"
      :style="{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }"
    >
      <v-icon
        color="white"
        outlined
        dark
      >
        {{ mdiMenu }}
      </v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-row no-gutters>
        <v-col class="d-flex align-center">
          <b>{{ status }}</b>
        </v-col>
        <v-col>
          <v-text-field
            dense
            :prepend-inner-icon="mdiTranslate"
            :label="upperFirst(t('translation').toString())"
            hide-details
          />
        </v-col>
      </v-row>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { mdiMenu, mdiTranslate } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';

import { CHART_COLORS } from '~/lib/utils';

export default defineComponent({
  props: {
    status: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  setup() {
    const { t } = useI18n();

    return {
      t,
      upperFirst,
      mdiMenu,
      mdiTranslate,
      CHART_COLORS
    };
  }
});
</script>

<i18n>
{
  "en": {
    "translation": "translation"
  },
  "de": {
    "translation": "übersetzung"
  }
}
</i18n>

<style lang="scss" scoped>
.schema-details__status-list-item {
  background-color: white;
  border: 1px solid #efefef;
  border-radius: 4px;
  overflow: hidden;

  .v-list-item__icon {
    height: 46px;
  }
}
</style>
