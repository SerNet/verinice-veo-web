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
  <VeoFseGroup
    v-bind="$props"
    :key="name"
    v-on="$listeners"
  >
    <slot />
  </VeoFseGroup>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropOptions } from 'vue/types/options';
import { IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    value: {
      type: Object,
      default: () => undefined
    },
    name: {
      type: String,
      default: undefined
    },
    options: {
      type: Object,
      default: undefined
    },
    customTranslations: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollection>,
    formSchemaPointer: {
      type: String,
      default: undefined
    },
    level: {
      type: Number,
      default: undefined
    },
    language: {
      type: String,
      required: true
    }
  }
});
</script>
