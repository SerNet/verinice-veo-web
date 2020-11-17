<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent>
    <template #default>
      <v-window v-model="dialog.mode">
        <v-window-item value="create">
          <v-form v-model="createForm.valid" @submit.prevent="createNode()">
            <v-row>
              <v-col>
                <v-text-field v-model="createForm.name" :label="`${$t('editor.dialog.createform.title')} *`" required :rules="createForm.rules.name" />
              </v-col>
            </v-row>
            <v-row v-if="type === 'link'">
              <v-col class="py-0">
                <v-text-field v-model="createForm.targetDescription" :label="`${$t('editor.dialog.createform.linkdescription')} *`" required :rules="createForm.rules.targetDescription" />
              </v-col>
              <v-col :cols="4" class="py-0">
                <v-select v-model="createForm.targetType" :label="`${$t('editor.dialog.createform.linktype')} *`" :items="objectTypes" required :rules="createForm.rules.linkType" />
              </v-col>
            </v-row>
          </v-form>
        </v-window-item>
        <v-window-item value="edit">
          <v-form v-if="_item && _item.attributes" v-model="editForm.valid" @submit.prevent="saveNode()">
            <v-list dense class="py-0">
              <v-list-item v-for="(attribute, index) of _item.attributes" :key="index" class="veo-attribute-list-attribute my-2">
                <v-list-item-content>
                  <v-row>
                    <v-col class="py-0">
                      <v-text-field v-model="attribute.title" :label="`${$t(`editor.dialog.editform.${type}.title`)} *`" required :rules="editForm.rules.title" :prefix="_item.title +'_'" />
                    </v-col>
                    <v-col :cols="4" class="py-0">
                      <v-select v-model="attribute.type" :label="$t(`editor.dialog.editform.${type}.type`)" :items="types" />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="py-0">
                      <v-text-field v-model="attribute.description" :label="$t(`editor.dialog.editform.${type}.description`)" />
                    </v-col>
                  </v-row>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn fab depressed text color="black" @click="removeAttribute(index)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item v-if="_item.attributes.length === 0">
                <v-list-item-content class="veo-attribute-list-no-content justify-center">{{ $t(`editor.dialog.editform.${type}.noproperties`) }}</v-list-item-content>
              </v-list-item>
              <v-list-item class="veo-attribute-list-add-button">
                <v-list-item-action>
                  <v-spacer />
                  <v-btn color="primary" text>
                    <v-icon>mdi-plus-circle-outline</v-icon>
                    <span class="ml-2" @click="addAttribute()">{{ $t(`editor.dialog.editform.${type}.addproperty`) }}</span>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-form>
        </v-window-item>
      </v-window>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>
    </template>
    <template v-if="dialog.mode === 'create'" #dialog-options>
      <v-spacer />
      <v-btn text :disabled="!createForm.valid" color="black" @click="createNode()">{{ $t('global.button.next') }}</v-btn>
    </template>
    <template v-else #dialog-options>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" :disabled="!editForm.valid" @click="saveNode()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from '@nuxtjs/composition-api'
import { trim } from 'lodash'

import { VEOTypeNameRAW } from 'veo-objectschema-7'
import { IVEOCustomAspect, IVEOCustomLink } from '~/lib/ObjectSchemaHelper'
import { ITypeInfo } from '~/components/editor/ObjectSchema/ObjectSchemaEditor.vue'
import { ObjectSchemaNames } from '~/types/FormSchema'

interface IProps {
  value: boolean,
  item: IVEOCustomAspect | IVEOCustomLink | undefined,
  mode: string,
  type: 'aspect' | 'link'
  typeMap: Record<VEOTypeNameRAW, ITypeInfo>
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true },
    // eslint-disable-next-line
    item: { required: true }, // No type to avoid checking for invalid prop (item can either be undefined, IVEOCustomLink or IVEOCustomAspect)
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

      if (val) {
        clearCreationForm()
      }
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
        return context.root.$t(`editor.dialog.headline.${props.type}.create`)
      } else {
        return context.root.$t(`editor.dialog.headline.${props.type}.edit`, { title: (props.item?.title) ? `"${props.item?.title}"` : '' })
      }
    })

    function close() {
      context.emit('input', false)
    }

    /**
     * Create item stuff
     */
    const createForm = ref({
      valid: false,
      name: '',
      targetType: '' as string,
      targetDescription: '' as string,
      rules: {
        name: [(input: string) => trim(input).length > 0],
        targetDescription: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
        linktype: [(input: string) => props.type === 'aspect' || trim(input).length > 0]
      }
    })

    function clearCreationForm() {
      createForm.value = {
        valid: false,
        name: '',
        targetType: '' as string,
        targetDescription: '' as string,
        rules: {
          name: [(input: string) => trim(input).length > 0],
          targetDescription: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
          linktype: [(input: string) => props.type === 'aspect' || trim(input).length > 0]
        }
      }
    }

    function createNode() {
      context.emit('create-node', createForm.value)
    }

    /**
     * Edit item stuff
     */
    const editForm = ref({
      valid: false,
      rules: {
        title: [(input: string) => trim(input).length > 0]
      }
    })

    const _item = ref(props.item)
    watch(() => props.item, (val: IVEOCustomAspect | IVEOCustomLink | undefined) => {
      if (val) {
        _item.value = JSON.parse(JSON.stringify(val)) // Deep copy to avoid mutating the object passed by the prop (else we couldn't abort editing)
        if (_item.value) { // Remove the prefix (id of the custom aspect/property) from the title of each attribute, as it will get added back on saving.
          for (const attribute of _item.value.attributes || []) {
            attribute.title = attribute.title.replace(`${_item.value.title}_`, '')
          }
        }
      }
    })

    function saveNode() {
      context.emit('save-node', _item.value)
    }

    function addAttribute() {
      _item.value?.attributes.push({ type: 'string', title: '', description: '' })
    }

    function removeAttribute(index: number) {
      _item.value?.attributes.splice(index, 1)
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

    const objectTypes = computed(() => {
      return Object.keys(ObjectSchemaNames).map((value: string) => {
        return {
          text: context.root.$t(`unit.data.type.${value}`),
          value
        }
      })
    })

    return { dialog, createForm, editForm, types, objectTypes, createNode, saveNode, _item, addAttribute, removeAttribute, headline, close }
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
