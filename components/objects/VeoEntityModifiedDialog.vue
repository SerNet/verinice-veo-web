<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <VeoDialog
    v-model="dialog"
    :headline="$t('headline')"
  >
    <template #default>
      {{ $t('text', { displayName }) }}
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        @click="$emit('input', false)"
      >
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!item"
        @click="$emit('exit', item.id)"
      >
        {{ $t('global.button.yes') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';

import { IVeoEntity } from '~/types/VeoTypes';

interface IData {
  dialog: boolean;
  noWatch: boolean;
}

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object as Prop<IVeoEntity>,
      default: undefined
    }
  },
  data(): IData {
    return {
      dialog: false,
      noWatch: false
    };
  },
  computed: {
    displayName(): string {
      return this.item?.displayName ? `"${this.item.displayName}"` : '';
    }
  },
  watch: {
    value(newValue: boolean) {
      this.noWatch = true;
      this.dialog = newValue;
      this.noWatch = false;
    },
    dialog(newValue: boolean) {
      if (!this.noWatch) {
        this.$emit('input', newValue);
      }
    }
  },
  mounted() {
    this.dialog = this.value;
  }
});
</script>

<i18n>
{
  "en": {
    "text": "The object {displayName} has been edited. Do you really want to leave this page?",
    "headline": "Close"
  },
  "de": {
    "text": "Das Objekt {displayName} wurde bearbeitet. Wollen Sie die Seite wirklich verlassen?",
    "headline": "Verlassen"
  }
}
</i18n>
