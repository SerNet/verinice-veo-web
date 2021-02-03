<template>
  <VeoPage fullsize>
    <v-row justify="center">
      <v-col cols="12">
        <PageHeader>Label</PageHeader>
      </v-col>
      <v-col cols="12" sm="6" lg="4" class="docs-form-sector d-flex justify-center">
        <VeoForm v-model="dynamicForm.data" :schema="dynamicForm.objectSchema" :ui="dynamicForm.formSchema" />
      </v-col>
    </v-row>
    <FormDescription
      :object-schema="dynamicForm.objectSchema"
      :form-schema="dynamicForm.formSchema"
      :data="dynamicForm.data"
    />
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue'
import FormDescription from '~/components/help/FormDescription.vue'
import PageHeader from '~/components/help/PageHeader.vue'
import VeoForm from '~/components/forms/VeoForm.vue'

export default Vue.extend({
  components: {
    VeoForm,
    FormDescription,
    PageHeader
  },
  data() {
    return {
      form: {
        objectSchema: {},
        formSchema: {
          type: 'Label',
          text: 'Ein Beispiel für den statischen Text.'
        },
        data: {}
      }
    }
  },
  computed: {
    dynamicForm(): any {
      return this.form
    }
  }
})
</script>

<style lang="scss"></style>
