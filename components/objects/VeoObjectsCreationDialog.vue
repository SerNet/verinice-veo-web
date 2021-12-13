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
<div>
    <v-row>
      <v-col class="text-right">
        <v-btn
          color="primary"
          class="filter-button"
          outlined
          @click="showDialog = true"
        >
          Unterobjekt erstellen {{objectType}} {{entityType}}
        </v-btn>
      </v-col>

    </v-row>
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

    <VeoDialog
      v-else-if="!!entityType"
      v-model="showDialog"
      :headline="'Scope erstellen'"
      :persistent="true"
      :large="true"
      :fixed-footer="true"
      :fixed-header="true">
    <template #default>
      <VeoForm
        v-model="form.objectData"
        :schema="form.objectSchema"
        :general-translation="form.lang && form.lang[$i18n.locale]"
        :is-valid.sync="isValid"
        :error-messages.sync="errorMessages"
        class="mb-8"
        :reactive-form-actions="reactiveFormActions"
        @input="entityModified.isModified = true"
      />
      <VeoEntityModifiedDialog
        v-model="entityModified.dialog"
        :item="form.objectData"
        @exit="$router.push(entityModified.target)"
      />
      <VeoWindowUnloadPrevention :value="entityModified.isModified" />
    </template>

        <template #dialog-options>
      <v-row>
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
                  @click="save($event, true)"
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
  </VeoDialog>

    <VeoDialog
      v-else
      v-model="showDialog"
      :headline="'Scope erstellen'"
      :persistent="true"
      :large="true"
      :fixed-footer="true"
      :fixed-header="true">
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
          <v-btn
            color="primary"
            class="filter-button"
            outlined
            @click="showDialog = false"
          >
            Dialog schließen
          </v-btn>
        </v-col>
        <v-spacer />
      </v-row>
    </template>
  </VeoDialog>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router/types/index';

import { capitalize } from 'lodash';
import { defineComponent, ref, Ref, computed, useRoute } from '@nuxtjs/composition-api';
import { createUUIDUrlParam, IForm, separateUUIDParam } from '~/lib/utils';
import { IValidationErrorMessage } from '~/pages/_unit/domains/_domain/forms/_form/_entity.vue';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { getSchemaEndpoint, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoAPIMessage, IVeoReactiveFormAction } from '~/types/VeoTypes';
import { getPersonReactiveFormActions } from '~/components/forms/reactiveFormActions';

export default defineComponent({
  name: 'VeoScopesCreatePage',
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
  props: {
    objectType: { type: String, default: undefined, required: true }
  },
  setup() {
    const route = useRoute();

    const showDialog = ref(false) as Ref<Boolean>;
    const isValid = ref(true) as Ref<Boolean>;
    const errorMessages = ref([]) as Ref<IValidationErrorMessage[]>;
    const saveBtnLoading = ref(false) as Ref<Boolean>;
    const form = ref({ objectSchema: {}, objectData: {}, lang: {} }) as Ref<IForm>;
    const entityModified = ref({
      isModified: false as boolean,
      dialog: false as boolean,
      target: undefined as any
    });
    const schemas = ref([]) as Ref<IVeoSchemaEndpoint[]>;

    const parentId = computed(() => separateUUIDParam(route.value.params.entity).id);
    const parentType = computed(() => separateUUIDParam(route.value.params.entity).type);
    const unitID = computed(() => separateUUIDParam(route.value.params.unit).id);
    const entityType = computed(() => 'scope'); // TODO change to: this.$route.query.based_on as string;
    const formattedEntityType = computed(() => capitalize(entityType.value));
    const reactiveFormActions = computed((): IVeoReactiveFormAction[] => (entityType.value === 'person' ? getPersonReactiveFormActions(this) : []));

    return {
      showDialog,
      isValid,
      errorMessages,
      saveBtnLoading,
      form,
      entityModified,
      schemas,
      parentId,
      parentType,
      unitID,
      entityType,
      formattedEntityType,
      reactiveFormActions
    };
  },

  async fetch() {
    if (this.entityType) {
      const currentDomain = this.$user.lastDomain ? [this.$user.lastDomain] : undefined;
      const objectSchema = await this.$api.schema.fetch(this.entityType, currentDomain);
      const { lang } = await this.$api.translation.fetch(['de', 'en']);
      const objectData = {
        owner: {
          targetUri: `${this.$config.apiUrl}/units/${this.unitID}`
        },
        designator: '', // Needed for form validation
        _self: 'http://example.com'
      };

      this.form = {
        objectSchema,
        objectData,
        lang
      };
    }
    this.schemas = await this.$api.schema.fetchAll();
  },
  computed: {
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
            targetUri: `${this.$config.apiUrl}/units/${this.unitID}`
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
            id: '00000000-0000-0000-0000-000000000000'
          };
        });
      }
      delete this.form.objectData._self;
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



