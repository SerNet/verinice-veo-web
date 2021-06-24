<template>
  <VeoDialog
    v-bind="$attrs"
    :headline="$t('restore.heading')"
    :persistent="saving"
    :close-disabled="saving"
    v-on="$listeners"
  >
    <template #default>
      {{ $t('restore.textPart1') }} <b>{{ version }}</b> {{ $t('restore.textPart2', { name: object.displayName }) }}
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
        {{ $t('restore.action') }}
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
          title: this.$t('restore.error'),
          text: this.$t('restore.errorText')
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
    "restore": {
      "action": "Restore",
      "error": "Error",
      "errorText": "The object couldn't be restored.",
      "heading": "Restore old version",
      "textPart1": "Do you really want to restore version",
      "textPart2": "of \"{name}\"?"
    }
  },
  "de": {
    "restore": {
      "action": "Wiederherstellen",
      "error": "Fehler",
      "errorText": "Das Objekt konnte nicht wiederhergestellt werden.",
      "heading": "Alte Version wiederherstellen",
      "textPart1": "Möchten Sie wirklich Version",
      "textPart2": "von \"{name}\" wiederherstellen?"
    }
  }
}
</i18n>
