<template>
  <div
    v-if="$fetchState.pending"
    class="fill-width fill-height d-flex justify-center align-center"
  >
    <v-progress-circular
      indeterminate
      color="primary"
      size="50"
    />
  </div>
  <VeoPageWrapper v-else>
    <VeoPage
      v-if="!contentsCollapsed && formSchemaHasGroups"
      :cols="2"
      :md="2"
      :xl="2"
      absolute-size
    >
      <div
        class="button text-uppercase accent--text font-weight-medium my-2"
      >
        {{ $t('navigation.title') }}
      </div>
      <VeoFormNavigation
        :form-schema="form.formSchema && form.formSchema.content"
        :custom-translation="
          form.formSchema && form.formSchema.translation && form.formSchema.translation[$i18n.locale]
        "
        class="mx-n4"
      />
    </VeoPage>
    <v-divider vertical />
    <VeoPage
      id="scroll-wrapper"
      absolute-size
      :cols="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      :md="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      :xl="!contentsCollapsed && formSchemaHasGroups ? 6 : 8"
      sticky-header
    >
      <template #header>
        <VeoCollapseButton
          v-if="!$vuetify.breakpoint.xs && formSchemaHasGroups"
          v-model="contentsCollapsed"
        />
        <v-row class="justify-space-between">
          <v-col cols="auto">
            <h1 v-if="!isRevision">
              {{ form.objectData.displayName }}
            </h1>
            <h1 v-else>
              {{ form.objectData.displayName }} ({{ $t('revision') }} {{ revisionVersion }})
            </h1>
          </v-col>
          <v-spacer />
          <v-col
            cols="auto"
            class="text-right"
          >
            <v-btn
              text
              outlined
              @click="doDiscard"
            >
              {{ $t('global.button.discard') }}
            </v-btn>
            <v-btn
              v-if="!isRevision"
              color="primary"
              outlined
              text
              :loading="saveBtnLoading"
              @click="onClick"
            >
              {{ saveBtnText }}
            </v-btn>
            <v-btn
              v-else
              color="primary"
              outlined
              text
              :loading="saveBtnLoading"
              :disabled="!allowRestoration"
              @click="onClick"
            >
              {{ $t('restore') }}
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <template #default>
        <VeoForm
          v-if="canShowData"
          v-model="form.objectData"
          :schema="form.objectSchema"
          :ui="form.formSchema && form.formSchema.content"
          :general-translation="form.lang && form.lang[$i18n.locale]"
          :custom-translation="
            form.formSchema && form.formSchema.translation && form.formSchema.translation[$i18n.locale]
          "
          :api="dynamicAPI"
          :is-valid.sync="isValid"
          :error-messages.sync="errorMessages"
          :disabled="isRevision && !allowRestoration"
          @input="formModified.isModified = true"
        />
        <div
          v-else
          class="fill-height text-center d-flex flex-column"
        >
          <v-icon
            style="font-size: 8rem; opacity: 0.5;"
            color="primary"
          >
            mdi-information-outline
          </v-icon>
          <h3 class="text-left">
            {{ $t('incompatibleFormSchema', { objectType }) }}
          </h3>
        </div>
        <VeoEntityModifiedDialog
          v-model="formModified.dialog"
          :item="form.objectData"
          @exit="$router.push(formModified.target)"
        />
        <VeoWindowUnloadPrevention :value="formModified.isModified" />
        <!-- seperate modified dialog for version switching to avoid interferences -->
        <VeoEntityModifiedDialog
          v-model="formModified.revisionDialog"
          :item="form.objectData"
          @exit="showRevisionAfterDialog()"
        />
        <VeoAlert
          v-model="alert.value"
          v-bind="alert"
          style="position: fixed; width: 60%; bottom: 0; left: 20%; z-index: 1"
        >
          <template
            v-if="alert.error === 412"
            #additional-button
          >
            <v-btn
              outlined
              text
              color="error"
              @click="$fetch()"
            >
              {{ $t('global.button.yes') }}
            </v-btn>
          </template>
        </VeoAlert>
      </template>
    </VeoPage>
    <v-divider vertical />
    <VeoPage
      v-if="!$vuetify.breakpoint.xsOnly"
      :cols="4"
      :md="4"
      :xl="4"
      absolute-size
    >
      <VeoTabs sticky-tabs>
        <template #tabs>
          <v-tab :disabled="!$route.params.entity">
            {{ $t('history') }}
          </v-tab>
        </template>
        <template #items>
          <v-tab-item>
            <VeoObjectHistory
              :object="form.objectData"
              :schema="form.objectSchema"
              :loading="$fetchState.pending"
              @show-revision="showRevision"
            />
          </v-tab-item>
        </template>
      </VeoTabs>
    </VeoPage>
  </VeoPageWrapper>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash';
import Vue from 'vue';
import { Route } from 'vue-router/types/index';
import ObjectSchemaValidator from '~/lib/ObjectSchemaValidator';

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils';
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoEntity, IVeoFormSchema, IVeoObjectHistoryEntry, IVeoObjectSchema } from '~/types/VeoTypes';
import VeoReactiveFormActionMixin from '~/mixins/objects/VeoReactiveFormActionMixin';
import { validate } from '~/lib/FormSchemaHelper';

