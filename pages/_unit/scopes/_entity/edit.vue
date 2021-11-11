<!--
   - verinice.veo web
   - Copyright (C) 2021  Davit Svandize, Jonas Heitmann, Jessica Lühnen
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
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        absolute-size
        cols="12"
        :md="8"
        :xl="8"
        sticky-header
        :loading="$fetchState.pending"
      >
        <template #header>
          <v-row
            no-gutters
            class="justify-space-between mb-3"
          >
            <v-col
              cols="auto"
              class="mt-4"
            >
              <h1>
                {{ objectTitle }}
              </h1>
            </v-col>
          </v-row>
          <VeoEntityDisplayOptions
            :root-route="rootRoute"
            :current-entity="form.objectData"
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
              :disabled="$fetchState.pending || (!entityModified.isModified) || isValid"
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
                    :disabled="$fetchState.pending || (entityModified && !entityModified.isModified) || !isValid"
                    :loading="saveBtnLoading"
                    @click="doSaveEntity"
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
              text
              :loading="saveBtnLoading"
              @click="restoreDialogVisible = true"
            >
              {{ $t('restore') }}
            </v-btn>
            <v-tooltip
              v-if="!isRevision"
              top
              :disabled="$fetchState.pending || (!entityModified.isModified) || isValid"
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
                    :disabled="$fetchState.pending || !entityModified.isModified || !isValid"
                    :loading="saveBtnLoading"
                    @click="doSaveEntity($event, true)"
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
          </VeoEntityDisplayOptions>
        </template>
        <template #default>
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
          <div v-else>
            <VeoAlert
              v-model="isRevision"
              :type="alertType"
              no-close-button
              flat
            >
              {{ $t('oldVersionAlert') }}
            </VeoAlert>
            <VeoForm
              v-model="form.objectData"
              :schema="form.objectSchema"
              :general-translation="form.lang && form.lang[$i18n.locale]"
              :is-valid.sync="isValid"
              :error-messages.sync="errorMessages"
              class="mb-8"
              :disabled="isRevision && !allowRestoration"
              @input="entityModified.isModified = true"
            />
            <VeoObjectRestoreDialog
              v-model="restoreDialogVisible"
              :version="revisionVersion"
              :object="form.objectData"
              @restored="onRestored"
            />
            <VeoEntityModifiedDialog
              v-model="entityModified.dialog"
              :item="form.objectData"
              @exit="$router.push(entityModified.target)"
            />
            <VeoWindowUnloadPrevention :value="entityModified.isModified" />
            <!-- seperate modified dialog for version switching to avoid interferences -->
            <VeoEntityModifiedDialog
              v-model="entityModified.revisionDialog"
              :item="form.objectData"
              @exit="showRevisionAfterDialog()"
            />
          </div>
        </template>
      </VeoPage>
      <VeoPage
        absolute-size
        cols="12"
        :md="4"
        :xl="4"
      >
        <VeoTabs sticky-tabs>
          <template #tabs>
            <v-tab disabled>
              {{ $t('history') }}
            </v-tab>
          </template>
          <template #items>
            <VeoObjectHistory
              :object="form.objectData"
              :loading="$fetchState.pending || saveBtnLoading"
              @show-revision="showRevision"
            />
          </template>
        </VeoTabs>
      </VeoPage>
    </template>
  </VeoPageWrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { cloneDeep, upperFirst } from 'lodash';
import { Route } from 'vue-router/types/index';

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils';
import { IValidationErrorMessage } from '~/pages/_unit/domains/_domain/forms/_form/_entity.vue';
import { VeoAlertType } from '~/components/layout/VeoAlert.vue';
import { IVeoEventPayload, VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoEntity, IVeoObjectHistoryEntry, IVeoReactiveFormAction } from '~/types/VeoTypes';
import ObjectSchemaValidator, { VeoSchemaValidatorValidationResult } from '~/lib/ObjectSchemaValidator';
import { getPersonReactiveFormActions } from '~/components/forms/reactiveFormActions';

interface IData {
  form: IForm;
  isValid: boolean;
  isRevision: boolean;
  allowRestoration: boolean;
  revisionVersion: number;
  revisionCache: IBaseObject;
  errorMessages: IValidationErrorMessage[];
  saveBtnLoading: boolean;
  entityModified: {
    isModified: boolean;
    dialog: boolean;
    revisionDialog: boolean;
    target?: any;
  };
  alertType: VeoAlertType;
  restoreDialogVisible: boolean;
  etag?: string;
}

