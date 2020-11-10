<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">CustomAspect bearbeiten</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-for="child of aspect.children" :key="child.id">
            <v-col>
              <v-text-field v-model="child.name" label="Property name" />
            </v-col>
            <v-col :cols="4">
              <v-select v-model="child.type" label="Type" :items="objectTypes" />
            </v-col>
          </v-row>
          <v-row>
            <v-btn color="primary">Add Property</v-btn>
          </v-row>
        </v-container>
        <small>* required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="dialog = false">
          Close
        </v-btn>
        <v-btn color="blue darken-1" text @click="dialog = false">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
interface IProps {
  value: boolean,
  aspect: any
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true },
    aspect: { type: Object, required: true }
  },
  setup(props, context) {
    const dialog = ref(props.value)
    const objectTypes = ref(['boolean', 'string', 'enum', 'array'])

    watch(() => props.value, (val: boolean) => {
      dialog.value = val
      console.log('1', props.aspect)
    })

    watch(dialog, (val: boolean) => {
      if (!val) {
        context.emit('input', val)
      }
    })

    return { dialog, objectTypes }
  }
})
</script>
