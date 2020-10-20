<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <page-header>Class</page-header>
      </v-col>
      <v-col cols="12">
        <v-select
          label="Definiert als"
          v-model="definition.value"
          :items="definition.items"
          style="max-width:400px"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector d-flex justify-center">
        <veo-form
          :schema="dynamicForm.objectSchema"
          :ui="dynamicForm.formSchema"
          v-model="dynamicForm.data"
        />
      </v-col>
    </v-row>
    <form-description
      :objectSchema="dynamicForm.objectSchema"
      :formSchema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    ></form-description>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import VeoForm from '~/components/forms/VeoForm.vue'
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'

export default Vue.extend({
  components: {
    VeoForm,
    FormDescription,
    PageHeader,
  },
  data() {
    return {
      form: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            class: 'display-2 font-weight-bold font-italic',
          },
        },
        data: {},
      },
      formObject: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            class: {
              'display-2': true,
              'font-weight-bold': true,
              'font-italic': true,
            },
          },
        },
        data: {},
      },
      formArray: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Beispiel Text',
          options: {
            class: ['display-2', 'font-weight-bold', 'font-italic'],
          },
        },
        data: {},
      },
      definition: { value: 'String', items: ['String', 'Object', 'Array'] },
    }
  },
  computed: {
    dynamicForm(): any {
      if (this.definition.value === 'Object') {
        return this.formObject
      }
      if (this.definition.value === 'Array') {
        return this.formArray
      }
      return this.form
    },
  },
})
</script>

<style lang="scss"></style>
