<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Input Date-Time</PageHeader>
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
            inputDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        formSchema: {
          type: 'Control',
          scope: '#/properties/inputDateTime',
          options: {
            label: 'Input Date-Time'
          }
        },
        data: {
          inputDateTime: '2020-08-05T12:05:00+02:00'
        }
      }
    };
  }
});
</script>

<style lang="scss"></style>
