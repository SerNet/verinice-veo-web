<template>
  <div>
    <div class="mx-5 my-4">
      <v-select :items="items" v-model="layout" label="Layout Style" style="width:200px;"></v-select>
      <VeoForm v-model="objectData" :schema="objectSchema" :is-valid.sync="isValid" :error-messages.sync="errorMessages" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'FormSchemaEditor',
  props: {
    objectSchema: Object
  },
  data() {
    return {
      layout: 'long',
      items: [
        {
          text: 'Durchgehend',
          value: 'long'
        },
        {
          text: 'Seiten',
          value: 'page'
        }
      ],
      objectData: {},
      isValid: undefined,
      errorMessages: undefined
    }
  }
})
</script>

<style lang="scss" scoped></style>
