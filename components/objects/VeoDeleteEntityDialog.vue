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
        :data-cy="$utils.prefixCyData($options, 'cancel-button')"
        @click="$emit('input', false)"
      >
        {{ $t('global.button.no') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'confirm-button')"
        :disabled="!item"
        @click="deleteEntity"
      >
        {{ $t('global.button.delete') }}
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
  data() {
    return {
      dialog: false,
      noWatch: false
    } as IData;
  },
  computed: {
    displayName(): string {
      return this.item?.displayName ?? '';
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
  },
  methods: {
    deleteEntity() {
      this.$api.entity
        .delete(this.item.type, this.item.id)
        .then(() => {
          this.$emit('success');
        })
        .catch((error) => {
          this.$emit('error', error);
        });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "text": "Do you really want to delete the object \"{displayName}\"?",
    "headline": "Delete object"
  },
  "de": {
    "text": "Möchten Sie das Objekt \"{displayName}\" wirklich löschen?",
    "headline": "Objekt löschen"
  }
}
</i18n>
