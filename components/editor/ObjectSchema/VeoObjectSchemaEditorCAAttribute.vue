<template>
  <v-list-item class="veo-attribute-list-attribute my-2">
    <v-list-item-content>
      <v-row>
        <v-col class="py-0">
          <v-text-field
            :value="$props.title"
            :label="`${$t(`editor.dialog.editform.aspect.title`)} *`"
            required
            :rules="rules.title"
            :prefix="prefix"
            @input="doUpdate($event, 'title')"
          />
        </v-col>
        <v-col :cols="4" class="py-0">
          <v-select
            :value="$props.type"
            :label="$t(`editor.dialog.editform.aspect.type`)"
            :items="types"
            @input="doUpdate($event, 'type')"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="py-0">
          <v-text-field
            :value="$props.description"
            :label="$t(`editor.dialog.editform.aspect.description`)"
            @input="doUpdate($event, 'description')"
          />
        </v-col>
      </v-row>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn fab depressed text color="black" @click="doDelete()">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import { defineComponent, ref, computed, Ref } from '@nuxtjs/composition-api'
import { trim } from 'lodash'
import { INPUT_TYPES } from '~/types/VEOEditor'

interface IProps {
  title: string
  type: string
  description: string
  aspectName: string
}

export default defineComponent<IProps>({
  props: {
    title: { type: String, default: '' },
    type: { type: String, required: true },
    description: { type: String, default: '' },
    aspectName: { type: String, required: true }
  },
  setup(props, context) {
    const prefix = computed(() => props.aspectName + '_')

    const rules: Ref<{
      [key: string]: ((value: string) => boolean)[]
    }> = ref({
      title: [(value: string) => trim(value).length > 0]
    })

    const types = computed(() => {
      const dummy: string[] = []
      for (const entry in INPUT_TYPES) {
        // @ts-ignore
        dummy.push(INPUT_TYPES[entry].name)
      }
      return dummy
    })

    function doDelete() {
      context.emit('delete')
    }

    function doUpdate(value: any, property: string) {
      const object = { ...props } as any
      delete object.aspectName
      object[property] = value
      context.emit('update', object)
    }

    return {
      prefix,
      rules,
      types,
      doDelete,
      doUpdate
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-attribute-list-attribute {
  border: 1px solid $grey;
  border-radius: 4px;
}
</style>
