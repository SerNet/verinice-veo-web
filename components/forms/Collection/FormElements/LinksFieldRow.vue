<template>
  <v-row dense class="flex-column">
    <v-col>
      <!-- TODO: change name with displayName after it is implemented -->
      <v-autocomplete
        :key="index"
        v-model="selected"
        :loading="loading"
        :items="items"
        item-text="name"
        item-value="id"
        :search-input.sync="search"
        :label="$t('targetObject')"
        class="links-field-row-autocomplete"
        dense
        hide-details="auto"
        clearable
      >
        <template #prepend-item>
          <v-btn color="primary" block text tile @click.stop="onDialogOpen('DIALOG_CREATE')">
            {{ $t('createTargetObject') }}
          </v-btn>
          <v-divider />
        </template>
        <template #no-data>
          <v-list-item>
            <v-list-item-title>
              {{ $t('noTargets') }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <template #item="{ item, on, attrs }">
          <v-list-item v-bind="attrs" class="autocomplete-list-item" v-on="on">
            <v-list-item-content>
              <!-- TODO: change name with displayName after it is implemented -->
              <v-list-item-title v-text="item.name" />
            </v-list-item-content>
            <v-list-item-action>
              <div class="autocomplete-list-item-action-buttons">
                <v-btn icon x-small text color="primary" class="mr-2" @click.stop="onDialogOpen('DIALOG_UPDATE', item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon x-small text color="primary" class="mr-2" @click.stop="onDialogOpen('DIALOG_DELETE', item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col v-if="ui.elements.length > 0">
      <VeoForm
        :schema="schema.items"
        :ui="ui"
        :value="value"
        :general-translation="generalTranslation"
        :custom-translation="customTranslation"
        :api="api"
        @input="onInput"
      />
    </v-col>
    <v-col v-else class="py-4 pl-1 links-field-row-no-attributes font-italic">
      {{ $t('noAttributes') }}
    </v-col>
    <v-dialog :value="!!dialog" persistent max-width="500" @input="dialog = !$event ? false : dialog">
      <v-card v-if="dialog === 'DIALOG_CREATE'">
        <v-card-title class="headline">
          {{ $t('createTargetObject') }}
        </v-card-title>
        <v-card-text>
          <VeoForm
            v-model="newObject"
            :schema="linksFieldDialogObjectSchema"
            :ui="linksFieldDialogFormSchema"
            :general-translation="generalTranslation"
            :custom-translation="customTranslation"
            :api="api"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            {{ $t('global.button.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            :disabled="!newObject || !newObject.name"
            @click="onDialogAcceptCreate"
          >
            {{ $t('global.button.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="dialog === 'DIALOG_UPDATE'">
        <v-card-title class="headline">
          {{ $t('updateTargetObject') }}
        </v-card-title>
        <v-card-text>
          <!-- TODO: ObjectSchema and FormSchema for Dialog must come from Server (Person) -->
          <VeoForm
            v-model="itemInDialog"
            :schema="linksFieldDialogObjectSchema"
            :ui="linksFieldDialogFormSchema"
            :general-translation="generalTranslation"
            :custom-translation="customTranslation"
            :api="api"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            {{ $t('global.button.cancel') }}
          </v-btn>
          <!-- TODO: change name with displayName after it is implemented -->
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            :disabled="!(itemInDialog && itemInDialog.name)"
            @click="onDialogAcceptUpdate"
          >
            {{ $t('global.button.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="dialog === 'DIALOG_DELETE'">
        <v-card-title>
          {{ $t('deleteTargetObject') }}
        </v-card-title>
        <!-- TODO: change name with displayName after it is implemented -->
        <v-card-text>
          {{
            $t('deleteTargetObjectConfirmation', {
              object: itemInDialog && itemInDialog.name
            })
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            {{ $t('global.button.cancel') }}
          </v-btn>
          <v-btn color="primary" :loading="dialogLoading" text @click="onDialogAcceptDelete">
            {{ $t('global.button.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
  <!--<div class="d-flex" :class="directionClass">-->
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { JSONSchema7 } from 'json-schema'
import vjp from 'vue-json-pointer'
import { UISchema, UISchemaElement } from '@/types/UISchema'
import {
  BaseObject,
  IApi,
  ILinksFieldDialogNewObject,
  linksFieldDialogObjectSchema,
  linksFieldDialogFormSchema
} from '~/components/forms/utils'
import {
  IVeoFormSchemaTranslationCollectionItem,
  IVeoTranslation
} from '~/types/VeoTypes'

interface ITarget {
  targetUri: string | undefined
  type: string
}

interface IItem {
  name: string
  // TODO: activate displayName after it is implemented
  // displayName: string
  owner: {
    targetUri: string
  }
  id: string
  [key: string]: any
}

type DialogEnum = 'DIALOG_CREATE' | 'DIALOG_UPDATE' | 'DIALOG_DELETE'

interface IData {
  dialog: DialogEnum | false
  loading: boolean
  dialogLoading: boolean
  search: string | undefined
  items: IItem[]
  itemInDialog: IItem | undefined
  newObject: ILinksFieldDialogNewObject
  targetId: string | undefined
  objectTypePluralMap: BaseObject
  linksFieldDialogObjectSchema: JSONSchema7
  linksFieldDialogFormSchema: UISchema
}

export default Vue.extend({
  name: 'LinksFieldRow',
  components: {
    // !!!IMPORTANT: this line makes sure, that VeoForm.vue component properly works in the project and in Rollup bundle
    VeoForm: async () => (await import('~/components/forms/VeoForm.vue')).default
  },
  props: {
    value: {
      type: Object,
      default: () => {}
    } as PropOptions<BaseObject>,
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    elements: {
      type: Array,
      default: () => []
    } as PropOptions<UISchemaElement[]>,
    api: {
      type: Object,
      default: () => undefined
    } as PropOptions<IApi>,
    index: { type: Number, default: undefined }
  },
  data(): IData {
    return {
      dialog: false,
      loading: false,
      dialogLoading: false,
      search: undefined,
      items: [],
      itemInDialog: undefined,
      newObject: {},
      targetId: undefined,
      objectTypePluralMap: {
        process: 'processes',
        person: 'persons',
        asset: 'assets',
        control: 'controls'
      },
      linksFieldDialogObjectSchema: { ...linksFieldDialogObjectSchema },
      linksFieldDialogFormSchema: { ...linksFieldDialogFormSchema }
    }
  },
  computed: {
    directionClass(): string {
      return this.options && this.options.direction === 'vertical'
        ? 'flex-column direction-vertical'
        : 'flex-row direction-horizontal'
    },
    ui() {
      return {
        type: 'Layout',
        options: {
          direction: this.options && this.options.direction === 'vertical' ? 'vertical' : 'horizontal',
          format: 'group',
          highlight: false
        },
        elements: this.elements
      }
    },
    targetUri(): string | undefined {
      return this.targetId ? `/${this.objectTypePluralMap[this.targetType]}/${this.targetId}` : undefined
    },
    targetType(): string {
      // TODO: replace this function by the line below, after target.type in ObjectSchema is replaced by "person", "process", etc
      // return (this.schema.items as any).properties.target.properties
      //   .type.enum[0]
      return (this.schema.items as any).properties.target.properties.type.enum[0]
    },
    target(): ITarget | undefined {
      return {
        targetUri: this.targetUri,
        type: this.targetType
        // TODO: Missing name?
      }
    },
    selected: {
      get() {
        const selected = this.value?.target?.targetUri?.split('/')?.pop()
        return selected || undefined
      },
      set(val: string | undefined) {
        this.onInputAutocomplete(val)
      }
    }
  },
  watch: {
    value: {
      async handler(v: BaseObject) {
        const displayName = v?.target?.displayName
        await this.fetchItems(displayName)
      },
      immediate: true
    },
    search: {
      async handler(val: string | undefined | null) {
        if (val) {
          const item = this.items.find(el => el.name === val)
          //  TODO: change name with displayName after it is implemented
          if (!item || (item && item.id !== this.selected)) {
            await this.fetchItems(val)
          }
        } else {
          await this.fetchItems()
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchItems(filter?: string) {
      this.loading = true
      try {
        const displayFilter = filter ? { displayName: filter } : undefined
        // TODO: Limit result count with pagination API
        const items = (await this.api.fetchAll(this.targetType, displayFilter)) as IItem[]
        this.items = items.slice(0, 100)
      } finally {
        this.loading = false
      }
    },
    onInput(event: any) {
      this.$emit('input', event)
    },
    onDialogOpen(dialogType: DialogEnum, item?: IItem) {
      this.dialog = dialogType

      if (item) {
        this.itemInDialog = item
      }
    },
    onDialogCancel() {
      this.dialog = false
      this.newObject = {}
      this.itemInDialog = undefined
    },
    async onDialogAcceptCreate() {
      this.dialogLoading = true
      if (this.newObject) {
        const createItem = (await this.api.create(this.targetType, this.newObject)) as IItem
        this.items.push(createItem)
        this.selected = createItem.id
      }
      this.dialogLoading = false
      this.dialog = false
      this.newObject = {}
    },
    async onDialogAcceptUpdate() {
      this.dialogLoading = true
      if (this.itemInDialog) {
        await this.api.update(this.targetType, this.itemInDialog)
        const itemIndex = this.items.findIndex(item => this.itemInDialog && item.id === this.itemInDialog.id)
        this.items.splice(itemIndex, 1, this.itemInDialog)
      }
      this.dialogLoading = false
      this.dialog = false
      this.newObject = {}
    },
    async onDialogAcceptDelete() {
      this.dialogLoading = true
      if (this.itemInDialog) {
        await this.api.delete(this.targetType, this.itemInDialog.id)
        const itemIndex = this.items.findIndex(item => this.itemInDialog && item.id === this.itemInDialog.id)
        this.items.splice(itemIndex, 1)
      }
      this.dialogLoading = false
      this.dialog = false
      this.newObject = {}
    },
    onInputAutocomplete(event: string | undefined) {
      this.targetId = event
      vjp.set(this.value, '/target', {
        ...this.target,
        targetUri: this.targetUri
      })
      this.$emit('input', this.value)
    }
  }
})
</script>

<i18n>
{
  "en": {
    "noAttributes": "No child properties",
    "targetObject": "Target object",
    "createTargetObject": "Create new object",
    "updateTargetObject": "Change object",
    "deleteTargetObject": "Delete object",
    "deleteTargetObjectConfirmation": "Are you sure you want to delete \"{object}\"?",
    "noTargets": "Not targets found"
  },
  "de": {
    "noAttributes": "Keine weiteren Eigenschaften",
    "targetObject": "Zielobjekt",
    "updateTargetObject": "Objekt ändern",
    "createTargetObject": "Ein neues Objekt anlegen",
    "deleteTargetObject": "Objekt löschen",
    "deleteTargetObjectConfirmation": "Sind sie sicher, dass das Objekt \"{object}\" gelöscht werden soll?",
    "noTargets": "Keine Ziele verfügbar"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.vf-links-field .vf-wrapper {
  overflow: hidden;
  width: auto;
  max-width: none;
}

::v-deep .autocomplete-list-item .autocomplete-list-item-action-buttons {
  opacity: 0;
  transition: opacity 300ms;
}

::v-deep .autocomplete-list-item:hover .autocomplete-list-item-action-buttons {
  opacity: 1;
}

.vf-links-field .direction-vertical > .links-field-row-autocomplete {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}
.vf-links-field .direction-horizontal > .links-field-row-autocomplete {
  margin-top: 12px !important;
  margin-bottom: 12px !important;
}

.vf-links-field .direction-horizontal ::v-deep .vf-control {
  margin: 0 0 0 5px;
}

.links-field-row-autocomplete {
  max-width: 350px;
}

.links-field-row-no-attributes {
  color: $grey;
}
</style>
