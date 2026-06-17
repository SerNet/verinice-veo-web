<!--
   - verinice.veo web
   - Copyright (C) 2026  djm
   -
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
-->
<template>
  <BasePage title="Input Duration" fixed-header>
    <v-row justify="center">
      <v-col cols="12" lg="8" class="docs-form-sector">
        <!-- @vue-ignore TODO #3066 not assignable -->
        <DynamicFormEntrypoint v-model="form.data" :object-schema="form.objectSchema" :form-schema="form.formSchema" />
      </v-col>
    </v-row>
    <HelpFormDescription :object-schema="form.objectSchema" :form-schema="form.formSchema" :data="form.data" />
  </BasePage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'plain' });

const form = ref({
  objectSchema: {
    type: 'object',
    properties: {
      inputDuration: {
        type: 'string',
        format: 'duration'
      }
    }
  },
  formSchema: {
    type: 'Control',
    scope: '#/properties/inputDuration',
    options: {
      label: 'Input Duration'
    }
  },
  data: {
    inputDuration: 'P17DT4H5M6S'
  }
});
</script>
