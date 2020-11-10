<template>
  <v-row>
    <v-col cols="12" lg="4">
      <div class="font-italic font-weight-black">objectSchema</div>
      <JsonHighlighter :text="objectSchemaStringified" />
    </v-col>
    <v-col cols="12" lg="4">
      <div class="font-italic font-weight-black">formSchema</div>
      <JsonHighlighter :text="formSchemaStringified" />
    </v-col>
    <v-col cols="12" lg="4">
      <div class="font-italic font-weight-black">data</div>
      <JsonHighlighter :text="dataStringified" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import JsonHighlighter from './JsonHighlighter.vue'

export default Vue.extend({
  name: 'FormDescription',
  components: {
    JsonHighlighter
  },
  props: {
    objectSchema: Object,
    formSchema: Object,
    data: Object
  },
  computed: {
    objectSchemaStringified(): string {
      return this.stringify(this.objectSchema)
    },
    formSchemaStringified(): string {
      return this.stringify(this.formSchema)
    },
    dataStringified(): string {
      return this.stringify(this.data)
    }
  },
  methods: {
    stringify(json: JSON): string {
      return JSON.stringify(json, null, 4)
    }
  }
})
</script>

<style lang="scss" scoped></style>
