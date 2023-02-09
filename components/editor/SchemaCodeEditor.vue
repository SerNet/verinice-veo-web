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
  <div class="schema-editor-wrapper d-flex flex-column fill-height">
    <UtilCodeEditor
      :model-value="code"
      @update:model-value="onInput"
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
          submitButtonText || t('saveSchema')
        }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    submitButtonText: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:model-value', 'schema-updated'],
  setup(props, context) {
    const { t } = useI18n();
    const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();

    const code = ref('');
    const saveButtonDisabled = ref(true);

    watch(
      () => props.modelValue,
      () => {
        code.value = props.modelValue;
      },
      {
        immediate: true
      }
    );

    function onInput(event: string) {
      saveButtonDisabled.value = false;
      code.value = event;
      context.emit('update:model-value', event);
    }

    function updateSchema() {
      if (!props.readonly) {
        try {
          const updatedSchema = JSON.parse(code.value);
          context.emit('schema-updated', updatedSchema);
          displaySuccessMessage(t('saveSchemaSuccess'));
        } catch (e: any) {
          displayErrorMessage(t('saveSchemaError'), e.message);
        }
      }
      saveButtonDisabled.value = true;
    }

    return {
      code,
      saveButtonDisabled,
      onInput,
      updateSchema,

      t
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
