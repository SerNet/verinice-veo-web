<template>
  <VeoDialog
    v-model="dialog"
    :headline="$t('welcome')"
  >
    <template #default>
      <div class="d-flex flex-column align-center">
        <svg
          viewBox="0 0 28 22"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style="height: 100px"
        >
          <g
            stroke="none"
            stroke-width="1"
            fill="none"
            fill-rule="evenodd"
          >
            <path
              id="v."
              d="M10.1757812,21.390625 L9.19921875,21.390625 L0.234375,0.0234375 L4.296875,0.0234375 L9.82421875,14.671875 L15.46875,0.0234375 L19.3554688,0.0234375 L10.1757812,21.390625 Z M21.1328125,15.5117188 C21.9401082,15.5117188 22.6302055,15.7981742 23.203125,16.3710938 C23.7760445,16.9440133 24.0625,17.6341105 24.0625,18.4414062 C24.0625,19.248702 23.7760445,19.9420544 23.203125,20.5214844 C22.6302055,21.1009144 21.9401082,21.390625 21.1328125,21.390625 C20.3255168,21.390625 19.6354195,21.1009144 19.0625,20.5214844 C18.4895805,19.9420544 18.203125,19.248702 18.203125,18.4414062 C18.203125,17.6341105 18.4895805,16.9440133 19.0625,16.3710938 C19.6354195,15.7981742 20.3255168,15.5117188 21.1328125,15.5117188 Z"
              fill="#E53935"
            />
          </g>
        </svg>
        <p class="mx-4 mt-8 text-justify">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
        </p>
      </div>
    </template>
    <template #dialog-options>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="dialog = false"
      >
        {{ $t('go') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import Vue from 'vue';
import LocalStorage from '~/util/LocalStorage';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(value: boolean) {
        if (!value) {
          LocalStorage.firstStepsCompleted = true;
        }
        this.$emit('input', false);
      }
    }
  }
});
</script>

<i18n>
{
  "en": {
    "go": "Lets go!",
    "welcome": "Welcome to verinice."
  },
  "de": {
    "go": "Los gehts!",
    "welcome": "Willkommen bei verinice."
  }
}
</i18n>