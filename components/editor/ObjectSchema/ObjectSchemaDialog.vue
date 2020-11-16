<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent>
    <template #default>
      <v-window v-model="dialog.mode">
        <v-window-item value="create">
          <v-form v-model="createForm.valid" @submit.prevent="createNode()">
            <v-row>
              <v-col>
                <v-text-field v-model="createForm.name" label="Title" required :rules="createForm.rules.name" />
              </v-col>
            </v-row>
            <v-row v-if="type === 'link'">
              <v-col class="py-0">
                <v-text-field v-model="createForm.targetDescription" label="Target description" required :rules="createForm.rules.targetDescription" />
              </v-col>
              <v-col :cols="4" class="py-0">
                <v-select v-model="createForm.targetType" label="Target type" :items="types" required :rules="createForm.rules.targetType" />
              </v-col>
            </v-row>
          </v-form>
        </v-window-item>
        <v-window-item value="edit">
          <v-form v-if="_aspect && _aspect.attributes" v-model="editForm.valid" @submit.prevent="saveNode()">
            <v-list dense class="py-0">
              <v-list-item v-for="(attribute, index) of _aspect.attributes" :key="index" class="veo-attribute-list-attribute my-2">
                <v-list-item-content>
                  <v-row>
                    <v-col class="py-0">
                      <v-text-field v-model="attribute.title" label="Property name" :rules="editForm.rules.title" :prefix="_aspect.title +'_'" />
                    </v-col>
                    <v-col :cols="4" class="py-0">
                      <v-select v-model="attribute.type" label="Type" :items="types" />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="py-0">
                      <v-text-field v-model="attribute.description" label="Property description" />
                    </v-col>
                  </v-row>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn fab depressed text color="black" @click="removeAttribute(index)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-if="_aspect.attributes.length === 0">
                <v-list-item-content class="veo-attribute-list-no-content justify-center">This aspect has no properties</v-list-item-content>
              </v-list-item>
              <v-list-item class="veo-attribute-list-add-button">
                <v-list-item-action>
                  <v-spacer />
                  <v-btn color="primary" text>
                    <v-icon>mdi-plus-circle-outline</v-icon>
                    <span class="ml-2" @click="addAttribute()">Add attribute</span>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-form>
        </v-window-item>
      </v-window>
    </template>
    <template v-if="dialog.mode === 'create'" #dialog-options>
      <v-spacer />
      <v-btn text :disabled="!createForm.valid" color="black" @click="createNode()">Weiter</v-btn>
    </template>
    <template v-else #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        Close
      </v-btn>
      <v-btn text color="primary" :disabled="!editForm.valid" @click="saveNode()">
        Save
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from '@nuxtjs/composition-api'
import { trim } from 'lodash'

import { VEOTypeNameRAW } from 'veo-objectschema-7'
import { VEOCustomAspect } from '~/lib/ObjectSchemaHelper'
import { ITypeInfo } from '~/components/editor/ObjectSchema/ObjectSchemaEditor.vue'

interface IProps {
  value: boolean,
  aspect: VEOCustomAspect | undefined,
  mode: string,
  type: 'aspect' | 'link'
  typeMap: Record<VEOTypeNameRAW, ITypeInfo>
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true },
    // eslint-disable-next-line
    aspect: { required: true }, // No type to avoid checking for invalid prop (aspect can either be undefined or VEOCustomAspect)
    mode: { type: String, default: 'create' },
    type: { type: String, required: true },
    typeMap: { type: Object, required: true }
  },
  setup(props, context) {
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value, mode: props.mode })

    watch(() => props.value, (val: boolean) => {
      dialog.value.value = val
    })

    watch(() => dialog.value.value, (val: boolean) => {
      if (!val) {
        context.emit('input', val)
      }
    })

    watch(() => props.mode, (val: string) => {
      dialog.value.mode = val
    })

    const headline = computed(() => {
      if (dialog.value.mode === 'create') {
        return 'CustomAspect erstellen'
      } else if (props.aspect?.title) {
        return `CustomAspect "${props.aspect?.title}" bearbeiten`
      } else {
        return 'CustomAspect bearbeiten'
      }
    })

    function close() {
      context.emit('input', false)
    }

    /**
     * Create customAspect stuff
     */
    const createForm = ref({
      valid: false,
      name: '',
      targetType: '' as string,
      targetDescription: '' as string,
      rules: {
        name: [(input: string) => trim(input).length > 0],
        targetType: [(input: string) => trim(input).length > 0],
        targetDescription: [(input: string) => trim(input).length > 0]
      }
    })

    function createNode() {
      context.emit('create-node', createForm.value)
    }

    /**
     * Edit customAspect stuff
     */
    const editForm = ref({
      valid: false,
      rules: {
        title: [(input: string) => trim(input).length > 0]
      }
    })

    const _aspect = ref(props.aspect)
    watch(() => props.aspect, (val: VEOCustomAspect | undefined) => {
      _aspect.value = val
    })

    function saveNode() {
      context.emit('save-node', _aspect.value)
    }

    function addAttribute() {
      _aspect.value?.attributes.push({ type: 'string', title: '', description: '' })
    }

    function removeAttribute(index: number) {
      _aspect.value?.attributes.splice(index, 1)
    }

    // Generate an array containing all type names from the type map.
    const types = computed(() => {
      const dummy: string[] = []
      for (const entry in props.typeMap) {
        // @ts-ignore
        dummy.push(props.typeMap[entry].name)
      }
      return dummy
    })

    return { dialog, createForm, editForm, types, createNode, saveNode, _aspect, addAttribute, removeAttribute, headline, close }
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-attribute-list-no-content {
  font-size: 1.2rem;
  font-weight: bold;
}

.veo-attribute-list-attribute {
  border: 1px solid $grey;
  border-radius: 4px;
}

.veo-attribute-list-add-button {
  background-color: $light-grey
}
</style>
