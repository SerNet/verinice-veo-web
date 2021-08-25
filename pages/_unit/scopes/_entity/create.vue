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
  <VeoPage
    v-else-if="!!entityType"
    absolute-size
    fullsize
    sticky-header
  >
    <template #header>
      <v-row>
        <v-col>
          <h1>{{ $t('object_create', { type: formattedEntityType }) }}</h1>
        </v-col>
        <v-spacer />
        <v-col class="text-right">
          <v-btn
            outlined
            @click="doDiscard"
          >
            {{ $t('global.button.discard') }}
          </v-btn>
          <v-tooltip
            top
            :disabled="$fetchState.pending || isValid"
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
                  @click="save"
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
            color="primary"
            outlined
            :disabled="$fetchState.pending || !entityModified.isModified"
            :loading="saveBtnLoading"
            @click="save($event, true)"
          >
            {{ $t('global.button.save_quit') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #default>
      <VeoForm
        v-model="form.objectData"
        :schema="form.objectSchema"
        :general-translation="form.lang && form.lang[$i18n.locale]"
        :is-valid.sync="isValid"
        :error-messages.sync="errorMessages"
        class="mb-8"
        @input="entityModified.isModified = true"
      />
      <VeoEntityModifiedDialog
        v-model="entityModified.dialog"
        :item="form.objectData"
        @exit="$router.push(entityModified.target)"
      />
      <VeoWindowUnloadPrevention :value="entityModified.isModified" />
    </template>
  </VeoPage>
  <VeoPage
    v-else
    fullsize
  >
    <template #default>
      <v-row class="fill-height flex-column text-center align-center">
        <v-spacer />
        <v-col>
          <v-icon
            style="font-size: 8rem; opacity: 0.5;"
            color="primary"
          >
            mdi-information-outline
          </v-icon>
        </v-col>
        <v-col
          cols="auto"
          class="text-left"
        >
          <h3>{{ $t('error.title') }}:</h3>
          <p>{{ $t('no_type') }}</p>
          <nuxt-link :to="backLink">
            {{ $t('global.button.previous') }}
          </nuxt-link>
        </v-col>
        <v-spacer />
      </v-row>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router/types/index';

import { capitalize } from 'lodash';
import { createUUIDUrlParam, IForm, separateUUIDParam } from '~/lib/utils';
import { IValidationErrorMessage } from '~/pages/_unit/domains/_domain/forms/_form/_entity.vue';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoAPIMessage } from '~/types/VeoTypes';
import VeoReactiveFormActionMixin from '~/mixins/objects/VeoReactiveFormActionMixin';

export default Vue.extend({
  name: 'VeoScopesCreatePage',
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
  data() {
    return {
      form: {
        objectSchema: {},
        objectData: {},
        lang: {}
      } as IForm,
      isValid: true as boolean,
      errorMessages: [] as IValidationErrorMessage[],
      saveBtnLoading: false as boolean,
      entityModified: {
        isModified: false as boolean,
        dialog: false as boolean,
        target: undefined as any
      },
      schemas: [] as IVeoSchemaEndpoint[]
    };
  },
  async fetch() {
    if (this.entityType) {
      const objectSchema = await this.$api.schema.fetch(this.entityType);
      const { lang } = await this.$api.translation.fetch(['de', 'en']);
      const objectData = {
        owner: {
          targetUri: `/units/${this.unitID}`
        },
        designator: '' // Needed for form validation
      };

      this.form = {
        objectSchema,
        objectData,
        lang
      };
    }
    this.schemas = await this.$api.schema.fetchAll();
  },
  head(): any {
    return {
      title: this.title
    };
  },
  computed: {
    title(): string {
      return this.$fetchState.pending
        ? this.$t('breadcrumbs.scopes').toString()
        : `${this.$t('object_create', { type: this.formattedEntityType })} - ${this.$t('breadcrumbs.scopes')}`;
    },
    parentId(): string {
      return separateUUIDParam(this.$route.params.entity).id;
    },
    parentType(): string {
      return separateUUIDParam(this.$route.params.entity).type;
    },
    unitID(): string {
      return separateUUIDParam(this.$route.params.unit).id;
    },
    entityType(): string {
      return this.$route.query.based_on as string;
    },
    formattedEntityType(): string {
      return capitalize(this.entityType);
    },
    backLink(): string {
      const url = this.$route.fullPath.split('/');
      url.pop();
      return url.join('/');
    }
  },
  methods: {
    doDiscard() {
      this.entityModified.isModified = false;
      this.$router.go(-1);
    },
    async save(_event: any, redirect: boolean = false) {
      this.saveBtnLoading = true;
      this.formatObjectData();

      await this.$api.entity
        .create(this.entityType, {
          ...this.form.objectData,
          // @ts-ignore
          owner: {
            targetUri: `/units/${this.unitID}`
          }
        })
        .then(async (data: IVeoAPIMessage) => {
          this.entityModified.isModified = false;
          this.$root.$emit(VeoEvents.SNACKBAR_SUCCESS, { text: this.$t('object_saved') });
          if (this.parentId !== '-') {
            const parent = await this.$api.entity.fetch(this.parentType, this.parentId);

            if (this.parentType === 'scope') {
              // @ts-ignore
              parent.members.push({
                targetUri: `/${getSchemaEndpoint(this.schemas, this.entityType)}/${data.resourceId}`
              });
            } else {
              // @ts-ignore
              parent.parts.push({
                targetUri: `/${getSchemaEndpoint(this.schemas, this.entityType)}/${data.resourceId}`
              });
            }

            this.$api.entity.update(this.parentType, parent.id, parent).finally(() => {
              this.redirect(redirect, data.resourceId);
            });
          } else {
            this.redirect(redirect, data.resourceId);
          }
        })
        .finally(() => {
          this.saveBtnLoading = false;
        });
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
    // Either redirect the user back (save and close) or redirect him to the new entity (save)
    async redirect(close: boolean, target?: string) {
      if (close) {
        this.$router.push(this.backLink);
      } else if (target) {
        const endpoint = getSchemaEndpoint(await this.$api.schema.fetchAll(), this.entityType);
        this.$router.replace({
          name: `unit-${this.entityType === 'scope' ? 'scopes' : 'objects'}-type-entity-edit`,
          params: {
            type: endpoint || '',
            unit: this.$route.params.unit,
            entity: createUUIDUrlParam(this.entityType, target)
          }
        });
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "no_type": "There is no type set for the new object. Please try again.",
    "object_create": "Create {type}",
    "object_saved": "Object saved successfully"
  },
  "de": {
    "no_type": "Es wurde kein Typ für das neue Objekt festgelegt. Bitte versuchen Sie es erneut.",
    "object_create": "{type} erstellen",
    "object_saved": "Objekt wurde gespeichert!"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>
