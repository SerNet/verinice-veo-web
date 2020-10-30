<template>
  <div>
    <div class="mx-5 my-4">
      <v-select :items="items" v-model="layout" label="Layout Style" style="width:200px;"></v-select>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'FormSchemaEditor',
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
      ]
    }
  }
})
</script>

<style lang="scss" scoped></style>
