<template>
  <VeoPageWrapper>
    <template #default>
      <VeoPage
        absolute-size
        :cols="12"
        :md="8"
        :xl="8"
        sticky-header
        :title="objectTitle"
        :loading="$fetchState.pending"
      >
        <template #default>
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
            <v-btn
              v-if="!isRevision"
              color="primary"
              outlined
              :disabled="$fetchState.pending"
              :loading="saveBtnLoading"
              @click="doSaveEntity"
            >
              {{ $t('global.button.save') }}
            </v-btn>
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
            <v-btn
              v-if="!isRevision"
              color="primary"
              outlined
              :disabled="$fetchState.pending"
              :loading="saveBtnLoading"
              @click="doSaveEntity($event, true)"
            >
              {{ $t('global.button.save_quit') }}
            </v-btn>
          </VeoEntityDisplayOptions>
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
        :cols="12"
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
              :loading="$fetchState.pending"
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
import { upperFirst } from 'lodash';
import { Route } from 'vue-router/types/index';

import { IBaseObject, IForm, separateUUIDParam } from '~/lib/utils';
import { IValidationErrorMessage } from '~/pages/_unit/domains/_domain/forms/_form/_entity.vue';
import { IVeoEventPayload, VeoEvents, ALERT_TYPE } from '~/types/VeoGlobalEvents';
import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import ObjectSchemaValidator from '~/lib/ObjectSchemaValidator';
import VeoReactiveFormActionMixin from '~/mixins/objects/VeoReactiveFormActionMixin';

interface IData {
  form: IForm;
  isValid: boolean;
  isRevision: boolean;
  allowRestoration: boolean;
  revisionVersion: number;
  revisionCache: IBaseObject;
  errorMessages: IValidationErrorMessage[];
  saveBtnLoading: boolean;
  alert: IVeoEventPayload & { value: boolean; error: number };
  entityModified: {
    isModified: boolean;
    dialog: boolean;
    revisionDialog: boolean;
    target?: any;
  };
  alertType: ALERT_TYPE;
  restoreDialogVisible: boolean;
}

export default Vue.extend({
  name: 'VeoScopesEditPage',
  mixins: [VeoReactiveFormActionMixin],
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
      alert: {
        value: false,
        text: '',
        type: 0,
        title: this.$t('error.title') as string,
        saveButtonText: this.$t('global.button.no') as string,
        error: 0 as number
      },
      entityModified: {
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
    const objectSchema = await this.$api.schema.fetch(this.entityType);
    const { lang } = await this.$api.translation.fetch(['de', 'en']);
    this.isRevision = false;
    this.entityModified.isModified = false;

    const objectData = await this.$api.entity.fetch(this.entityType, this.entityId);

    this.form = {
      objectSchema,
      objectData,
      lang
    };
    this.alert.value = false;
  },
  head(): any {
    return {
      title: this.objectTitle
    };
  },
  computed: {
    objectTitle(): string {
      return [
        this.$t('edit_object', {
          title: this.$fetchState.pending ? upperFirst(this.entityType) : this.form.objectData.displayName
        }),
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
    }
  },
  methods: {
    doDiscard() {
      this.$router.go(-1);
    },
    doSaveEntity(_event: any, redirect: boolean = false) {
      this.saveBtnLoading = true;
      this.formatObjectData();

      this.$api.entity
        .update(this.entityType, this.entityId, this.form.objectData as IVeoEntity)
        .then(() => {
          this.entityModified.isModified = false;
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') });

          if (redirect) {
            this.$router.back();
          } else {
            this.$fetch();
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
    },
    showRevision(_event: any, revision: IVeoObjectHistoryEntry, isRevision: boolean) {
      const content = revision.content;

      // show modified dialog before switching versions if needed
      if (this.entityModified.isModified) {
        this.revisionCache = content; // cache revision for use after modified-dialog is closed with "yes"
        this.entityModified.revisionDialog = true;
      } else {
        if (isRevision && !this.validateRevisionSchema(content)) {
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
      if (!this.validateRevisionSchema(this.revisionCache)) {
        this.entityModified.revisionDialog = false;
        return;
      }
      // fill form with cached revision data and close dialog
      this.isRevision = true;
      this.form.objectData = this.revisionCache;
      this.entityModified.revisionDialog = false;
      this.entityModified.isModified = false;
    },
    validateRevisionSchema(revision: IBaseObject) {
      const validator = new ObjectSchemaValidator();

      delete revision.displayName;
      const isValid = validator.fitsObjectSchema(this.form.objectSchema, revision);
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
    "edit_object": "Edit \"{title}\"",
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
    "edit_object": "\"{title}\" bearbeiten",
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
