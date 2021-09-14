<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Markus Werner, Jonas Heitmann, Jessica Lühnen
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
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
        <v-row
          no-gutters
          class="justify-space-between"
        >
          <v-col
            cols="auto"
            class="mt-4"
          >
            <h1 v-if="!isRevision && form.objectData.displayName">
              {{ form.objectData.displayName }}
            </h1>
            <h1 v-else-if="!isRevision && form.formSchema">
              {{ $t('object_create', { type: form.formSchema.name[$i18n.locale] }) }}
            </h1>
            <h1 v-else>
              {{ form.objectData.displayName }} ({{ $t('revision') }} {{ revisionVersion }})
            </h1>
          </v-col>
        </v-row>
        <v-row class="mt-3">
          <v-spacer />
          <v-col
            cols="auto"
            class="text-right"
          >
            <v-btn
              outlined
              @click="doDiscard"
            >
              {{ $t('global.button.discard') }}
            </v-btn>
            <v-tooltip
              v-if="!isRevision"
              top
              :disabled="!isSaveBtnDisabled || !formModified.isModified"
            >
              <template #activator="{ on }">
                <div
                  class="d-inline-block"
                  v-on="on"
                  @click.prevent
                >
                  <v-btn
                    color="primary"
                    outlined
                    :disabled="isSaveBtnDisabled"
                    :loading="saveBtnLoading"
                    @click="onClick"
                  >
                    {{ $t('global.button.save') }}
                  </v-btn>
                </div>
              </template>
              <template #default>
                <ul>
                  <li
                    v-for="(errorMessage, key) in errorMessages"
                    :key="key"
                  >
                    {{ errorMessage.message }}
                  </li>
                </ul>
              </template>
            </v-tooltip>

            <v-btn
              v-else
              color="primary"
              outlined
              :loading="saveBtnLoading"
              @click="restoreDialogVisible = true"
            >
              {{ $t('restore') }}
            </v-btn>

            <v-tooltip
              v-if="!isRevision"
              top
              :disabled="!isSaveBtnDisabled || !formModified.isModified"
            >
              <template #activator="{ on }">
                <div
                  class="d-inline-block"
                  v-on="on"
                  @click.prevent
                >
                  <v-btn
                    color="primary"
                    outlined
                    :disabled="isSaveBtnDisabled"
                    :loading="saveBtnLoading"
                    @click="onClick($event, true)"
                  >
                    {{ $t('global.button.save_quit') }}
                  </v-btn>
                </div>
              </template>
              <template #default>
                <ul>
                  <li
                    v-for="(errorMessage, key) in errorMessages"
                    :key="key"
                  >
                    {{ errorMessage.message }}
                  </li>
                </ul>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </template>
      <template #default>
        <VeoAlert
          v-model="isRevision"
          :type="alertType"
          no-close-button
          flat
        >
          {{ $t('oldVersionAlert') }}
        </VeoAlert>
        <VeoForm
          v-if="validation.valid"
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
          <VeoValidationResultList
            :result="validation"
            show-warnings
            class="mt-4"
          />
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
        <VeoObjectRestoreDialog
          v-model="restoreDialogVisible"
          :version="revisionVersion"
          :object="form.objectData"
          @restored="onRestored"
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
              :loading="$fetchState.pending || saveBtnLoading"
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
import ObjectSchemaValidator, { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils';
import { IVeoEventPayload, VeoEvents, ALERT_TYPE } from '~/types/VeoGlobalEvents';
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
  alertType: ALERT_TYPE;
  restoreDialogVisible: boolean;
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
      },
      alertType: ALERT_TYPE.INFO,
      restoreDialogVisible: false
    };
  },
  async fetch() {
    const formSchema = await this.$api.form.fetch(this.formId);
    this.isRevision = false;
    this.formModified.isModified = false;

    this.objectType = formSchema.modelType;
    if (this.objectType) {
      const objectSchema = await this.$api.schema.fetch(this.objectType);
      const objectData = this.$route.params.entity
        ? await this.$api.entity.fetch(this.objectType, this.objectId)
        : {
            owner: {
              targetUri: `/units/${this.unitId}`
            },
            designator: '', // Needed for form validation
            ...(this.objectType === 'process' ? { status: 'NEW' } : {})
          };
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
    formschemaValidation(): VeoSchemaValidatorValidationResult {
      return validate(this.form.formSchema as IVeoFormSchema, this.form.objectSchema as IVeoObjectSchema);
    },
    validation(): VeoSchemaValidatorValidationResult {
      const dummy = cloneDeep(this.form.objectData);
      delete dummy.displayName;
      const revisionValidation = this.validateRevisionSchema(dummy, false);

      return {
        valid: this.formschemaValidation.valid && revisionValidation.valid,
        warnings: [...this.formschemaValidation.warnings, ...revisionValidation.warnings],
        errors: [...this.formschemaValidation.errors, ...revisionValidation.errors]
      };
    },
    isSaveBtnDisabled(): boolean {
      return this.$fetchState.pending || !this.formModified.isModified || !this.isValid;
    },
    dynamicAPI(): any {
      // TODO: adjust this dynamicAPI so that it provided directly by $api
      return {
        fetchAll: async (objectType: string, searchParams: IBaseObject) => {
          const entities = await this.$api.entity.fetchAll(objectType, 1, {
            ...searchParams,
            unit: this.unitId
          });
          return entities;
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
        update: async (objectType: string, updatedObjectData: any) => {
          // This fixes 400 Bad Request errors when a user updates existing Object item from the list in LinksField
          // TODO: This is a workaround because $etag is needed to fix this bug. Check if it can be solved better in the future
          const entityWithETag: any = await this.$api.entity.fetch(objectType, updatedObjectData.id);
          Object.entries(updatedObjectData).forEach(([key, value]) => (entityWithETag[key] = value));

          return this.$api.entity.update(objectType, updatedObjectData.id, entityWithETag);
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
    }
  },
  methods: {
    doDiscard() {
      this.$router.go(-1);
    },
    async onClick(event: any, redirect: boolean = false) {
      this.saveBtnLoading = true;
      this.formatObjectData();
      if (this.objectType) {
        await this.onSave(event, redirect).finally(() => {
          this.saveBtnLoading = false;
        });
      } else {
        throw new Error('Object Type is not defined in FormSchema');
      }
    },
    onSave(_event: any, redirect: boolean = false): Promise<void> {
      return this.$api.entity
        .update(this.objectType, this.objectId, this.form.objectData as IVeoEntity)
        .then(async (updatedObjectData) => {
          this.formModified.isModified = false;
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') });

          // When entity.displayName changes, breadCrumbsCache of the entity should be updated
          const breadCrumbsCache = sessionStorage.getItem(this.objectId);
          if (breadCrumbsCache && breadCrumbsCache !== updatedObjectData.displayName) {
            sessionStorage.setItem(this.objectId, updatedObjectData.displayName);
            this.$root.$emit(VeoEvents.ENTITY_UPDATED, updatedObjectData);
          }

          if (redirect) {
            this.$router.push({
              path: `/${this.unitRoute}/domains/${this.$route.params.domain}/forms/${this.formRoute}/`
            });
          } else {
            await new Promise((resolve) => {
              setTimeout(() => {
                this.$fetch();
                resolve(true);
              }, 1000);
            });
          }
        })
        .catch((error: { status: number; name: string }) => {
          this.showError(error.status, error.name);
        });
    },
    onRestored() {
      this.restoreDialogVisible = false;
      this.$fetch();
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
    showRevision(_event: any, revision: IVeoObjectHistoryEntry, isRevision: boolean) {
      // Clone deep to avoid modiying the history and altering persisted state (won't change anything in the backend, but we want clean state)
      const content = cloneDeep(revision.content);

      // show modified dialog before switching versions if needed
      if (this.formModified.isModified) {
        this.revisionCache = content; // cache revision for use after modified-dialog is closed with "yes"
        this.formModified.revisionDialog = true;
      } else {
        if (isRevision && !this.validateRevisionSchema(content).valid) {
          return;
        }
        // fill form with revision or newest data
        this.isRevision = isRevision;
        this.revisionVersion = revision.changeNumber;

        // @ts-ignore
        content.$etag = this.form.objectData.$etag; // We have to give the etag to the new object in order to make it saveable
        this.form.objectData = content; // show revision content in form
        this.form.objectData.displayName = `${content.designator} ${content.abbreviation || ''} ${content.name}`;
      }
    },
    showRevisionAfterDialog() {
      // close dialog without action if revision schema is invalid
      if (!this.validateRevisionSchema(this.revisionCache).valid) {
        this.formModified.revisionDialog = false;
        return;
      }
      // fill form with cached revision data and clsoe dialog
      this.isRevision = true;
      this.form.objectData = this.revisionCache;
      this.formModified.revisionDialog = false;
      this.formModified.isModified = false;
    },
    validateRevisionSchema(revision: IBaseObject, showError: boolean = true): VeoSchemaValidatorValidationResult {
      delete revision.displayName;
      const isValid = ObjectSchemaValidator.fitsObjectSchema(this.form.objectSchema, revision);
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
    "object_create": "Create {type}",
    "object_delete_error": "Failed to delete object",
    "object_saved": "Object saved successfully",
    "oldVersionAlert": "You are currently viewing an old and protected version. You can only edit this version after restoring it.",
    "scope_delete_error": "Failed to delete scope",
    "restore": "Restore",
    "restore_quit": "Restore and exit",
    "revision": "version",
    "revision_incompatible": "The revision is incompatible to the schema and cannot be shown."
  },
  "de": {
    "history": "Verlauf",
    "incompatibleFormSchema": "Das Formular ist inkompatibel zum Objektschema \"{objectType}\" und kann deshalb nicht angezeigt werden!",
    "navigation.title": "Inhalt",
    "object_create": "{type} erstellen",
    "object_delete_error": "Objekt konnte nicht gelöscht werden",
    "object_saved": "Objekt wurde gespeichert!",
    "oldVersionAlert": "Ihnen wird momentan eine alte, schreibgeschützte Version angezeigt. Sie kann erst bearbeitet werden, nachdem Sie sie wiederhergestellt haben.",
    "scope_delete_error": "Scope konnte nicht gelöscht werden",
    "restore": "Wiederherstellen",
    "restore_quit": "Wiederherstellen und Schließen",
    "revision": "Version",
    "revision_incompatible": "Die Version ist inkompatibel zum Schema und kann daher nicht angezeigt werden."
  }
}
</i18n>