export interface IValidationErrorMessage {
  pointer: string;
  message: string;
}

interface IData {
  objectType: string;
  form: IForm;
  isValid: boolean;
  isRevision: boolean;
  allowRestoration: boolean;
  revisionVersion: number;
  revisionCache: IBaseObject;
  errorMessages: IValidationErrorMessage[];
  saveBtnLoading: boolean;
  alert: IVeoEventPayload & { value: boolean; error: number };
  contentsCollapsed: boolean;
  formModified: {
    isModified: boolean;
    dialog: boolean;
    revisionDialog: boolean;
    target?: any;
  };
}

export default Vue.extend({
  name: 'VeoFormsObjectDataUpdate',
  mixins: [VeoReactiveFormActionMixin],
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if (this.formModified.isModified && this.formModified.dialog) {
      next();
    } else if (this.formModified.isModified) {
      // If the form was modified and the dialog is closed, show it and abort navigation
      this.formModified.target = to;
      this.formModified.dialog = true;
      next(false);
    } else {
      // The form wasn't modified, proceed as if this hook doesn't exist
      next();
    }
  },
  data(): IData {
    return {
      objectType: '',
      form: {
        objectSchema: {},
        objectData: {},
        formSchema: undefined,
        lang: {}
      },
      isValid: true,
      isRevision: false,
      allowRestoration: false,
      revisionVersion: 0,
      revisionCache: {},
      errorMessages: [],
      saveBtnLoading: false,
      alert: {
        value: false,
        text: '',
        type: 0,
        title: this.$t('error.title') as string,
        saveButtonText: this.$t('global.button.no') as string,
        error: 0 as number
      },
      contentsCollapsed: false as boolean,
      formModified: {
        isModified: false,
        dialog: false,
        revisionDialog: false,
        target: undefined
      }
    };
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.formId);

    this.objectType = formSchema.modelType;
    if (this.objectType) {
      const objectSchema = await this.$api.schema.fetch(this.objectType);
      const objectData = this.$route.params.entity ? await this.$api.entity.fetch(this.objectType, this.objectId) : {};
      const { lang } = await this.$api.translation.fetch(['de', 'en']);
      this.form = {
        objectSchema,
        formSchema,
        objectData,
        lang
      };

      // Add subtype to object data so it gets saved
      if (this.form.formSchema?.subType) {
        // Sub type is not set yet, if the object is created
        if (!this.form.objectData.subType) {
          this.form.objectData.subType = { [this.domainId]: this.form.formSchema?.subType };
        } else {
          this.form.objectData.subType[this.domainId] = this.form.formSchema?.subType;
        }
      }

      // Add domain to object data so it gets saved
      const domainObject = { targetUri: `/domains/${this.domainId}` };
      if (!this.form.objectData.domains) {
        this.form.objectData.domains = [domainObject];
      } else {
        this.form.objectData.domains.push(domainObject);
      }
    } else {
      throw new Error('Object Type is not defined in FormSchema');
    }
    this.alert.value = false;
  },
  head(): any {
    return {
      title: this.title
    };
  },
  computed: {
    title(): string {
      const entity = this.$fetchState.pending ? this.$t('breadcrumbs.forms') : this.form.objectData.displayName;
      return [entity, ...(this.isRevision ? [`(${this.$t('revision')} ${this.revisionVersion})`] : []), '-', this.$t('breadcrumbs.forms')].join(' ');
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    },
    unitRoute(): string {
      return this.$route.params.unit;
    },
    formId(): string {
      return separateUUIDParam(this.$route.params.form).id;
    },
    formRoute(): string {
      return this.$route.params.form;
    },
    objectId(): string {
      return separateUUIDParam(this.$route.params.entity).id;
    },
    objectRoute(): string {
      return this.$route.params.entity;
    },
    canShowData(): boolean {
      const dummy = cloneDeep(this.form.objectData);
      delete dummy.displayName;
      // Object data has to fit object schema AND form schema has to fit object schema
      return this.validateRevisionSchema(dummy, false) && validate(this.form.formSchema as IVeoFormSchema, this.form.objectSchema as IVeoObjectSchema).valid;
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: async (objectType: string, searchParams: IBaseObject) => {
          const entities = await this.$api.entity.fetchAll(objectType, 1, {
            ...searchParams,
            unit: this.unitId
          });
          return entities.items;
        },
        create: async (objectType: string, createdObjectData: any) => {
          const res = await this.$api.entity.create(objectType, {
            ...createdObjectData,
            owner: {
              targetUri: `/units/${this.unitId}`
            }
          });
          // TODO: if Backend API changes response to the created object, return only "this.$api[objectType].create(...)" from above
          return this.$api.entity.fetch(objectType, res.resourceId);
        },
        update: (objectType: string, updatedObjectData: any) => {
          return this.$api.entity.update(objectType, this.objectId, updatedObjectData);
        },
        delete: (objectType: string, id: string) => {
          this.$api.entity.delete(objectType, id);
        }
      };
    },
    formSchemaHasGroups(): boolean {
      if (this.form.formSchema?.content.elements) {
        return this.form.formSchema?.content?.elements?.findIndex((element: any) => (element.type === 'Layout' || element.type === 'Group') && element.options.label) > -1;
      } else {
        return false;
      }
    },
    saveBtnText(): string {
      return this.$t('global.button.apply').toString();
    }
  },
  methods: {
    doDiscard() {
      this.formModified.isModified = false;
      this.$router.go(-1);
    },
    async onClick() {
      this.saveBtnLoading = true;
      this.formatObjectData();
      if (this.objectType) {
        await this.onSave().finally(() => {
          this.saveBtnLoading = false;
        });
      } else {
        throw new Error('Object Type is not defined in FormSchema');
      }
    },
    onSave(): Promise<void> {
      return this.$api.entity
        .update(this.objectType, this.objectId, this.form.objectData as IVeoEntity)
        .then(() => {
          this.formModified.isModified = false;
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') });
          this.$router.push({
            path: `/${this.unitRoute}/domains/${this.$route.params.domain}/forms/${this.formRoute}/`
          });
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name);
        });
    },
    showError(status: number, message: string) {
      if (status === 412) {
        this.alert.text = this.$t('global.appstate.alert.object_modified').toString();
        this.alert.saveButtonText = this.$t('global.button.no').toString();
      } else {
        this.alert.text = message;
        this.alert.saveButtonText = this.$t('global.button.ok').toString();
      }
      this.alert.error = status;
      this.alert.value = true;
    },
    formatObjectData() {
      // TODO: find better solution
      //  Add Keys and IDs manually
      if (this.form.objectData.customAspects) {
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = {
            ...this.form.objectData.customAspects[key],
            id: '00000000-0000-0000-0000-000000000000',
            type: key
          };
        });
      }

      if (this.form.objectData.links) {
        Object.keys(this.form.objectData.links).forEach((key: string) => {
          if (!this.form.objectData.links[key]) {
            delete this.form.objectData.links[key];
          } else {
            // this.form.objectData.links[key] = { ...this.form.objectData.links[key], type: key }
            this.form.objectData.links[key] = this.form.objectData.links[key].map((el: any) => {
              // el.target.type = el.target.type?.replace(/^\w/, (c: any) => c.toUpperCase())
              el.name = key;
              // el.type = key
              return el;
            });
          }
        });
      }
    },
    showRevision(_event: any, revision: IVeoObjectHistoryEntry, isRevision: boolean, allowRestoration: boolean = false) {
      const content = revision.content;

      // show modified dialog before switching versions if needed
      if (this.formModified.isModified) {
        this.revisionCache = content; // cache revision for use after modified-dialog is closed with "yes"
        this.formModified.revisionDialog = true;
      } else {
        if (isRevision && !this.validateRevisionSchema(content)) {
          return;
        }
        // fill form with revision or newest data
        this.isRevision = isRevision;
        this.revisionVersion = revision.changeNumber;
        this.allowRestoration = allowRestoration;

        // @ts-ignore
        content.$etag = this.form.objectData.$etag; // We have to give the etag to the new object in order to make it saveable
        this.form.objectData = content; // show revision content in form
        this.form.objectData.displayName = `${content.abbreviation || ''} ${content.name}`;
      }
    },
    showRevisionAfterDialog() {
      // close dialog without action if revision schema is invalid
      if (!this.validateRevisionSchema(this.revisionCache)) {
        this.formModified.revisionDialog = false;
        return;
      }
      // fill form with cached revision data and clsoe dialog
      this.isRevision = true;
      this.form.objectData = this.revisionCache;
      this.formModified.revisionDialog = false;
      this.formModified.isModified = false;
    },
    validateRevisionSchema(revision: IBaseObject, showError: boolean = true) {
      const validator = new ObjectSchemaValidator();

      delete revision.displayName;
      const isValid = validator.fitsObjectSchema(this.form.objectSchema, revision);
      if (!isValid && showError) {
        this.showError(500, this.$t('revision_incompatible').toString());
      }
      return isValid;
    }
  }
});
</script>

<i18n>
{
  "en": {
    "history": "History",
    "incompatibleFormSchema": "The form is incompatible to the object schema \"{objectType}\" and cannot be displayed!",
    "navigation.title": "Contents",
    "object_delete_error": "Failed to delete object",
    "object_saved": "Object saved successfully",
    "scope_delete_error": "Failed to delete scope",
    "restore": "Restore",
    "revision": "version",
    "revision_incompatible": "The revision is incompatible to the schema and cannot be shown."
  },
  "de": {
    "history": "Verlauf",
    "incompatibleFormSchema": "Das Formular ist inkompatibel zum Objektschema \"{objectType}\" und kann deshalb nicht angezeigt werden!",
    "navigation.title": "Inhalt",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_saved": "Objekt wurde gespeichert!",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "restore": "Wiederherstellen",
    "revision": "Version",
    "revision_incompatible": "Die Version ist inkompatibel zum Schema und kann daher nicht angezeigt werden."
  }
}
</i18n>
