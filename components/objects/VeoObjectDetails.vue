<!--
   - verinice.veo web
   - Copyright (C) 2021  Samuel Vitzthum
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
  <!-- TODO: find a way to bind $attrs, so props don't need to be passed manually -->
  <VeoPage
    sticky-header
    :is-page-wrapper-child="isPageWrapperChild"
    fullsize
  >
    <template
      v-if="!loading && object"
      #header
    >
      <h1>
        {{ upperFirst(t('object').toString()) }}
      </h1>
      <h2>
        {{ object.displayName }}
      </h2>
    </template>
    <template #default>
      <!-- TODO: add object info in #350 -->
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent, PropOptions } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { upperFirst } from 'lodash';
import { IVeoEntity } from '~/types/VeoTypes';

export default defineComponent({
  name: 'VeoObjectDetails',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    object: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoEntity>,
    isPageWrapperChild: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n();

    return { t, upperFirst };
  }
});
</script>

<i18n>
{
  "en": {
    "object": "object"
  },
  "de": {
    "object": "Objekt"
  }
}
</i18n>
