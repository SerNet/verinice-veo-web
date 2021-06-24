<template>
  <VeoDialog
    v-model="dialog"
    :headline="$t('restore_heading')"
    :persistent="saving"
    :close-disabled="saving"
  >
    <template #default>
      {{ $t('restore_text_part_1') }} <b>{{ version }}</b> {{ $t('restore_text_part_2', { name: object.displayName }) }}
    </template>
    <template #dialog-options>
      <v-btn
        text
        color="primary"
        @click="close()"
      >
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="doRestore()"
      >
        {{ $t('restore') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { VeoEvents } from '~/types/VeoGlobalEvents';

import { IVeoEntity } from '~/types/VeoTypes';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      required: true
    },
    object: {
      type: Object as Prop<IVeoEntity>,
      required: true
    }
  },
  data() {
    return {
      saving: false as boolean
    };
  },
  computed: {
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(newValue: boolean) {
        this.$emit('input', newValue);
      }
    }
  },
  methods: {
    close() {
      this.$emit('input', false);
    },
    async doRestore() {
      this.saving = true;
      try {
        await this.$api.entity.update(this.object.type, this.object.id, this.object);
        this.$emit('restored');
      } catch (e) {
        this.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('restore_error'),
          text: this.$t('restore_error_text')
        });
      } finally {
        this.saving = false;
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "restore": "Restore",
    "restore_error": "Error",
    "restore_error_text": "The object couldn't be restored!",
    "restore_heading": "Restore old version",
    "restore_text_part_1": "Do you really want to restore version",
    "restore_text_part_2": "of \"{name}\"?"
  },
  "de": {
    "restore": "Wiederherstellen",
    "restore_error": "Fehler",
    "restore_error_text": "Das Objekt konnte nicht wiederhergestellt werden!",
    "restore_heading": "Alte Version wiederherstellen",
    "restore_text_part_1": "Möchten Sie wirklich Version",
    "restore_text_part_2": "von \"{name}\" wiederherstellen?"
  }
}
</i18n>
