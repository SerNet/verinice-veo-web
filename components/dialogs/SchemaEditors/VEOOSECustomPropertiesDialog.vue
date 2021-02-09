<template>
  <VeoDialog v-model="dialog.value" :headline="headline" large persistent fixed-header>
    <template #default>
      <v-form v-model="form.valid" @submit.prevent="_item && _item.attributes ? saveNode() : createNode()">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.name"
              :label="`${$t('editor.dialog.createform.title')} *`"
              required
              :rules="form.rules.name"
              :prefix="item.prefix"
            />
          </v-col>
        </v-row>
        <v-row v-if="type === 'link'">
          <v-col class="py-0">
            <v-text-field
              v-model="form.description"
              :label="`${$t('editor.dialog.createform.linkdescription')} *`"
              required
              :rules="form.rules.description"
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
          <template v-for="(attribute, index) of _item.attributes" class="veo-attribute-list-attribute my-2">
            <VeoObjectSchemaEditorCAAttribute
              v-bind="attribute"
              :key="index"
              :aspectName="item.prefix + '' + item.title"
              @delete="removeAttribute(index)"
              @update="updateAttribute($event, index)"
            />
          </template>

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
      <v-btn color="primary" outlined @click="$emit('delete-item')">
        {{ $t(`editor.dialog.delete.${type}`) }}
      </v-btn>
      <v-spacer />
      <v-btn text color="primary" @click="close()">
        {{ $t('global.button.close') }}
      </v-btn>
      <v-btn text color="primary" :disabled="!form.valid || duplicates.length > 0" @click="saveNode()">
        {{ $t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed, Ref, useContext } from '@nuxtjs/composition-api'
import { capitalize, trim } from 'lodash'

import { VEOObjectSchemaRAW } from 'veo-objectschema-7'
import { ISchemaEndpoint } from '~/plugins/api/schema'

import VeoObjectSchemaEditorCAAttribute from '~/components/editor/ObjectSchema/VeoObjectSchemaEditorCAAttribute.vue'
import { IVeoOSHCustomAspect, IVeoOSHCustomLink, IVeoOSHCustomProperty } from '~/lib/ObjectSchemaHelper2'

interface IProps {
  value: boolean
  item: IVeoOSHCustomAspect | IVeoOSHCustomLink | undefined
  mode: string
  type: 'aspect' | 'link'
  schema: VEOObjectSchemaRAW
}

export default defineComponent<IProps>({
  components: {
    VeoObjectSchemaEditorCAAttribute
  },
  props: {
    value: { type: Boolean, required: true },
    // eslint-disable-next-line
    item: { required: true }, // No type to avoid checking for invalid prop (item can either be undefined, IVEOCustomLink or IVEOCustomAspect)
    mode: { type: String, default: 'create' },
    type: { type: String, required: true },
    schema: { type: Object, required: true }
  },
  setup(props, context) {
    const { $api } = useContext()
    /**
     * Common dialog stuff (opening and closing)
     */
    const dialog = ref({ value: props.value, mode: props.mode })

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
      description: '' as string,
      rules: {
        name: [(input: string) => trim(input).length > 0],
        description: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
        linkType: [(input: string) => props.type === 'aspect' || trim(input).length > 0]
      }
    })

    const objectTypes: Ref<{ text: string; value: string }[]> = ref([])
    $api.schema
      .fetchAll()
      .then((data: ISchemaEndpoint[]) => {
        return data.map((value: ISchemaEndpoint) => {
          return {
            text: capitalize(value.schemaName),
            value: value.schemaName
          }
        })
      })
      .then((types: { text: string; value: string }[]) => {
        objectTypes.value = types
      })

    function clearCreationForm() {
      form.value = {
        valid: false,
        name: '',
        targetType: '' as string,
        description: '' as string,
        rules: {
          name: [(input: string) => trim(input).length > 0],
          description: [(input: string) => props.type === 'aspect' || trim(input).length > 0],
          linkType: [(input: string) => props.type === 'aspect' || trim(input).length > 0]
        }
      }
    }

    function createNode() {
      context.emit('create-node', form.value)
    }

    /**
     * Edit item stuff
     */

    const _item = ref(props.item)
    watch(
      () => props.item,
      (val: IVeoOSHCustomAspect | IVeoOSHCustomLink | undefined) => {
        if (val) {
          _item.value = JSON.parse(JSON.stringify(val)) // Deep copy to avoid mutating the object passed by the prop (else we couldn't abort editing)
          form.value.name = val.title

          if (props.type === 'link') {
            form.value.targetType = (_item.value as IVeoOSHCustomLink).targetType
            form.value.description = (_item.value as IVeoOSHCustomLink).description
          }
        } else {
          _item.value = val
        }
      }
    )

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

    function updateAttribute(newValues: IVeoOSHCustomProperty, index: number) {
      if (_item.value) {
        _item.value.attributes[index] = newValues
        // We need to completely overwrite the object, else vue won't pick up the changes
        _item.value.attributes = JSON.parse(JSON.stringify(_item.value.attributes))
      }
    }

    // Aspect ID's have to be unique in a custom aspect/link
    const duplicates: Ref<string[]> = ref([])
    function checkForDuplicate() {
      duplicates.value = []
      if (_item.value) {
        ;(_item.value as IVeoOSHCustomAspect | IVeoOSHCustomLink).attributes.forEach(
          (attribute1: IVeoOSHCustomProperty) => {
            if (
              (_item.value as IVeoOSHCustomAspect | IVeoOSHCustomLink).attributes.filter(
                (attribute2: IVeoOSHCustomProperty) => attribute2.title.toLowerCase() === attribute1.title.toLowerCase()
              ).length > 1
            ) {
              const duplicateTitle = attribute1.title.toLowerCase()
              if (!duplicates.value.includes(duplicateTitle)) {
                duplicates.value.push(duplicateTitle)
              }
            }
          }
        )
      }
    }

    return {
      dialog,
      form,
      checkForDuplicate,
      duplicates,
      objectTypes,
      createNode,
      saveNode,
      _item,
      addAttribute,
      removeAttribute,
      updateAttribute,
      headline,
      close
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

.veo-attribute-list-add-button {
  background-color: $light-grey;
}
</style>
