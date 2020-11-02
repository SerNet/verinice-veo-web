<template>
  <div>
    <div class="mx-5 my-4">
      <v-select :items="items" v-model="layout" label="Layout Style" style="width:200px;"></v-select>
      <VeoForm v-model="objectData" :schema="objectSchema" :is-valid.sync="isValid" :error-messages.sync="errorMessages" />
    </div>

    <!-- <draggable v-model="myArray" group="people" @start="drag = true" @end="drag = false">
      <div v-for="element in myArray" :key="element.id">{{ element.name }}</div>
    </draggable> -->
    <nested-draggable :tasks="list" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import draggable from 'vuedraggable'
import NestedDraggable from '@/components/editor/FormSchema/NestedDraggable.vue'

export default Vue.extend({
  name: 'FormSchemaEditor',
  components: {
    // draggable
    NestedDraggable
  },
  props: {
    objectSchema: Object
  },
  data() {
    return {
      list: [
        {
          name: 'task 1',
          tasks: [
            {
              name: 'task 2',
              tasks: []
            }
          ]
        },
        {
          name: 'task 3',
          tasks: [
            {
              name: 'task 4',
              tasks: []
            }
          ]
        },
        {
          name: 'task 5',
          tasks: []
        }
      ],
      myArray: [{ name: 'Hallo 1' }, { name: 'Hallo 2' }, { name: 'Hallo 3' }, { name: 'Hallo 4' }],
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
