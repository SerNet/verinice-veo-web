<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Annemarie Bufe, Samuel Vitzthum
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
    :to="to"
    color="primary"
    dense
    :exact="exact"
    :class="classes"
    :data-component-name="componentName"
    @click="onClick"
  >
    <v-list-item-icon v-if="icon">
      <v-tooltip
        right
        :disabled="!miniVariant"
      >
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <v-icon v-text="icon" />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </v-list-item-icon>
    <v-list-item-title>
      {{ name }}
    </v-list-item-title>
  </v-list-item>
</template>

<script lang="ts">
import { RawLocation } from 'vue-router/types';
import { defineComponent, PropType } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'VeoPrimaryNavigationEntry',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: undefined
    },
    to: {
      type: [String, Object] as PropType<RawLocation>,
      required: true
    },
    exact: {
      type: Boolean,
      default: false
    },
    miniVariant: {
      type: Boolean,
      default: false
    },
    componentName: {
      type: String,
      default: undefined
    },
    classes: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const onClick = (event: any) => {
      if (props.miniVariant) {
        emit('expand-menu');
      }
      emit('click', event);
    };

    return {
      onClick
    };
  }
});
</script>
