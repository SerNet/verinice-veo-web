<template>
  <v-row
    dense
    class="flex-column"
  >
    <v-col :class="noAttributesClass">
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
        :disabled="disabled"
        :placeholder="$t('search_placeholder')"
        dense
        hide-details="auto"
        clearable
        no-filter
      >
        <template #prepend-item>
          <v-btn
            color="primary"
            block
            text
            tile
            @click.stop="onDialogOpen('DIALOG_CREATE')"
          >
            <span v-if="currentForm">
              {{ $t('createTargetForm', { type: currentForm.name }) }}
            </span>
            <span v-else>
              {{ $t('createTargetObject') }}
            </span>
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
          <v-list-item
            v-bind="attrs"
            class="autocomplete-list-item"
            v-on="on"
          >
            <v-list-item-content>
              <!-- TODO: change name with displayName after it is implemented -->
              <v-list-item-title>{{ item.displayName }} </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <div class="autocomplete-list-item-action-buttons">
                <v-btn
                  icon
                  x-small
                  text
                  color="primary"
                  class="mr-2"
                  :disabled="disabled"
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
                  :disabled="disabled"
                  @click.stop="onDialogOpen('DIALOG_DELETE', item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-list-item-action>
          </v-list-item>
        </template>
        <template
          v-if="totalItems > itemsPerPage"
          #append-item
        >
          <v-list-item two-line>
            {{ $t('be_more_specific') }}
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
        :disabled="disabled"
        @input="onInput"
      />
    </v-col>
    <v-dialog
      :value="!!dialog"
      persistent
      max-width="500"
      @input="dialog = !$event ? false : dialog"
    >
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
            :disabled="disabled"
            :api="api"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="onDialogCancel"
          >
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
            :disabled="disabled"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="onDialogCancel"
          >
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
          <v-btn
            color="primary"
            text
            @click="onDialogCancel"
          >
            {{ $t('global.button.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="dialogLoading"
            text
            @click="onDialogAcceptDelete"
          >
            {{ $t('global.button.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { JSONSchema7 } from 'json-schema';
import vjp from 'vue-json-pointer';
import { UISchema, UISchemaElement } from '@/types/UISchema';
import { BaseObject, IApi, ILinksFieldDialogNewObject, linksFieldDialogObjectSchema, linksFieldDialogFormSchema } from '~/components/forms/utils';
import { IVeoFormSchemaMeta, IVeoFormSchemaTranslationCollectionItem, IVeoTranslationCollection } from '~/types/VeoTypes';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { separateUUIDParam } from '~/lib/utils';

interface ITarget {
  targetUri: string | undefined;
  type: string;
}

interface IItem {
  name: string;
  // TODO: activate displayName after it is implemented
  // displayName: string
  owner: {
    targetUri: string;
  };
  id: string;
  [key: string]: any;
}

type DialogEnum = 'DIALOG_CREATE' | 'DIALOG_UPDATE' | 'DIALOG_DELETE';

interface IData {
  dialog: DialogEnum | false;
  loading: boolean;
  dialogLoading: boolean;
  search: string | undefined;
  items: IItem[];
  itemInDialog: IItem | undefined;
  newObject: ILinksFieldDialogNewObject;
  targetId: string | undefined;
  linksFieldDialogObjectSchema: JSONSchema7;
  linksFieldDialogFormSchema: UISchema;
  currentForm: IVeoFormSchemaMeta | undefined;
  totalItems: number;
  initialized: boolean;
  schemas: IVeoSchemaEndpoint[];
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
    } as PropOptions<IVeoTranslationCollection>,
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
      linksFieldDialogObjectSchema: { ...linksFieldDialogObjectSchema },
      linksFieldDialogFormSchema: { ...linksFieldDialogFormSchema },
      currentForm: undefined,
      totalItems: 0 as number,
      initialized: false,
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    this.schemas = await this.$api.schema.fetchAll();
  },
  computed: {
    ui() {
      return {
        type: 'Layout',
        options: {
          format: 'group'
        },
        elements: this.elements
      };
    },
    targetUri(): string | undefined {
      return this.targetId ? `/${getSchemaEndpoint(this.schemas, this.targetType)}/${this.targetId}` : undefined;
    },
    targetType(): string {
      return (this.schema.items as any).properties.target.properties.type.enum[0];
    },
    subType(): string | undefined {
      return (this.schema.items as any).properties.target.properties.subType?.enum[0];
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    target(): ITarget | undefined {
      return {
        targetUri: this.targetUri,
        type: this.targetType
        // TODO: Missing name?
      };
    },
    selected: {
      get(): string | undefined {
        const selected = this.value?.target?.targetUri?.split('/')?.pop();
        return selected || undefined;
      },
      set(val: string | undefined) {
        this.onInputAutocomplete(val);
      }
    },
    noAttributesClass(): string {
      return this.ui.elements.length === 0 ? 'mb-4' : '';
    },
    itemsPerPage(): number {
      return this.$user.tablePageSize;
    }
  },
  watch: {
    value: {
      async handler(v: BaseObject) {
        const displayName = v?.target?.displayName;
        this.initialized = false;
        await this.fetchItems(displayName);
        this.initialized = true;
      },
      immediate: true,
      deep: true
    },
    search: {
      async handler(val: string | undefined | null) {
        // Only call if initialized (as we don't want to overwrite the fetch called by the value watcher)
        if (this.initialized) {
          if (val) {
            const item = this.items.find((el) => el.name === val);
            //  TODO: change name with displayName after it is implemented
            if (!item || (item && item.id !== this.selected)) {
              await this.fetchItems(val);
            }
          } else {
            await this.fetchItems();
          }
        }
      }
    }
  },
  methods: {
    async fetchItems(filter?: string) {
      this.loading = true;

      // Filter out the display name of the currently edited object
      const filters = {
        ...(filter ? { displayName: filter } : {}),
        ...(this.subType ? { subType: this.subType } : {})
      };

      try {
        // TODO: Limit result count with pagination API
        const entities = await this.api.fetchAll(this.targetType, filters);
        this.items = entities.items;
        this.totalItems = entities.totalItemCount;

        if (this.subType) {
          const forms = await this.$api.form.fetchAll();
          this.currentForm = forms.find((form) => form.subType === this.subType);
        }
      } finally {
        this.loading = false;
      }
    },
    onInput(event: any) {
      this.$emit('input', event);
    },
    onDialogOpen(dialogType: DialogEnum, item?: IItem) {
      this.dialog = dialogType;

      if (item) {
        this.itemInDialog = item;
      }
    },
    onDialogCancel() {
      this.dialog = false;
      this.newObject = {};
      this.itemInDialog = undefined;
    },
    async onDialogAcceptCreate() {
      this.dialogLoading = true;
      if (this.newObject) {
        const domainObject = { targetUri: `/domains/${this.domainId}` };
        this.newObject.domains = [domainObject];

        if (this.subType) {
          this.newObject.subType = { [this.domainId]: this.subType };
        }

        const createItem = (await this.api.create(this.targetType, this.newObject)) as IItem;
        this.items.push(createItem);
        this.selected = createItem.id;
      }
      this.dialogLoading = false;
      this.dialog = false;
      this.newObject = {};
    },
    async onDialogAcceptUpdate() {
      this.dialogLoading = true;
      if (this.itemInDialog) {
        await this.api.update(this.targetType, this.itemInDialog);
        const itemIndex = this.items.findIndex((item) => this.itemInDialog && item.id === this.itemInDialog.id);
        this.items.splice(itemIndex, 1, this.itemInDialog);
      }
      this.dialogLoading = false;
      this.dialog = false;
      this.newObject = {};
    },
    async onDialogAcceptDelete() {
      this.dialogLoading = true;
      if (this.itemInDialog) {
        await this.api.delete(this.targetType, this.itemInDialog.id);
        const itemIndex = this.items.findIndex((item) => this.itemInDialog && item.id === this.itemInDialog.id);
        this.items.splice(itemIndex, 1);
      }
      this.dialogLoading = false;
      this.dialog = false;
      this.newObject = {};
    },
    onInputAutocomplete(event: string | undefined) {
      this.targetId = event;
      vjp.set(this.value, '/target', {
        ...this.target,
        targetUri: this.targetUri
      });
      this.$emit('input', this.value);
    }
  }
});
</script>

<i18n>
{
  "en": {
    "be_more_specific": "Please be more specific to show additional objects",
    "targetObject": "Target object",
    "createTargetObject": "Create new object",
    "createTargetForm": "Create {type}",
    "updateTargetObject": "Change object",
    "deleteTargetObject": "Delete object",
    "deleteTargetObjectConfirmation": "Are you sure you want to delete \"{object}\"?",
    "noTargets": "Not targets found",
    "search_placeholder": "Start typing to search for objects to link"
  },
  "de": {
    "be_more_specific": "Bitte gebe weitere Zeichen ein um die Auswahl einzuschränken",
    "targetObject": "Zielobjekt",
    "updateTargetObject": "Objekt ändern",
    "createTargetObject": "Ein neues Objekt anlegen",
    "createTargetForm": "{type} erstellen",
    "deleteTargetObject": "Objekt löschen",
    "deleteTargetObjectConfirmation": "Sind sie sicher, dass das Objekt \"{object}\" gelöscht werden soll?",
    "noTargets": "Keine Ziele verfügbar",
    "search_placeholder": "Nach Namen des zu verknüpfenden Objektes suchen"
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

.links-field-row-autocomplete {
  max-width: 350px;
}
</style>
