<template>
  <VeoPage>
    <h2>{{ $t('calltoaction') }}</h2>
    <v-list
      two-line
      class="overflow-hidden"
    >
      <v-list-item to="/editor/objectschema">
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">
            {{ $t('editor.objectschema.headline') }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('objectSchemaDescription') }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon x-large>
            mdi-chevron-right
          </v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-list-item to="/editor/formschema">
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold">
            {{ $t('editor.formschema.headline') }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('formSchemaDescription') }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon x-large>
            mdi-chevron-right
          </v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </VeoPage>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

interface IProps {}

export default defineComponent<IProps>({
  head(): any {
    return {
      title: 'verinice.'
    };
  }
});
</script>

<i18n>
{
  "en": {
    "calltoaction": "What do you want to do?",
    "formSchemaDescription": "Create, edit, import or export form schemas",
    "objectSchemaDescription": "Create, edit, import or export object schemas"
  },
  "de": {
    "calltoaction": "Was möchten Sie tun?",
    "formSchemaDescription": "Formschemas erstellen, bearbeiten, importieren und exportieren",
    "objectSchemaDescription": "Objektschemas erstellen, bearbeiten, importieren und exportieren"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list-item__subtitle {
  white-space: pre-wrap;
}
</style>
