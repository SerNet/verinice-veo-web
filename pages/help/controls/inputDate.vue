<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Input Date</PageHeader>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        lg="4"
        class="docs-form-sector"
      >
        <VeoForm
          v-model="form.data"
          :schema="form.objectSchema"
          :ui="form.formSchema"
        />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="form.objectSchema"
      :form-schema="form.formSchema"
      :data="form.data"
    />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      form: {
        objectSchema: {
          type: 'object',
          properties: {
            inputDate: {
              type: 'string',
              format: 'date'
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/inputDate',
          options: {
            label: 'Input Date'
          }
        },
        data: {
          inputDate: '2020-02-20'
        }
      }
    };
  }
});
</script>

<style lang="scss"></style>
