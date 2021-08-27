<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router/types/index';
import { upperFirst } from 'lodash';

import VeoEditFormPage, { IValidationErrorMessage } from '~/pages/_unit/domains/_domain/forms/_form/_entity.vue';
import { IForm, separateUUIDParam } from '~/lib/utils';

import { IVeoEventPayload } from '~/types/VeoGlobalEvents';

interface IData {
  objectType: string | undefined;
  form: IForm;
  errorMessages: IValidationErrorMessage[];
  saveBtnLoading: boolean;
  alert: IVeoEventPayload & { value: boolean; error: number };
  contentsCollapsed: boolean;
  formModified: {
    isModified: boolean;
    dialog: boolean;
    target?: Route;
  };
}

export default Vue.extend({
  name: 'VeoFormsObjectDataCreate',
  extends: VeoEditFormPage,
  data(): IData {
    return {
      objectType: undefined,
      form: {
        objectSchema: {},
        objectData: {},
        formSchema: undefined,
        lang: {}
      },
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
        target: undefined
      }
    };
  },
  head(): any {
    return {
      title: this.title
    };
  },
  computed: {
    title(): string {
      return this.$fetchState.pending
        ? this.$t('create_form').toString()
        : this.$t('create_form_type', { type: upperFirst(this.form.formSchema?.name[this.$i18n.locale]) }).toString();
    },
    unitId(): string {
      return separateUUIDParam(this.$route.params.unit).id;
    }
  },
  methods: {
    onSave(): Promise<void> {
      return this.$api.entity
        .create(this.objectType || '', this.form.objectData)
        .then(() => {
          this.formModified.isModified = false;
          this.$router.push(`/${this.$route.params.unit}/domains/${this.$route.params.domain}/forms/${this.$route.params.form}`);
        })
        .catch((error: { status: number; name: string }) => {
          this.alert.text = error.name;
          this.alert.saveButtonText = this.$t('global.button.ok') as string;
          this.alert.error = 0;
          this.alert.value = true;
        });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "create_form": "Create object",
    "create_form_type": "Create {type}"
  },
  "de": {
    "create_form": "Objekt erstellen",
    "create_form_type": "{type} erstellen"
  }
}
</i18n>
