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
