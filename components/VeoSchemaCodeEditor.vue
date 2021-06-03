<template>
  <div class="schema-editor-wrapper d-flex flex-column fill-height">
    <VeoCodeEditor
      :value="code"
      @input="onInput"
    />
    <div
      v-if="!readonly"
      class="veo-editor-save-button"
    >
      <v-btn
        class="mx-4 my-2"
        color="primary"
        outlined
        :disabled="saveButtonDisabled"
        @click="updateSchema()"
      >
        {{
          $t('saveSchema')
        }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { VeoEvents } from '~/types/VeoGlobalEvents';

interface IProps {
  value: string;
  readonly: boolean;
}

export default defineComponent<IProps>({
  props: {
    value: { type: String, default: '' },
    readonly: { type: Boolean, default: false }
  },
  setup(props, context) {
    const code = ref('');
    const saveButtonDisabled = ref(true);

    watch(
      () => props.value,
      () => {
        code.value = props.value;
      },
      {
        immediate: true
      }
    );

    function onInput(event: string) {
      saveButtonDisabled.value = false;
      code.value = event;
      context.emit('input', event);
    }

    function updateSchema() {
      if (!props.readonly) {
        try {
          const updatedSchema = JSON.parse(code.value);
          context.emit('schema-updated', updatedSchema);
          context.root.$emit(VeoEvents.SNACKBAR_SUCCESS, {
            title: '',
            text: context.root.$i18n.t('saveSchemaSuccess')
          });
        } catch (e) {
          context.root.$emit(VeoEvents.ALERT_ERROR, {
            title: context.root.$i18n.t('saveSchemaError'),
            text: e.message
          });
        }
      }
      saveButtonDisabled.value = true;
    }

    return {
      code,
      saveButtonDisabled,
      onInput,
      updateSchema
    };
  }
});
</script>

<i18n>
{
  "en": {
    "saveSchema": "Apply code changes",
    "saveSchemaError": "Couldn't update schema",
    "saveSchemaSuccess": "Schema updated!"
  },
  "de": {
    "saveSchema": "Codeänderungen übernehmen",
    "saveSchemaError": "Das Schema konnte nicht aktualisiert werden",
    "saveSchemaSuccess": "Schema wurde aktualisiert!"
  }
}
</i18n>

<style scoped>
.veo-editor-save-button {
  background-color: rgb(245, 245, 245);
  flex-grow: 0;
}

.schema-editor-wrapper {
  flex-wrap: nowrap;
  overflow: hidden;
}
</style>
