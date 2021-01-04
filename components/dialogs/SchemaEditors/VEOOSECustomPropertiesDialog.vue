<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent>
    <template #default>
      <v-form v-model="form.valid" @submit.prevent="_item && _item.attributes ? saveNode() : createNode()">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.name"
              :label="`${$t('editor.dialog.createform.title')} *`"
              required
              :rules="form.rules.name"
              :prefix="prefixedAspectName('')"
            />
          </v-col>
          <v-col v-if="_item && _item.attributes" cols="12" md="4" class="align-self-center text-right">
            <v-btn color="primary" outlined @click="$emit('delete-item')">
              {{ $t(`editor.dialog.delete.${type}`) }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-if="type === 'link'">
          <v-col class="py-0">
            <v-text-field
              v-model="form.targetDescription"
              :label="`${$t('editor.dialog.createform.linkdescription')} *`"
              required
              :rules="form.rules.targetDescription"
            />
          </v-col>
          <v-col :cols="4" class="py-0">
            <v-select
              v-model="form.targetType"
              :label="`${$t('editor.dialog.createform.linktype')} *`"
              :items="objectTypes"
              required
              :rules="form.rules.linkType"
            />
          </v-col>
        </v-row>
        <v-list v-if="_item && _item.attributes" dense class="py-0">
          <v-list-item
            v-for="(attribute, index) of _item.attributes"
            :key="index"
            class="veo-attribute-list-attribute my-2"
          >
            <v-list-item-content>
              <v-row>
                <v-col class="py-0">
                  <v-text-field
                    v-model="attribute.title"
                    :label="`${$t(`editor.dialog.editform.${type}.title`)} *`"
                    required
                    :rules="form.rules.attributeTitle"
                    :prefix="attributeTitle"
                    @input="checkForDuplicate()"
                  />
                </v-col>
                <v-col :cols="4" class="py-0">
                  <v-select
                    v-model="attribute.type"
                    :label="$t(`editor.dialog.editform.${type}.type`)"
                    :items="types"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col class="py-0">
                  <v-text-field
                    v-model="attribute.description"
                    :label="$t(`editor.dialog.editform.${type}.description`)"
                  />
                </v-col>
              </v-row>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn fab depressed text color="black" @click="removeAttribute(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item v-if="_item.attributes.length === 0">
            <v-list-item-content class="veo-attribute-list-no-content justify-center">
              {{ $t(`editor.dialog.editform.${type}.noproperties`) }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item class="veo-attribute-list-add-button">
            <v-list-item-action>
              <v-spacer />
              <v-btn color="primary" text @click="addAttribute()">
                <v-icon>mdi-plus-circle-outline</v-icon>
                <span class="ml-2">{{ $t(`editor.dialog.editform.${type}.addproperty`) }}</span>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-form>
      <v-alert v-if="duplicates.length > 0" type="error" class="mb-4 mt-6" border="left" colored-border>
        <span>
          Es kann immer nur ein Attribut mit den folgende(n) Titel(n) existieren:
        </span>
        <ul>
          <li v-for="duplicate of duplicates" :key="duplicate">
            {{ duplicate }}
          </li>
        </ul>
      </v-alert>
      <small>{{ $t('editor.dialog.requiredfields') }}</small>
    </template>
    <template v-if="dialog.mode === 'create'" #dialog-options>
      <v-spacer />
      <v-btn text color="primary" :disabled="!form.valid" @click="createNode()">
        {{ $t('global.button.next') }}
      </v-btn>
    </template>
    <template v-else #dialog-options>
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" :disabled="!form.valid || duplicates.length > 0" @click="saveNode()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed, Ref, useContext } from '@nuxtjs/composition-api'
import { trim } from 'lodash'

import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import {
  IVEOAttribute,
  IVEOCustomAspect,
  IVEOCustomLink,
  prefixedAspectName as aspectName
} from '~/lib/ObjectSchemaHelper'
import { IInputTypes } from '~/types/VEOEditor'

interface IProps {
  value: boolean
  item: IVEOCustomAspect | IVEOCustomLink | undefined
  mode: string
  type: 'aspect' | 'link'
  schema: VEOObjectSchemaRAW
  typeMap: IInputTypes
}

export default defineComponent<IProps>({
  props: {
    value: { type: Boolean, required: true },
    // eslint-disable-next-line
    item: { required: true }, // No type to avoid checking for invalid prop (item can either be undefined, IVEOCustomLink or IVEOCustomAspect)
    mode: { type: String, default: 'create' },
    type: { type: String, required: true },
    typeMap: { type: Object, required: true },
    schema: { type: Object, required: true }
  },
  setup(props, context) {
    const { $api } = useContext()
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value, mode: props.mode })

    watch(
      () => props.value,
      (val: boolean) => {
        dialog.value.value = val

        // If an item was passed, we want to update the form with it's values. Else we want to clear the form as we are creating a new item.
        if (val) {
          if (props.item) {
            if (props.type === 'link') {
              form.value.targetType = (props.item as IVEOCustomLink).target.type
              form.value.targetDescription = (props.item as IVEOCustomLink).target.description
            }
          } else {
            clearCreationForm()
          }
        }
      }
    )

    watch(
      () => dialog.value.value,
      (val: boolean) => {
        if (!val) {
          context.emit('input', val)
        }
      }
    )

    watch(
      () => props.mode,
      (val: string) => {
        dialog.value.mode = val
      }
    )

    const headline = computed(() => {
      if (dialog.value.mode === 'create') {
        return context.root.$t(`editor.dialog.headline.${props.type}.create`)
      } else {
        return context.root.$t(`editor.dialog.headline.${props.type}.edit`, {
          title: props.item?.title ? `"${props.item?.title}"` : ''
        })
      }
    })

    function close() {
      context.emit('input', false)
    }

    /**
     * Create item stuff
     */
    const form = ref({
      valid: false,
      name: '',
      targetType: '' as string,
      targetDescription: '' as string,
      rules: {
        name: [(input: string) => trim(input).length > 0],
        targetDescription: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
        linkType: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
        attributeTitle: [(input: string) => dialog.value.mode === 'create' || trim(input).length > 0]
      }
    })

    const objectTypes: Ref<{ text: string; value: string }[]> = ref([])
    $api.schema
      .fetchAll()
      .then((data: { knownSchemas: string[] }) =>
        data.knownSchemas.map((value: string) => {
          return {
            text: value,
            value
          }
        })
      )
      .then((types: { text: string; value: string }[]) => {
        objectTypes.value = types
      })

    function clearCreationForm() {
      form.value = {
        valid: false,
        name: '',
        targetType: '' as string,
        targetDescription: '' as string,
        rules: {
          name: [(input: string) => trim(input).length > 0],
          targetDescription: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
          linkType: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
          attributeTitle: [(input: string) => dialog.value.mode === 'create' || trim(input).length > 0]
        }
      }
    }

    function createNode() {
      context.emit('create-node', form.value)
    }

    /**
     * Edit item stuff
     */
    // Generate an array containing all type names from the type map.
    const types = computed(() => {
      const dummy: string[] = []
      for (const entry in props.typeMap) {
        // @ts-ignore
        dummy.push(props.typeMap[entry].name)
      }
      return dummy
    })

    // Update item attributes if the form gets updated (we use a form and not the item itself as a v-model as the item doesn't exist on creation).
    watch(
      () => form.value,
      () => {
        if (_item.value) {
          if (props.type === 'link') {
            ;(_item.value as IVEOCustomLink).target = {
              type: form.value.targetType,
              description: form.value.targetDescription
            }
          }
        }
      },
      { deep: true }
    )

    const _item = ref(props.item)
    watch(
      () => props.item,
      (val: IVEOCustomAspect | IVEOCustomLink | undefined) => {
        if (val) {
          _item.value = JSON.parse(JSON.stringify(val)) // Deep copy to avoid mutating the object passed by the prop (else we couldn't abort editing)
          form.value.name = val.title

          if (props.type === 'link') {
            form.value.targetType = (_item.value as IVEOCustomLink).target.type
            form.value.targetDescription = (_item.value as IVEOCustomLink).target.description
          }
        } else {
          _item.value = val
        }
      }
    )

    function prefixedAspectName(aspect: string): string {
      return aspectName(props.schema, aspect)
    }

    function saveNode() {
      context.emit('save-node', { item: _item.value, id: props.item?.title })
    }

    function addAttribute() {
      _item.value?.attributes.push({
        type: 'string',
        title: '',
        description: ''
      })
    }

    function removeAttribute(index: number) {
      _item.value?.attributes.splice(index, 1)
    }

    // Aspect ID's have to be unique in a custom aspect/link
    const duplicates: Ref<string[]> = ref([])
    function checkForDuplicate() {
      duplicates.value = []
      if (_item.value) {
        ;(_item.value as IVEOCustomAspect | IVEOCustomLink).attributes.forEach((attribute1: IVEOAttribute) => {
          if (
            (_item.value as IVEOCustomAspect | IVEOCustomLink).attributes.filter(
              (attribute2: IVEOAttribute) => attribute2.title.toLowerCase() === attribute1.title.toLowerCase()
            ).length > 1
          ) {
            const duplicateTitle = attribute1.title.toLowerCase()
            if (!duplicates.value.includes(duplicateTitle)) {
              duplicates.value.push(duplicateTitle)
            }
          }
        })
      }
    }

    const attributeTitle = computed(() => prefixedAspectName(form.value.name) + '_')

    return {
      dialog,
      form,
      checkForDuplicate,
      duplicates,
      types,
      objectTypes,
      createNode,
      saveNode,
      _item,
      addAttribute,
      removeAttribute,
      headline,
      close,
      prefixedAspectName,
      attributeTitle
    }
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
  background-color: $light-grey;
}
</style>
