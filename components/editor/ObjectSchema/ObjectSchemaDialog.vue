<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on">
        Edit Dialog
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">CustomAspect bearbeiten</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field label="Feld 1" required />
            </v-col>
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
  value: boolean
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true }
  },
  setup(props, context) {
    const dialog = ref(props.value)

    watch(() => props.value, (val: boolean) => {
      dialog.value = val
    })

    watch(dialog, (val: boolean) => {
      if (!val) {
        context.emit('input', val)
      }
    })

    return { dialog }
  }
})
</script>