export default Vue.extend({
  name: 'VeoScopesEditPage',
  beforeRouteLeave(to: Route, _from: Route, next: Function) {
    // If the form was modified and the dialog is open, the user wanted to proceed with his navigation
    if (this.entityModified.isModified && this.entityModified.dialog) {
      next();
    } else if (this.entityModified.isModified) {
      // If the form was modified and the dialog is closed, show it and abort navigation
      this.entityModified.target = to;
      this.entityModified.dialog = true;
      next(false);
    } else {
      // The form wasn't modified, proceed as if this hook doesn't exist
      next();
    }
  },
  data(): IData {
    return {
      form: {
        objectSchema: {},
        objectData: {},
        lang: {}
      },
      isValid: true,
      isRevision: false,
      allowRestoration: false,
      revisionVersion: 0,
      revisionCache: {},
      errorMessages: [],
      saveBtnLoading: false,
      entityModified: {
        isModified: false,
        dialog: false,
        revisionDialog: false,
        target: undefined
      },
      alertType: ALERT_TYPE.INFO,
      restoreDialogVisible: false,
      etag: undefined as string | undefined
    };
  },
  async fetch() {
    const objectSchema = await this.$api.schema.fetch(this.entityType);
    const { lang } = await this.$api.translation.fetch(['de', 'en']);
    this.isRevision = false;
    this.entityModified.isModified = false;

    const objectData = await this.$api.entity.fetch(this.entityType, this.entityId);
    this.etag = objectData.$etag;

    this.form = {
      objectSchema,
      objectData,
      lang
    };
  },
  head(): any {
    return {
      title: this.objectTitle
    };
  },
  computed: {
    objectTitle(): string {
      return [
        this.$fetchState.pending ? upperFirst(this.entityType) : this.form.objectData.displayName,
        ...(this.isRevision ? [`(${this.$t('revision')} ${this.revisionVersion})`] : [])
      ].join(' ');
    },
    entityId(): string {
      return separateUUIDParam(this.$route.params.entity).id;
    },
    entityType(): string {
      return separateUUIDParam(this.$route.params.entity).type;
    },
    rootRoute(): string {
      return `/${this.$route.params.unit}/scopes`;
    },
    reactiveFormActions(): IVeoReactiveFormAction[] {
      return this.entityType === 'person' ? getPersonReactiveFormActions(this) : [];
    }
  },
  methods: {
    doDiscard() {
      this.$router.go(-1);
    },
    doSaveEntity(_event: any, redirect: boolean = false) {
      this.saveBtnLoading = true;
      this.formatObjectData();

      (this.form.objectData as any).$etag = this.etag;
      this.$api.entity
        .update(this.entityType, this.entityId, this.form.objectData as IVeoEntity)
        .then(async (updatedObjectData: any) => {
          this.entityModified.isModified = false;
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') });

          // When entity.displayName changes, breadCrumbsCache of the entity should be updated
          const breadCrumbsCache = sessionStorage.getItem(this.entityId);
          if (breadCrumbsCache && breadCrumbsCache !== updatedObjectData.displayName) {
            sessionStorage.setItem(this.entityId, updatedObjectData.displayName);
            this.$root.$emit(VeoEvents.ENTITY_UPDATED, updatedObjectData);
          }

          if (redirect) {
            this.$router.back();
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
        })
        .finally(() => {
          this.saveBtnLoading = false;
        });
    },
    onRestored() {
      this.restoreDialogVisible = false;
      this.$fetch();
    },
    showError(status: number, message: string) {
      if (status === 412) {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('error.title') as string,
          text: this.$t('global.appstate.alert.object_modified').toString(),
          saveButtonText: this.$t('global.button.no').toString(),
          objectModified: true
        } as IVeoEventPayload);
      } else {
        this.$root.$emit(VeoEvents.ALERT_ERROR, {
          title: this.$t('error.title') as string,
          text: message
        } as IVeoEventPayload);
      }
    },
    formatObjectData() {
      // TODO: find better solution
      //  Add Keys and IDs manually
      if (this.form.objectData.customAspects) {
        Object.keys(this.form.objectData.customAspects).forEach((key: string) => {
          this.form.objectData.customAspects[key] = {
            ...this.form.objectData.customAspects[key],
            id: '00000000-0000-0000-0000-000000000000'
          };
        });
      }
    },
    showRevision(_event: any, revision: IVeoObjectHistoryEntry, isRevision: boolean) {
      // Clone deep to avoid modiying the history and altering persisted state (won't change anything in the backend, but we want clean state)
      const content = cloneDeep(revision.content);

      // show modified dialog before switching versions if needed
      if (this.entityModified.isModified) {
        this.revisionCache = content; // cache revision for use after modified-dialog is closed with "yes"
        this.entityModified.revisionDialog = true;
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
        this.entityModified.revisionDialog = false;
        return;
      }
      // fill form with cached revision data and close dialog
      this.isRevision = true;
      this.form.objectData = this.revisionCache;
      this.entityModified.revisionDialog = false;
      this.entityModified.isModified = false;
    },
    validateRevisionSchema(revision: IBaseObject): VeoSchemaValidatorValidationResult {
      delete revision.displayName;
      const isValid = ObjectSchemaValidator.fitsObjectSchema(this.form.objectSchema, revision);
      if (!isValid) {
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
    "deleted": "Object was deleted successfully.",
    "history": "History",
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
    "deleted": "Objekt wurde erfolgreich gelöscht.",
    "history": "Verlauf",
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

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
