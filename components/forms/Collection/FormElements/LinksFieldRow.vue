<template>
  <div class="d-flex">
    <VeoForm
      :schema="schema.items"
      :ui="ui"
      :value="value"
      :lang="lang"
      :api="api"
      @input="onInput"
    />
    <!-- TODO: change name with displayName after it is implemented -->
    <v-autocomplete
      :key="index"
      v-model="selected"
      :loading="loading"
      :items="items"
      item-text="name"
      item-value="id"
      :search-input.sync="search"
      label="Target Objekt"
      clearable
    >
      <template #prepend-item>
        <v-btn
          color="primary"
          block
          text
          tile
          @click.stop="onDialogOpen('DIALOG_CREATE')"
        >
          Erstellen
        </v-btn>
        <v-divider />
      </template>
      <template #no-data>
        <v-list-item>
          <v-list-item-title>
            Nicht gefunden!
          </v-list-item-title>
        </v-list-item>
      </template>

      <template #item="{ item, on, attrs }">
        <v-list-item v-bind="attrs" class="autcomplete-list-item" v-on="on">
          <v-list-item-content>
            <!-- TODO: change name with displayName after it is implemented -->
            <v-list-item-title v-text="item.name" />
          </v-list-item-content>
          <v-list-item-action>
            <div class="autocomplete-list-item-action-buttons">
              <v-btn
                icon
                x-small
                text
                color="primary"
                class="mr-2"
                @click.stop="onDialogOpen('DIALOG_UPDATE', item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                x-small
                text
                color="primary"
                class="mr-2"
                @click.stop="onDialogOpen('DIALOG_DELETE', item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-autocomplete>

    <v-dialog
      :value="!!dialog"
      persistent
      max-width="500"
      @input="dialog = !$event ? false : dialog"
    >
      <v-card v-if="dialog === 'DIALOG_CREATE'">
        <v-card-title class="headline">Ein neues Objekt anlegen</v-card-title>
        <v-card-text>
          <VeoForm
            v-model="newObject"
            :schema="linksFieldDialogObjectSchema"
            :ui="linksFieldDialogFormSchema"
            :lang="lang"
            :api="api"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            Abbrechen
          </v-btn>
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            :disabled="!newObject || !newObject.name"
            @click="onDialogAcceptCreate"
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="dialog === 'DIALOG_UPDATE'">
        <v-card-title class="headline">Das Objekt ändern</v-card-title>
        <v-card-text>
          <!-- TODO: ObjectSchema and FormSchema for Dialog must come from Server (Person) -->
          <VeoForm
            v-model="itemInDialog"
            :schema="linksFieldDialogObjectSchema"
            :ui="linksFieldDialogFormSchema"
            :lang="lang"
            :api="api"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            Abbrechen
          </v-btn>
          <!-- TODO: change name with displayName after it is implemented -->
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            :disabled="!itemInDialog.name"
            @click="onDialogAcceptUpdate"
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card v-else-if="dialog === 'DIALOG_DELETE'">
        <v-card-title>Objekt Löschen</v-card-title>
        <!-- TODO: change name with displayName after it is implemented -->
        <v-card-text>
          Sind sie sicher, dass das Objekt "{{ itemInDialog.name }}" gelöscht
          werden soll?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="onDialogCancel">
            Abbrechen
          </v-btn>
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            @click="onDialogAcceptDelete"
          >
            Bestätigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7, JSONSchema7Type } from 'json-schema'
import vjp from 'vue-json-pointer'
import { UISchema } from '@/types/UISchema'
import {
  BaseObject,
  IApi,
  ILinksFieldDialogNewObject,
  linksFieldDialogObjectSchema,
  linksFieldDialogFormSchema
} from '~/components/forms/utils'
import {
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

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

enum DialogEnum {
  CREATE = 'DIALOG_CREATE',
  UPDATE = 'DIALOG_UPDATE',
  DELETE = 'DIALOG_DELETE',
}

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
    VeoForm: async() => (await import('~/components/forms/VeoForm.vue')).default
  },
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    elements: Array,
    validation: Object,
    value: {
      type: Object as Prop<BaseObject>
    },
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>,
    index: Number
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
    ui() {
      return {
        type: 'Layout',
        options: {
          direction:
            this.options && this.options.direction === 'vertical'
              ? 'vertical'
              : 'horizontal',
          format: 'group'
        },
        elements: this.elements
      }
    },
    targetUri(): string | undefined {
      return this.targetId
        ? `/${this.objectTypePluralMap[this.targetType]}/${this.targetId}`
        : undefined
    },
    targetType(): string {
      // TODO: replace this function by the line below, after target.type in ObjectSchema is replaced by "person", "process", etc
      // return (this.schema.items as any).properties.target.properties
      //   .type.enum[0]
      return (this.schema
        .items as any).properties.target.properties.type.enum[0].toLowerCase()
    },
    target(): ITarget | undefined {
      return {
        targetUri: this.targetUri,
        type: this.targetType
      }
    },
    selected: {
      get() {
        let id =
          this.value &&
          this.value.target &&
          this.value.target.targetUri &&
          this.value.target.targetUri.split('/')
        id = id && id.length > 0 ? id.pop() : undefined
        return id || undefined
      },
      set(val: string | undefined) {
        this.onInputAutocomplete(val)
      }
    }
  },
  watch: {
    async search(val: string | undefined | null) {
      if (val) {
        const item = this.items.find(el => el.name === val)
        //  TODO: change name with displayName after it is implemented
        if (!item || (item && item.id !== this.selected)) {
          this.loading = true
          this.items = (await this.api.fetchAll(this.targetType, {
            displayName: val
          })) as any
          this.loading = false
        }
      }
    }
  },
  methods: {
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
        const createItem = (await this.api.create(
          this.targetType,
          this.newObject
        )) as IItem
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
        const itemIndex = this.items.findIndex(
          item => this.itemInDialog && item.id === this.itemInDialog.id
        )
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
        const itemIndex = this.items.findIndex(
          item => this.itemInDialog && item.id === this.itemInDialog.id
        )
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

<style lang="scss" scoped>
::v-deep .vf-control.col {
  padding: 0 5px 0 0;
}

::v-deep .autcomplete-list-item .autocomplete-list-item-action-buttons {
  opacity: 0;
  transition: opacity 300ms;
}

::v-deep .autcomplete-list-item:hover .autocomplete-list-item-action-buttons {
  opacity: 1;
}
</style>
